import { Button, buttonVariants, cn, Dropdown, Header, Label } from "@heroui/react";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { getDocumentationPageBySlug } from "#/lib/func/docs.functions";
import SolarPenNewSquareLinear from "~icons/solar/pen-new-square-linear";
import SolarChatRoundDotsLinear from "~icons/solar/chat-round-dots-linear";
import SolarAltArrowDownLinear from "~icons/solar/alt-arrow-down-linear";
import { MarkdownContent } from "#/components/markdown-content";
import { Fragment, useEffect, useRef } from "react";
import mermaid from "mermaid";

export const Route = createFileRoute("/docs/$slug/$pageSlug")({
  loader: async ({ params }) => {
    const result = await getDocumentationPageBySlug({
      data: {
        documentationSlug: params.slug,
        pageSlug: params.pageSlug,
      },
    });

    if (!result) {
      throw notFound();
    }

    const { documentation, jobStatus } = result;

    if (!documentation.isGenerated) {
      if (documentation.isOwner && jobStatus && jobStatus !== "completed") {
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
      mermaid.initialize({ startOnLoad: true });
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

  const pageUrl = `${window.location.origin}/docs/${slug}/${page.slug}`;

  return (
    <div className="flex flex-col">
      <header className="border-b bg-background/60 h-14 px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1 text-lg font-semibold">
          <img src="/archon.svg" className="size-6" alt="" />
          {documentation.name}
        </Link>
        <nav className="flex gap-2 items-center">
          <AskAiDropdown pageUrl={pageUrl} />

          {documentation.isOwner && (
            <Link
              to="/app/$documentationId"
              params={{ documentationId: documentation.id }}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <SolarPenNewSquareLinear className="size-4" />
              Edit
            </Link>
          )}
        </nav>
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
                    pageSlug: rootPage.slug,
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
                  <span className="h-px w-full bg-border" />
                </div>
                <div className="px-2">
                  {groupPages.map((groupPage) => (
                    <Link
                      key={groupPage.id}
                      to="/docs/$slug/$pageSlug"
                      params={{
                        slug,
                        pageSlug: groupPage.slug,
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
                params={{ slug, pageSlug: prevPage.slug }}
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
                params={{ slug, pageSlug: nextPage.slug }}
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

function AskAiDropdown({ pageUrl }: { pageUrl: string }) {
  const createSearchUrl = (baseUrl: string, queryKey: string) => {
    const url = new URL(baseUrl);
    url.searchParams.set(queryKey, `Read ${pageUrl} and answer questions about it.`);
    return url.toString();
  };

  const actionUrls = {
    chatgpt: createSearchUrl("https://chatgpt.com/", "q"),
    claude: createSearchUrl("https://claude.ai/new", "q"),
    cursor: createSearchUrl("https://cursor.com/link/prompt", "text"),
  };

  const handleAction = (key: string) => {
    const url = actionUrls[key as keyof typeof actionUrls];
    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Dropdown>
      <Button type="button" variant="outline" size="sm">
        <SolarChatRoundDotsLinear className="size-4" />
        Ask AI
        <SolarAltArrowDownLinear className="size-3" />
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu aria-label="Ask AI" onAction={(key) => handleAction(String(key))}>
          <Dropdown.Section>
            <Header>Ask about this page</Header>
            <Dropdown.Item id="chatgpt" textValue="Ask ChatGPT">
              <Label>Ask ChatGPT</Label>
            </Dropdown.Item>
            <Dropdown.Item id="claude" textValue="Ask Claude">
              <Label>Ask Claude</Label>
            </Dropdown.Item>
            <Dropdown.Item id="cursor" textValue="Ask Cursor">
              <Label>Ask Cursor</Label>
            </Dropdown.Item>
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
