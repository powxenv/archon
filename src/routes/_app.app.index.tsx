import { buttonVariants } from "@heroui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import SolarStarFallLinear from "~icons/solar/star-fall-linear";
import SolarDocumentLineDuotone from "~icons/solar/document-line-duotone";
import SolarCode2Linear from "~icons/solar/code-2-linear";
import SolarRocket2Linear from "~icons/solar/rocket-2-linear";
import { rot } from "#/lib/utils";
import type { ReactElement } from "react";
import { getDocumentations } from "#/lib/func/docs.func.ts";

const iconMap: Record<string, ReactElement> = {
  onboarding: <SolarRocket2Linear />,
  developer: <SolarCode2Linear />,
  user: <SolarDocumentLineDuotone />,
};

export const Route = createFileRoute("/_app/app/")({
  loader: async () => {
    const documentations = await getDocumentations();

    return { documentations };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { documentations } = Route.useLoaderData();

  return (
    <main>
      <div className="inner border-x px-8">
        {documentations.length > 0 ? (
          <div className="min-h-lvh py-14">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl">Your Documentation</h1>
                <p className="text-muted-foreground mt-2">
                  Generate AI-powered documentation from your codebase
                </p>
              </div>
              <div>
                <Link to="/app/new" className={buttonVariants()}>
                  <SolarStarFallLinear />
                  New Documentation
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-8 mt-16">
              {documentations.map((documentation) => (
                <div
                  style={{ transform: `rotate(${rot(documentation.documentation.id)}deg)` }}
                  className="border border-dashed p-1 rounded-2xl"
                >
                  <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6">
                    <div className="size-10 border flex justify-center items-center rounded-lg">
                      {iconMap[documentation.documentation_type.slug]}
                    </div>
                    <h3 className="text-lg my-1">{documentation.documentation.name}</h3>
                    <p className="line-clamp-3">{documentation.documentation.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="min-h-lvh py-14 grid grid-cols-2 gap-10 items-center">
            <div className="flex flex-col">
              <h1 className="text-6xl font-semibold">Get started with your first documentation</h1>
              <p className="text-muted-foreground mt-4 text-xl">
                Turn your codebase into clear, complete documentation in three simple steps
              </p>
              <div className="mt-4">
                <Link to="/app/new" className={buttonVariants()}>
                  <SolarStarFallLinear />
                  New Documentation
                </Link>
              </div>
            </div>
            <div className="mt-8 flex flex-col">
              <div className="flex gap-2">
                <div className="relative flex flex-col items-center">
                  <div className="w-[.25px] h-full bg-border"></div>
                  <div className="p-1 border border-dashed rounded-full">
                    <div className="size-8 bg-surface border rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      1
                    </div>
                  </div>
                  <div className="w-[.25px] h-full bg-border"></div>
                </div>
                <div className="w-full py-4">
                  <div className="border rotate-4 border-dashed p-1 rounded-2xl w-full">
                    <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6">
                      <div className="flex gap-3">
                        <div className="size-10 shrink-0 mt-1 border flex justify-center items-center rounded-lg">
                          <SolarCode2Linear />
                        </div>
                        <div>
                          <h3 className="text-lg">Create documentation</h3>
                          <p className="text-sm text-muted">Give your documentation a name</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="relative flex flex-col items-center">
                  <div className="w-[.25px] h-full bg-border"></div>
                  <div className="p-1 border border-dashed rounded-full">
                    <div className="size-8 bg-surface border rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      2
                    </div>
                  </div>
                  <div className="w-[.25px] h-full bg-border"></div>
                </div>
                <div className="w-full py-4">
                  <div className="border -rotate-2 border-dashed p-1 rounded-2xl w-full">
                    <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6">
                      <div className="flex gap-3">
                        <div className="size-10 shrink-0 mt-1 border flex justify-center items-center rounded-lg">
                          <SolarDocumentLineDuotone />
                        </div>
                        <div>
                          <h3 className="text-lg">Add your repositories</h3>
                          <p className="text-sm text-muted">
                            Link the Git repos you want to document
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="relative flex flex-col items-center">
                  <div className="w-[.25px] h-full bg-border"></div>
                  <div className="p-1 border border-dashed rounded-full">
                    <div className="size-8 bg-surface border rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      3
                    </div>
                  </div>
                  <div className="w-[.25px] h-full bg-border"></div>
                </div>
                <div className="w-full py-4">
                  <div className="border rotate-4 border-dashed p-1 rounded-2xl w-full">
                    <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6">
                      <div className="flex gap-3">
                        <div className="size-10 shrink-0 mt-1 border flex justify-center items-center rounded-lg">
                          <SolarRocket2Linear />
                        </div>
                        <div>
                          <h3 className="text-lg">That's it!</h3>
                          <p className="text-sm text-muted">AI generates your docs automatically</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
