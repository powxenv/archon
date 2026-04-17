import { buttonVariants, cn } from "@heroui/react";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { getDocumentationPageBySlug } from "#/lib/func/docs.functions";
import { MarkdownContent } from "#/components/markdown-content";
import { Fragment } from "react/jsx-runtime";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/docs/$slug/$pageSlug")({
  loader: async ({ params }) => {
    const result = await getDocumentationPageBySlug({
      data: {
        documentationSlug: params.slug,
        pageId: params.pageSlug,
      },
    });

    if (!result) {
      throw notFound();
    }

    const { documentation, jobStatus } = result;

    if (!documentation.isGenerated) {
      if (
        documentation.isOwner &&
        jobStatus &&
        jobStatus !== "completed" &&
        jobStatus !== "failed"
      ) {
        console.log("asdbhasdashgdvasd");
        throw redirect({
          to: "/app/new/$documentationId/status",
          params: { documentationId: documentation.id },
        });
      }
      throw notFound();
    }

    return result;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { documentation, page, pages } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [page.id]);

  const rootPages = pages.filter((p) => p.type === "page" && !p.parentId);
  const groups = pages.filter((p) => p.type === "group");

  const sortedPages = [...pages]
    .filter((p) => p.type === "page")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const currentIndex = sortedPages.findIndex((p) => p.id === page.id);
  const prevPage = currentIndex > 0 ? sortedPages[currentIndex - 1] : null;
  const nextPage = currentIndex < sortedPages.length - 1 ? sortedPages[currentIndex + 1] : null;

  return (
    <div className="flex flex-col">
      <header className="border-b bg-background/60 h-14 px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1 text-lg font-semibold">
          <img src="/archon.svg" className="size-6" alt="" />
          {documentation.name}
        </Link>
        <nav className="flex gap-4 items-center">{/* Some button or link */}</nav>
      </header>
      <div className="flex h-[calc(100lvh-3.5rem)] pl-12">
        <aside className="py-4 h-full overflow-y-auto w-full max-w-80 shrink-0 border-x flex flex-col gap-2">
          {rootPages.length > 0 && (
            <div className="px-2">
              {rootPages.map((rootPage) => (
                <Link
                  key={rootPage.id}
                  to="/docs/$slug/$pageSlug"
                  params={{
                    slug,
                    pageSlug: rootPage.id,
                  }}
                  className={cn(
                    buttonVariants({ variant: page.id === rootPage.id ? "tertiary" : "ghost" }),
                    "justify-start w-full truncate",
                  )}
                >
                  {rootPage.title}
                </Link>
              ))}
            </div>
          )}
          {groups.map((group) => {
            const groupPages = pages.filter((p) => p.parentId === group.id);
            return (
              <Fragment key={group.id}>
                <div className="flex items-center gap-4">
                  <span className="ml-6 text-sm -tracking-wider whitespace-nowrap font-semibold">
                    {group.title}
                  </span>
                  <span className="h-px w-full bg-border"></span>
                </div>
                <div className="px-2">
                  {groupPages.map((groupPage) => (
                    <Link
                      key={groupPage.id}
                      to="/docs/$slug/$pageSlug"
                      params={{
                        slug,
                        pageSlug: groupPage.id,
                      }}
                      className={cn(
                        buttonVariants({
                          variant: page.id === groupPage.id ? "tertiary" : "ghost",
                        }),
                        "justify-start w-full truncate",
                      )}
                    >
                      {groupPage.title}
                    </Link>
                  ))}
                </div>
              </Fragment>
            );
          })}
        </aside>
        <div ref={contentRef} className="h-full overflow-y-auto w-full py-10 pr-12 pl-10">
          <MarkdownContent html={page.contentHtml} />
          <div className="mt-12 pt-8 border-t flex justify-between gap-4">
            {prevPage ? (
              <Link
                to="/docs/$slug/$pageSlug"
                params={{ slug, pageSlug: prevPage.id }}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                ← {prevPage.title}
              </Link>
            ) : (
              <div />
            )}
            {nextPage ? (
              <Link
                to="/docs/$slug/$pageSlug"
                params={{ slug, pageSlug: nextPage.id }}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                {nextPage.title} →
              </Link>
            ) : (
              <div />
            )}
          </div>
          <div className="mt-8 pt-6 border-t flex justify-between items-center text-sm text-muted-foreground">
            <p>Powered and generated by Archon</p>
            <p className="mt-1 text-xs">
              AI can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
