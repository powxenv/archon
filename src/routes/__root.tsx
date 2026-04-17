import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import appCss from "../styles.css?url";
import { Link } from "@tanstack/react-router";
import { buttonVariants, cn } from "@heroui/styles";
import type { QueryClient } from "@tanstack/react-query";
import { getSession } from "#/lib/func/auth.functions";

// const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Archon",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  beforeLoad: async () => {
    const session = await getSession();
    return { session };
  },
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} /> */}
        <HeadContent />
      </head>
      <body className="font-sans antialiased wrap-anywhere bg-background text-foreground">
        {children}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <>
      <main>
        <div className="inner border-x border-dashed min-h-lvh justify-center flex-col flex py-24 relative">
          <div className="max-w-md w-full mx-auto border border-dashed p-1 rounded-2xl">
            <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6">
              <div className="size-10">
                <img src="/archon.svg" alt="Archon Logo" />
              </div>
              <h3 className="text-lg mb-1 mt-2">Page not found</h3>
              <p>Sorry, we could not find the page you are looking for.</p>
              <div className="mt-4 flex flex-col gap-2">
                <Link to="/" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                  Go back home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
