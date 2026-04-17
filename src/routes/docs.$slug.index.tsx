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
        result.jobStatus !== "completed" &&
        result.jobStatus !== "failed"
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

    const firstPage = result.pages[0];
    throw redirect({
      to: "/docs/$slug/$pageSlug",
      params: {
        slug: params.slug,
        pageSlug: firstPage.id,
      },
    });
  },
});
