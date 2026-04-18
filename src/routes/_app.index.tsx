import { createFileRoute } from "@tanstack/react-router";
import SolarStarAngleLineDuotone from "~icons/solar/star-angle-line-duotone";
import { Button } from "@heroui/react";
import SolarArrowRightLineDuotone from "~icons/solar/arrow-right-line-duotone";
import SolarDocumentLineDuotone from "~icons/solar/document-line-duotone";
import SolarStarsLineLineDuotone from "~icons/solar/stars-line-line-duotone";
import SolarUsersGroupTwoRoundedLineDuotone from "~icons/solar/users-group-two-rounded-line-duotone";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Archon — AI-Powered Documentation Platform" },
      {
        name: "description",
        content:
          "Turn any codebase into clear, structured documentation. Archon analyzes your repositories and generates technical docs, onboarding guides, and user documentation.",
      },
      {
        property: "og:title",
        content: "Archon — AI-Powered Documentation Platform",
      },
      {
        property: "og:description",
        content:
          "Turn any codebase into clear, structured documentation. AI-generated technical docs, onboarding guides, and user documentation.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:image",
        content: "https://archon.noval.me/logo512.png",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Archon — AI-Powered Documentation Platform",
      },
      {
        name: "twitter:description",
        content:
          "Turn any codebase into clear, structured documentation with AI.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://archon.noval.me/",
      },
    ],
  }),
  component: App,
});

function App() {
  return (
    <>
      <main>
        <div className="inner border-x border-dashed min-h-lvh justify-center flex-col flex py-24 relative">
          <div className="size-1 bg-background border absolute top-0 left-0"></div>
          <div className="max-w-xl text-center mx-auto flex flex-col items-center gap-4">
            <div className="py-1 text-sm pl-2 pr-4 rounded-lg border flex items-center gap-1">
              <SolarStarAngleLineDuotone />
              AI-powered documentation
            </div>
            <h1 className="text-5xl font-semibold">
              Turn any codebase into clear, structured documentation
            </h1>
            <p className="max-w-md text-lg">
              Archon analyzes your repositories and microservices to understand how everything fits
              together, then generates technical docs, onboarding guides, and user documentation all
              in one place.
            </p>

            <Button>
              Get Started <SolarArrowRightLineDuotone />
            </Button>
          </div>

          <div className="px-8 grid grid-cols-3 items-center gap-4 mt-8">
            <div className="rotate-2 border border-dashed p-1 rounded-2xl">
              <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6">
                <div className="size-10 border flex justify-center items-center rounded-lg">
                  <SolarDocumentLineDuotone />
                </div>
                <h3 className="text-lg my-1">Complete technical docs</h3>
                <p>
                  Generates structured documentation covering your architecture, APIs, and service
                  interactions without manual effort.
                </p>
              </div>
            </div>

            <div className="-rotate-4 border border-dashed p-1 rounded-2xl">
              <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6">
                <div className="size-10 border flex justify-center items-center rounded-lg">
                  <SolarStarsLineLineDuotone />
                </div>
                <h3 className="text-lg my-1">Understands your architecture</h3>
                <p>
                  Traces data flows and dependencies across your entire system, even across
                  microservice boundaries.
                </p>
              </div>
            </div>

            <div className="rotate-6 border border-dashed p-1 rounded-2xl">
              <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6">
                <div className="size-10 border flex justify-center items-center rounded-lg">
                  <SolarUsersGroupTwoRoundedLineDuotone />
                </div>
                <h3 className="text-lg my-1">Onboarding and user guides</h3>
                <p>
                  Produces guides that help new team members get up to speed quickly, from setup
                  instructions to system overviews.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
