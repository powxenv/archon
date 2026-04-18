import { db } from "#/lib/server/db/index.server";
import {
  documentations,
  documentationPages,
} from "#/lib/server/db/schema.server";
import { eq, and, asc, inArray } from "drizzle-orm";

const SKILL_NAME_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
const SKILL_PREFIX = "archon-docs-";

export function toSkillName(slug: string): string {
  return `${SKILL_PREFIX}${slug}`;
}

export function skillNameToSlug(skillName: string): string | null {
  if (!skillName.startsWith(SKILL_PREFIX)) return null;
  return skillName.slice(SKILL_PREFIX.length);
}

export function isValidSkillName(name: string): boolean {
  return name.length >= 1 && name.length <= 64 && SKILL_NAME_RE.test(name);
}

export type PublicDocumentation = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

export type SkillPage = {
  id: string;
  title: string;
  slug: string;
  type: string;
  parentId: string | null;
  order: number | null;
};

export type SkillData = {
  name: string;
  slug: string;
  description: string | null;
  pages: SkillPage[];
};

export async function getPublicDocumentations(): Promise<PublicDocumentation[]> {
  return db
    .select({
      id: documentations.id,
      slug: documentations.slug,
      name: documentations.name,
      description: documentations.description,
    })
    .from(documentations)
    .where(
      and(
        eq(documentations.isPublic, true),
        eq(documentations.isGenerated, true),
      ),
    );
}

export async function getAllPublicPages(
  docIds: string[],
): Promise<Map<string, SkillPage[]>> {
  if (docIds.length === 0) return new Map();

  const rows = await db
    .select({
      documentationId: documentationPages.documentationId,
      id: documentationPages.id,
      type: documentationPages.type,
      parentId: documentationPages.parentId,
      title: documentationPages.title,
      slug: documentationPages.slug,
      order: documentationPages.order,
    })
    .from(documentationPages)
    .where(inArray(documentationPages.documentationId, docIds))
    .orderBy(asc(documentationPages.order));

  const pagesByDocId = new Map<string, SkillPage[]>();
  for (const row of rows) {
    const { documentationId, ...page } = row;
    const existing = pagesByDocId.get(documentationId) ?? [];
    existing.push(page);
    pagesByDocId.set(documentationId, existing);
  }
  return pagesByDocId;
}

export async function getDocumentationPagesForSkill(
  slug: string,
): Promise<SkillData | null> {
  const [doc] = await db
    .select({
      id: documentations.id,
      name: documentations.name,
      slug: documentations.slug,
      description: documentations.description,
    })
    .from(documentations)
    .where(
      and(
        eq(documentations.slug, slug),
        eq(documentations.isPublic, true),
        eq(documentations.isGenerated, true),
      ),
    )
    .limit(1);

  if (!doc) return null;

  const pages = await db
    .select({
      id: documentationPages.id,
      type: documentationPages.type,
      parentId: documentationPages.parentId,
      title: documentationPages.title,
      slug: documentationPages.slug,
      order: documentationPages.order,
    })
    .from(documentationPages)
    .where(eq(documentationPages.documentationId, doc.id))
    .orderBy(asc(documentationPages.order));

  return {
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    pages,
  };
}

export function buildSkillMarkdown(
  name: string,
  slug: string,
  description: string | null,
  pages: SkillPage[],
  baseUrl: string,
): string {
  const skillName = toSkillName(slug);
  const truncatedDesc = (description ?? name).slice(0, 1024);

  const lines: string[] = [
    "---",
    `name: ${skillName}`,
    `description: ${truncatedDesc}`,
    "---",
    "",
    `# ${name}`,
    "",
  ];

  if (description) {
    lines.push(description);
    lines.push("");
  }

  if (pages.length > 0) {
    lines.push("## Pages", "");

    const rootPages = pages.filter(
      (p) => p.type === "page" && !p.parentId,
    );
    const groups = pages.filter((p) => p.type === "group");

    for (const page of rootPages) {
      lines.push(
        `- [${page.title}](${baseUrl}/docs/${slug}/${page.slug})`,
      );
    }

    if (rootPages.length > 0 && groups.length > 0) {
      lines.push("");
    }

    for (const group of groups) {
      lines.push(`### ${group.title}`, "");
      const groupPages = pages.filter((p) => p.parentId === group.id);
      for (const page of groupPages) {
        lines.push(
          `- [${page.title}](${baseUrl}/docs/${slug}/${page.slug})`,
        );
      }
      lines.push("");
    }
  }

  lines.push("## Usage", "");
  lines.push(
    `This documentation covers ${name}. To read any page, follow the URLs listed above.`,
  );
  lines.push(
    "Each page contains detailed markdown documentation suitable for AI consumption.",
  );
  lines.push("");

  return lines.join("\n");
}

export async function sha256Hex(content: string | Uint8Array): Promise<string> {
  const data = typeof content === "string" 
    ? new TextEncoder().encode(content)
    : content;
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
