import { createFileRoute } from "@tanstack/react-router";
import {
  getDocumentationPagesForSkill,
  buildSkillMarkdown,
} from "#/lib/server/agent-skills";

const DOCS_SUFFIX = "-docs";

function skillNameToSlug(skillName: string): string | null {
  if (!skillName.endsWith(DOCS_SUFFIX)) return null;
  return skillName.slice(0, -DOCS_SUFFIX.length);
}

export const Route = createFileRoute(
  "/.well-known/agent-skills/$skillName/SKILL.md",
)({
  server: {
    handlers: {
      GET: async ({
        request,
        params,
      }: {
        request: Request;
        params: { skillName: string };
      }) => {
        const slug = skillNameToSlug(params.skillName);
        if (!slug) {
          return new Response("Not Found", { status: 404 });
        }

        const result = await getDocumentationPagesForSkill(slug);
        if (!result) {
          return new Response("Not Found", { status: 404 });
        }

        const baseUrl = new URL(request.url).origin;
        const skillMd = buildSkillMarkdown(
          result.name,
          result.slug,
          result.description,
          result.pages,
          baseUrl,
        );

        return new Response(skillMd, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=300",
          },
        });
      },
    },
  },
});
