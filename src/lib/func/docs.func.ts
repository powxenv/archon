import { createServerFn } from "@tanstack/react-start";
import { ensureSession } from "./auth.func";
import { db } from "../server/db";
import { documentationTypes, documentations as documentationTable } from "#/lib/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const getDocumentations = createServerFn({ method: "GET" }).handler(async () => {
  const session = await ensureSession();

  const documentations = await db
    .select()
    .from(documentationTable)
    .where(eq(documentationTable.userId, session.user.id))
    .innerJoin(documentationTypes, eq(documentationTable.id, documentationTypes.id));

  return documentations;
});

export const getDocumentationTypes = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSession();

  return db.select().from(documentationTypes);
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
