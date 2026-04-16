import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app_/app")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="min-h-lvh">
      <div className="h-10 border-b"></div>
      <div className="inner h-[calc(100vh-5rem)] border-x border-dashed justify-center flex-col flex p-8 relative">
        <div className="size-2 bg-background border absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2"></div>
        <div className="size-2 bg-background border absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2"></div>
        <div className="size-2 bg-background border absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="size-2 bg-background border absolute right-0 top-0 translate-x-1/2 -translate-y-1/2"></div>

        <div className="max-w-md w-full mx-auto border border-dashed p-1 rounded-2xl">
          <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6 max-h-[calc(100vh-10rem)] overflow-y-auto">
            <div className="size-10">
              <img src="/archon.svg" alt="Archon Logo" />
            </div>
            <Outlet />
          </div>
        </div>
      </div>
      <div className="h-10 border-t"></div>
    </main>
  );
}
