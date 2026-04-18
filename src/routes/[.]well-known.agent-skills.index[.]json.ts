import { createFileRoute } from "@tanstack/react-router";
import {
  getPublicDocumentations,
  getAllPublicPages,
  buildSkillMarkdown,
  sha256Hex,
  toSkillName,
  isValidSkillName,
} from "#/lib/server/agent-skills";

export const Route = createFileRoute(
  "/.well-known/agent-skills/index.json",
)({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = "https://archon.noval.me";
        const docs = await getPublicDocumentations();

        const validDocs = docs.filter((d) =>
          isValidSkillName(toSkillName(d.slug)),
        );

        if (validDocs.length === 0) {
          return new Response(
            JSON.stringify({
              $schema:
                "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
              skills: [],
            }),
            {
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=300, s-maxage=300",
              },
            },
          );
        }

        const pagesByDocId = await getAllPublicPages(
          validDocs.map((d) => d.id),
        );

        const skills = await Promise.all(
          validDocs.map(async (doc) => {
            const pages = pagesByDocId.get(doc.id) ?? [];
            const skillName = toSkillName(doc.slug);
            const skillMd = buildSkillMarkdown(
              doc.name,
              doc.slug,
              doc.description,
              pages,
              baseUrl,
            );
            const skillMdBytes = new TextEncoder().encode(skillMd);
            const digest = await sha256Hex(skillMdBytes);

            return {
              name: skillName,
              type: "skill-md" as const,
              description: (doc.description ?? doc.name).slice(0, 1024),
              url: `/.well-known/agent-skills/${skillName}/SKILL.md`,
              digest: `sha256:${digest}`,
            };
          }),
        );

        return new Response(
          JSON.stringify(
            {
              $schema:
                "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
              skills,
            },
            null,
            2,
          ),
          {
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=300, s-maxage=300",
            },
          },
        );
      },
    },
  },
});
