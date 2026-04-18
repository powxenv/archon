import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { getDocumentationBySlug } from "#/lib/func/docs.functions";

export const Route = createFileRoute("/docs/$slug/")({
  loader: async ({ params }) => {
    const result = await getDocumentationBySlug({ data: params.slug });

    if (!result) {
      throw notFound();
    }

    if (!result.isGenerated) {
      if (
        result.isOwner &&
        result.jobStatus &&
        result.jobStatus !== "completed"
      ) {
        throw redirect({
          to: "/app/new/$documentationId/status",
          params: { documentationId: result.id },
        });
      }
      throw notFound();
    }

    if (result.pages.length === 0) {
      return { slug: params.slug, hasPages: false };
    }

    const rootPage = result.pages.find(
      (p: { type: string; parentId: string | null }) => p.type === "page" && !p.parentId,
    );

    let firstPage = rootPage;
    if (!firstPage) {
      const firstGroup = result.pages.find(
        (p: { type: string }) => p.type === "group",
      );
      if (firstGroup) {
        firstPage = result.pages.find(
          (p: { type: string; parentId: string | null }) => p.type === "page" && p.parentId === firstGroup.id,
        );
      }
    }

    if (!firstPage) {
      return { slug: params.slug, hasPages: false };
    }

    throw redirect({
      to: "/docs/$slug/$pageSlug",
      params: {
        slug: params.slug,
        pageSlug: firstPage.slug,
      },
    });
  },
});
