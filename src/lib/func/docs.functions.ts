import { createServerFn } from "@tanstack/react-start";
import { ensureSession, getSession } from "./auth.functions";
import { db } from "../server/db/index.server";
import {
  documentationTypes,
  documentations as documentationTable,
  repositories,
  documentationPages,
  documentationJobs,
} from "#/lib/server/db/schema.server";
import { eq, and, asc, desc } from "drizzle-orm";
import { z } from "zod";
import { enqueueJob } from "../server/jobs/index.server";
import { renderMarkdown } from "../utils/markdown";
import { generateSlug } from "../utils";

export const getDocumentations = createServerFn({ method: "GET" }).handler(async () => {
  const session = await ensureSession();

  const documentations = await db
    .select()
    .from(documentationTable)
    .where(eq(documentationTable.userId, session.user.id))
    .innerJoin(
      documentationTypes,
      eq(documentationTable.documentationTypeId, documentationTypes.id),
    );

  const ungeneratedIds = documentations
    .filter((d) => !d.documentation.isGenerated)
    .map((d) => d.documentation.id);

  const jobStatuses: Record<string, string> = {};

  if (ungeneratedIds.length > 0) {
    for (const docId of ungeneratedIds) {
      const [job] = await db
        .select({ status: documentationJobs.status })
        .from(documentationJobs)
        .where(eq(documentationJobs.documentationId, docId))
        .orderBy(desc(documentationJobs.createdAt))
        .limit(1);
      if (job) jobStatuses[docId] = job.status;
    }
  }

  return documentations.map((d) => ({
    ...d,
    jobStatus: (jobStatuses[d.documentation.id] ?? null) as string | null,
  }));
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
          url: z
            .string()
            .url()
            .refine((url) => url.startsWith("https://"), {
              message: "Repository URL must use HTTPS",
            }),
          branch: z.string(),
        }),
      ),
    }),
  )
  .handler(async ({ data }) => {
    const session = await ensureSession();

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

    const res = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/branches`,
      {
        headers: { "User-Agent": "archon" },
      },
    );
    if (!res.ok) return [];

    const branches: GitHubBranch[] = await res.json();
    return branches.map((b: GitHubBranch) => b.name);
  });

export const getDocumentationBySlug = createServerFn({ method: "GET" })
  .inputValidator(z.string())
  .handler(async ({ data }) => {
    const session = await getSession();

    const [documentation] = await db
      .select({
        id: documentationTable.id,
        name: documentationTable.name,
        slug: documentationTable.slug,
        description: documentationTable.description,
        isGenerated: documentationTable.isGenerated,
        isPublic: documentationTable.isPublic,
        userId: documentationTable.userId,
        documentationTypeId: documentationTable.documentationTypeId,
      })
      .from(documentationTable)
      .where(eq(documentationTable.slug, data))
      .limit(1);

    if (!documentation) {
      return null;
    }

    const isOwner = session?.user?.id === documentation.userId;
    if (!documentation.isPublic && !isOwner) {
      return null;
    }

    const pages = await db
      .select({
        id: documentationPages.id,
        type: documentationPages.type,
        parentId: documentationPages.parentId,
        title: documentationPages.title,
        slug: documentationPages.slug,
        content: documentationPages.content,
        order: documentationPages.order,
      })
      .from(documentationPages)
      .where(eq(documentationPages.documentationId, documentation.id))
      .orderBy(asc(documentationPages.order));

    const latestJob = await db
      .select({
        status: documentationJobs.status,
      })
      .from(documentationJobs)
      .where(eq(documentationJobs.documentationId, documentation.id))
      .orderBy(documentationJobs.createdAt)
      .limit(1);

    return {
      ...documentation,
      pages,
      isOwner,
      jobStatus: latestJob[0]?.status ?? null,
    };
  });

export const getDocumentationPageBySlug = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      documentationSlug: z.string(),
      pageSlug: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const session = await getSession();

    const [documentation] = await db
      .select({
        id: documentationTable.id,
        name: documentationTable.name,
        slug: documentationTable.slug,
        description: documentationTable.description,
        isGenerated: documentationTable.isGenerated,
        isPublic: documentationTable.isPublic,
        userId: documentationTable.userId,
      })
      .from(documentationTable)
      .where(eq(documentationTable.slug, data.documentationSlug))
      .limit(1);

    if (!documentation) {
      return null;
    }

    const isOwner = session?.user?.id === documentation.userId;
    if (!documentation.isPublic && !isOwner) {
      return null;
    }

    const [page] = await db
      .select({
        id: documentationPages.id,
        type: documentationPages.type,
        parentId: documentationPages.parentId,
        title: documentationPages.title,
        slug: documentationPages.slug,
        content: documentationPages.content,
        order: documentationPages.order,
      })
      .from(documentationPages)
      .where(
        and(
          eq(documentationPages.documentationId, documentation.id),
          eq(documentationPages.slug, data.pageSlug),
        ),
      )
      .limit(1);

    if (!page) {
      return null;
    }

    const allPages = await db
      .select({
        id: documentationPages.id,
        type: documentationPages.type,
        parentId: documentationPages.parentId,
        title: documentationPages.title,
        slug: documentationPages.slug,
        order: documentationPages.order,
      })
      .from(documentationPages)
      .where(eq(documentationPages.documentationId, documentation.id))
      .orderBy(asc(documentationPages.order));

    const latestJob = await db
      .select({
        status: documentationJobs.status,
      })
      .from(documentationJobs)
      .where(eq(documentationJobs.documentationId, documentation.id))
      .orderBy(documentationJobs.createdAt)
      .limit(1);

    return {
      documentation: {
        ...documentation,
        isOwner,
      },
      page: {
        ...page,
        contentHtml: page.content ? renderMarkdown(page.content) : null,
      },
      pages: allPages,
      jobStatus: latestJob[0]?.status ?? null,
    };
  });

export const getDocumentationForEdit = createServerFn({ method: "GET" })
  .inputValidator(z.string())
  .handler(async ({ data: documentationId }) => {
    const session = await ensureSession();

    const [documentation] = await db
      .select({
        id: documentationTable.id,
        name: documentationTable.name,
        slug: documentationTable.slug,
        description: documentationTable.description,
        isGenerated: documentationTable.isGenerated,
        isPublic: documentationTable.isPublic,
        isDirty: documentationTable.isDirty,
        userId: documentationTable.userId,
        documentationTypeId: documentationTable.documentationTypeId,
      })
      .from(documentationTable)
      .where(eq(documentationTable.id, documentationId))
      .limit(1);

    if (!documentation || documentation.userId !== session.user.id) {
      throw new Error("Documentation not found");
    }

    let docType = null;
    if (documentation.documentationTypeId) {
      const [result] = await db
        .select({
          id: documentationTypes.id,
          name: documentationTypes.name,
          slug: documentationTypes.slug,
          description: documentationTypes.description,
        })
        .from(documentationTypes)
        .where(eq(documentationTypes.id, documentation.documentationTypeId))
        .limit(1);
      docType = result ?? null;
    }

    const repos = await db
      .select({ id: repositories.id, url: repositories.url, branch: repositories.branch })
      .from(repositories)
      .where(eq(repositories.documentationId, documentationId));

    const pages = await db
      .select({
        id: documentationPages.id,
        type: documentationPages.type,
        parentId: documentationPages.parentId,
        title: documentationPages.title,
        slug: documentationPages.slug,
        content: documentationPages.content,
        order: documentationPages.order,
      })
      .from(documentationPages)
      .where(eq(documentationPages.documentationId, documentationId))
      .orderBy(asc(documentationPages.order));

    return {
      ...documentation,
      documentationType: docType ?? null,
      repositories: repos,
      pages,
    };
  });

export const updateDocumentation = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      documentationId: z.string(),
      name: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      isPublic: z.boolean().optional(),
      isDirty: z.boolean().optional(),
      repositories: z
        .array(
          z.object({
            url: z
              .string()
              .url()
              .refine((url) => url.startsWith("https://"), {
                message: "Repository URL must use HTTPS",
              }),
            branch: z.string(),
          }),
        )
        .optional(),
      pages: z
        .array(
          z.object({
            id: z.string(),
            title: z.string().min(1),
            content: z.string(),
          }),
        )
        .optional(),
    }),
  )
  .handler(async ({ data }) => {
    const session = await ensureSession();

    const [existing] = await db
      .select({ userId: documentationTable.userId })
      .from(documentationTable)
      .where(eq(documentationTable.id, data.documentationId))
      .limit(1);

    if (!existing || existing.userId !== session.user.id) {
      throw new Error("Documentation not found");
    }

    const shouldMarkDirty =
      data.name !== undefined ||
      data.description !== undefined ||
      data.repositories !== undefined ||
      data.pages !== undefined;

    if (shouldMarkDirty || data.isPublic !== undefined || data.isDirty !== undefined) {
      const updates: Record<string, unknown> = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.description !== undefined) updates.description = data.description;
      if (data.isPublic !== undefined) updates.isPublic = data.isPublic;
      if (data.isDirty !== undefined) updates.isDirty = data.isDirty;
      if (shouldMarkDirty && data.isDirty === undefined) updates.isDirty = true;

      if (Object.keys(updates).length > 0) {
        await db
          .update(documentationTable)
          .set(updates)
          .where(eq(documentationTable.id, data.documentationId));
      }
    }

    if (data.repositories !== undefined) {
      await db.delete(repositories).where(eq(repositories.documentationId, data.documentationId));

      for (const repo of data.repositories) {
        await db.insert(repositories).values({
          documentationId: data.documentationId,
          url: repo.url,
          branch: repo.branch,
        });
      }
    }

    if (data.pages !== undefined) {
      for (const page of data.pages) {
        await db
          .update(documentationPages)
          .set({ title: page.title, content: page.content })
          .where(
            and(
              eq(documentationPages.id, page.id),
              eq(documentationPages.documentationId, data.documentationId),
            ),
          );
      }
    }

    return { success: true };
  });

export const regenerateDocumentation = createServerFn({ method: "POST" })
  .inputValidator(z.string())
  .handler(async ({ data: documentationId }) => {
    const session = await ensureSession();

    const [documentation] = await db
      .select({
        id: documentationTable.id,
        userId: documentationTable.userId,
        documentationTypeId: documentationTable.documentationTypeId,
      })
      .from(documentationTable)
      .where(eq(documentationTable.id, documentationId))
      .limit(1);

    if (!documentation || documentation.userId !== session.user.id) {
      throw new Error("Documentation not found");
    }

    if (!documentation.documentationTypeId) {
      throw new Error("Documentation has no type assigned");
    }

    const repos = await db
      .select({ url: repositories.url, branch: repositories.branch })
      .from(repositories)
      .where(eq(repositories.documentationId, documentationId));

    const [docType] = await db
      .select({ systemPrompt: documentationTypes.systemPrompt })
      .from(documentationTypes)
      .where(eq(documentationTypes.id, documentation.documentationTypeId))
      .limit(1);

    if (!docType) {
      throw new Error("Documentation type not found");
    }

    await db
      .delete(documentationPages)
      .where(eq(documentationPages.documentationId, documentationId));

    await db
      .update(documentationTable)
      .set({ isGenerated: false, isDirty: false })
      .where(eq(documentationTable.id, documentationId));

    const job = await enqueueJob({
      documentationId,
      repositories: repos.map((r) => ({ url: r.url, branch: r.branch ?? "main" })),
      documentationType: documentation.documentationTypeId,
      systemPrompt: docType.systemPrompt,
    });

    return { job };
  });
