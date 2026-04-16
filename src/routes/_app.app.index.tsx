import { Button } from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";
import SolarStarFallLinear from "~icons/solar/star-fall-linear";
import SolarDocumentLineDuotone from "~icons/solar/document-line-duotone";
import SolarCode2Linear from "~icons/solar/code-2-linear";
import SolarRocket2Linear from "~icons/solar/rocket-2-linear";
import { rot } from "#/lib/utils";
import { db } from "#/lib/server/db";
import { documentationTypes, projects as projectTable } from "#/lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { ReactElement } from "react";

const iconMap: Record<string, ReactElement> = {
  onboarding: <SolarRocket2Linear />,
  developer: <SolarCode2Linear />,
  user: <SolarDocumentLineDuotone />,
};

export const Route = createFileRoute("/_app/app/")({
  loader: async () => {
    const projects = await db
      .select()
      .from(projectTable)
      .innerJoin(documentationTypes, eq(projectTable.id, documentationTypes.id));

    return { projects };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { projects } = Route.useLoaderData();

  return (
    <main>
      <div className="inner border-x px-8">
        {projects.length > 0 ? (
          <div className="min-h-lvh py-14">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl">Your Documentation Projects</h1>
                <p className="text-muted-foreground mt-2">
                  Generate AI-powered documentation from your codebase
                </p>
              </div>
              <div>
                <Button>
                  <SolarStarFallLinear />
                  New Project
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-8 mt-16">
              {projects.map((project) => (
                <div
                  style={{ transform: `rotate(${rot(project.project.id)}deg)` }}
                  className="border border-dashed p-1 rounded-2xl"
                >
                  <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6">
                    <div className="size-10 border flex justify-center items-center rounded-lg">
                      {iconMap[project.documentation_type.slug]}
                    </div>
                    <h3 className="text-lg my-1">{project.project.name}</h3>
                    <p className="line-clamp-3">{project.project.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="min-h-lvh py-14 flex justify-center flex-col">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-4xl font-semibold">Get started with your first project</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Turn your codebase into clear, complete documentation in three simple steps
              </p>
              <Button className="mt-6">
                <SolarStarFallLinear />
                New Project
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-3">
              <div className="flex flex-col items-center">
                <div className="relative w-full flex items-center justify-center mb-4">
                  <div className="h-[.25px] flex-1 bg-border"></div>
                  <div className="p-1 border border-dashed rounded-full">
                    <div className="size-8 bg-surface border rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      1
                    </div>
                  </div>
                  <div className="h-[.25px] flex-1 bg-border"></div>
                </div>
                <div className="border rotate-4 border-dashed p-1 rounded-2xl w-full">
                  <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6">
                    <div className="flex gap-3">
                      <div className="size-10 shrink-0 mt-1 border flex justify-center items-center rounded-lg">
                        <SolarCode2Linear />
                      </div>
                      <div>
                        <h3 className="text-lg">Create a project</h3>
                        <p className="text-sm text-muted">Give your documentation project a name</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="relative w-full flex items-center justify-center mb-4">
                  <div className="h-[.25px] flex-1 bg-border"></div>
                  <div className="p-1 border border-dashed rounded-full">
                    <div className="size-8 bg-surface border rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      2
                    </div>
                  </div>
                  <div className="h-[.25px] flex-1 bg-border"></div>
                </div>
                <div className="border -rotate-2 border-dashed p-1 rounded-2xl w-full">
                  <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6">
                    <div className="flex gap-3">
                      <div className="size-10 shrink-0 mt-1 border flex justify-center items-center rounded-lg">
                        <SolarDocumentLineDuotone />
                      </div>
                      <div>
                        <h3 className="text-lg">Add your repositories</h3>
                        <p className="text-sm text-muted">Link the Git repos you want to document</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="relative w-full flex items-center justify-center mb-4">
                  <div className="h-[.25px] flex-1 bg-border"></div>
                  <div className="p-1 border border-dashed rounded-full">
                    <div className="size-8 bg-surface border rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      3
                    </div>
                  </div>
                  <div className="h-[.25px] flex-1 bg-border"></div>
                </div>
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
        )}
      </div>
    </main>
  );
}
