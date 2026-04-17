import { createServerFn } from "@tanstack/react-start";
import { ensureSession } from "./auth.functions";
import { db } from "../server/db/index.server";
import { documentationTypes, documentations as documentationTable, repositories } from "#/lib/server/db/schema.server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { enqueueJob } from "../server/jobs/index.server";

export const getDocumentations = createServerFn({ method: "GET" }).handler(async () => {
  const session = await ensureSession();

  const documentations = await db
    .select()
    .from(documentationTable)
    .where(eq(documentationTable.userId, session.user.id))
    .innerJoin(documentationTypes, eq(documentationTable.documentationTypeId, documentationTypes.id));

  return documentations;
});

export const getDocumentationTypes = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSession();

  return db.select().from(documentationTypes);
});

export const createDocumentation = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      documentationTypeId: z.string(),
      repositories: z.array(
        z.object({
          url: z.string().url().refine((url) => url.startsWith("https://"), {
            message: "Repository URL must use HTTPS",
          }),
          branch: z.string(),
        }),
      ),
    }),
  )
  .handler(async ({ data }) => {
    const session = await ensureSession();

    const generateSlug = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    };

    const generateUniqueSlug = async (baseSlug: string): Promise<string> => {
      let slug = baseSlug;
      let suffix = 1;

      while (true) {
        const existing = await db
          .select({ id: documentationTable.id })
          .from(documentationTable)
          .where(eq(documentationTable.slug, slug))
          .limit(1);

        if (existing.length === 0) {
          return slug;
        }

        slug = `${baseSlug}-${suffix}`;
        suffix++;
      }
    };

    const baseSlug = generateSlug(data.name);
    const uniqueSlug = await generateUniqueSlug(baseSlug);

    const [documentation] = await db
      .insert(documentationTable)
      .values({
        userId: session.user.id,
        name: data.name,
        slug: uniqueSlug,
        description: data.description,
        documentationTypeId: data.documentationTypeId,
        isGenerated: false,
      })
      .returning();

    if (!documentation) {
      throw new Error("Failed to create documentation");
    }

    for (const repo of data.repositories) {
      await db.insert(repositories).values({
        documentationId: documentation.id,
        url: repo.url,
        branch: repo.branch,
      });
    }

    const [docType] = await db
      .select({ systemPrompt: documentationTypes.systemPrompt })
      .from(documentationTypes)
      .where(eq(documentationTypes.id, data.documentationTypeId))
      .limit(1);

    if (!docType) {
      throw new Error("Documentation type not found");
    }

    const job = await enqueueJob({
      documentationId: documentation.id,
      repositories: data.repositories,
      documentationType: data.documentationTypeId,
      systemPrompt: docType.systemPrompt,
    });

    return { documentation, job };
  });

type GitHubBranch = { name: string };

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/\s#?]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

export const getRepoBranches = createServerFn({ method: "GET" })
  .inputValidator(z.string())
  .handler(async ({ data }) => {
    await ensureSession();

    const parsed = parseGitHubUrl(data);
    if (!parsed) return [];

    const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/branches`, {
      headers: { "User-Agent": "archon" },
    });
    if (!res.ok) return [];

    const branches: GitHubBranch[] = await res.json();
    return branches.map((b: GitHubBranch) => b.name);
  });
