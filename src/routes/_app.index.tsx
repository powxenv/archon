import { createFileRoute, Link } from "@tanstack/react-router";
import SolarStarAngleLineDuotone from "~icons/solar/star-angle-line-duotone";
import { buttonVariants } from "@heroui/react";
import SolarArrowRightLineDuotone from "~icons/solar/arrow-right-line-duotone";
import SolarDocumentLineDuotone from "~icons/solar/document-line-duotone";
import SolarStarsLineLineDuotone from "~icons/solar/stars-line-line-duotone";
import SolarUsersGroupTwoRoundedLineDuotone from "~icons/solar/users-group-two-rounded-line-duotone";
import SolarCode2Linear from "~icons/solar/code-2-linear";
import SolarRocket2Linear from "~icons/solar/rocket-2-linear";
import SolarGlobalLinear from "~icons/solar/global-linear";
import SolarChatRoundDotsLinear from "~icons/solar/chat-round-dots-linear";
import SolarBranchingPathsDownLinear from "~icons/solar/branching-paths-down-linear";
import SolarRestartLinear from "~icons/solar/restart-linear";
import SolarPenNewSquareLinear from "~icons/solar/pen-new-square-linear";
import SolarChecklistLineDuotone from "~icons/solar/checklist-line-duotone";
import SolarBoltLineDuotone from "~icons/solar/bolt-line-duotone";
import SolarWidget2LineDuotone from "~icons/solar/widget-2-line-duotone";
import SolarArrowRightUpLineDuotone from "~icons/solar/arrow-right-up-line-duotone";

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
        content: "Turn any codebase into clear, structured documentation with AI.",
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

function FeatureCard({
  icon,
  title,
  description,
  rotation,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  rotation: string;
}) {
  return (
    <div className={`${rotation} border border-dashed p-1 rounded-2xl`}>
      <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6">
        <div className="size-10 border flex justify-center items-center rounded-lg">{icon}</div>
        <h3 className="text-lg my-1">{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

function StepCard({
  icon,
  title,
  description,
  rotation,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  rotation: string;
}) {
  return (
    <div className={`${rotation} border border-dashed p-1 rounded-2xl w-full`}>
      <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6">
        <div className="flex gap-3">
          <div className="size-10 shrink-0 mt-1 border flex justify-center items-center rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="text-lg">{title}</h3>
            <p className="text-sm text-muted">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Separator() {
  return (
    <div className="border-y">
      <div className="inner border-x h-10" />
    </div>
  );
}

function SectionBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="py-1 text-sm pl-2 pr-4 rounded-lg border inline-flex items-center gap-1 mx-auto">
      {icon}
      {label}
    </div>
  );
}

function App() {
  return (
    <main>
      <div className="inner border-x border-dashed flex-col flex relative">
        <div className="size-1 bg-background border absolute top-0 left-0" />

        <section className="py-24 px-8">
          <div className="max-w-xl text-center mx-auto flex flex-col items-center gap-4">
            <div className="py-1 text-sm pl-2 pr-4 rounded-lg border flex items-center gap-1">
              <SolarStarAngleLineDuotone />
              AI-powered documentation
            </div>
            <h1 className="text-5xl font-semibold">
              Turn any codebase into clear, structured documentation
            </h1>
            <p className="max-w-md text-lg">
              Archon analyzes your repositories and microservices to understand how everything
              fits together, then generates technical docs, onboarding guides, and user
              documentation all in one place.
            </p>
            <Link to="/auth" className={buttonVariants()}>
              Get Started <SolarArrowRightLineDuotone />
            </Link>
          </div>
        </section>

        <section className="px-8 pb-24">
          <div className="grid grid-cols-3 items-start gap-4">
            <FeatureCard
              icon={<SolarDocumentLineDuotone />}
              title="Complete technical docs"
              description="Generates structured documentation covering your architecture, APIs, and service interactions without manual effort."
              rotation="rotate-2"
            />
            <FeatureCard
              icon={<SolarStarsLineLineDuotone />}
              title="Understands your architecture"
              description="Traces data flows and dependencies across your entire system, even across microservice boundaries."
              rotation="-rotate-4"
            />
            <FeatureCard
              icon={<SolarUsersGroupTwoRoundedLineDuotone />}
              title="Onboarding and user guides"
              description="Produces guides that help new team members get up to speed quickly, from setup instructions to system overviews."
              rotation="rotate-6"
            />
          </div>
        </section>
      </div>

      <Separator />

      <div className="inner border-x px-8 py-24">
        <div className="text-center mb-12">
          <SectionBadge icon={<SolarChecklistLineDuotone />} label="Simple workflow" />
          <h2 className="text-3xl font-semibold mt-4">How it works</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            From codebase to comprehensive documentation in three steps
          </p>
        </div>
        <div className="grid grid-cols-3 gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="size-10 border rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
              1
            </div>
            <StepCard
              number={1}
              icon={<SolarCode2Linear />}
              title="Link your repositories"
              description="Add one or more Git repos and select branches. Archon supports multi-repo documentation out of the box."
              rotation="rotate-1"
            />
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="size-10 border rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
              2
            </div>
            <StepCard
              number={2}
              icon={<SolarStarsLineLineDuotone />}
              title="AI generates your docs"
              description="An AI agent clones and explores your codebase, tracing data flows and dependencies to write structured pages."
              rotation="-rotate-2"
            />
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="size-10 border rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
              3
            </div>
            <StepCard
              number={3}
              icon={<SolarDocumentLineDuotone />}
              title="Publish and share"
              description="Toggle visibility to make docs public. Share a link, or install as an AI agent skill for instant context."
              rotation="rotate-3"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="inner border-x px-8 py-24">
        <div className="text-center mb-12">
          <SectionBadge icon={<SolarBoltLineDuotone />} label="AI-native" />
          <h2 className="text-3xl font-semibold mt-4">Built for the AI era</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Documentation that works for humans and AI agents alike
          </p>
        </div>
        <div className="grid grid-cols-2 items-center gap-4 max-w-3xl mx-auto">
          <div className="rotate-1 border border-dashed p-1 rounded-2xl">
            <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6">
              <div className="size-10 border flex justify-center items-center rounded-lg">
                <SolarRocket2Linear />
              </div>
              <h3 className="text-lg my-1">Install as an Agent Skill</h3>
              <p>
                Public docs are automatically exposed as discoverable AI agent skills. Install
                into any agent with a single command.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <code className="text-xs font-mono bg-default/50 border rounded-lg px-3 py-2 block overflow-x-auto">
                  npx flins@latest add archon.noval.me
                </code>
                <code className="text-xs font-mono bg-default/50 border rounded-lg px-3 py-2 block overflow-x-auto">
                  npx skills@latest add https://archon.noval.me
                </code>
              </div>
            </div>
          </div>
          <div className="-rotate-2 border border-dashed p-1 rounded-2xl">
            <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6">
              <div className="size-10 border flex justify-center items-center rounded-lg">
                <SolarChatRoundDotsLinear />
              </div>
              <h3 className="text-lg my-1">Ask AI about any page</h3>
              <p>
                Send any documentation page directly to ChatGPT, Claude, or Cursor with a single
                click. Pre-loaded context, ready for questions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="inner border-x px-8 py-24">
        <div className="text-center mb-12">
          <SectionBadge icon={<SolarWidget2LineDuotone />} label="Full-featured" />
          <h2 className="text-3xl font-semibold mt-4">Everything you need</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Full-featured documentation generation with granular control
          </p>
        </div>
        <div className="grid grid-cols-3 items-center gap-4 max-w-4xl mx-auto">
          <FeatureCard
            icon={<SolarBranchingPathsDownLinear />}
            title="Branch-aware"
            description="Select specific branches for each repository. Document exactly the version of your codebase that matters."
            rotation="rotate-1"
          />
          <FeatureCard
            icon={<SolarPenNewSquareLinear />}
            title="Custom instructions"
            description="Guide the AI with tone, focus areas, or output preferences. Regenerate anytime with updated instructions."
            rotation="-rotate-3"
          />
          <FeatureCard
            icon={<SolarRestartLinear />}
            title="Regenerate anytime"
            description="Codebase evolved? Regenerate documentation from scratch with new instructions while preserving your project settings."
            rotation="rotate-2"
          />
          <FeatureCard
            icon={<SolarCode2Linear />}
            title="Developer docs"
            description="API references, architecture overviews, data flow diagrams, and service interaction maps generated from source code."
            rotation="-rotate-1"
          />
          <FeatureCard
            icon={<SolarGlobalLinear />}
            title="Public or private"
            description="Keep docs private for your team or publish them publicly with a shareable link. Toggle visibility at any time."
            rotation="rotate-3"
          />
          <FeatureCard
            icon={<SolarUsersGroupTwoRoundedLineDuotone />}
            title="Onboarding guides"
            description="Step-by-step setup instructions, environment configuration, and project walkthroughs to ramp up new engineers fast."
            rotation="-rotate-2"
          />
        </div>
      </div>

      <Separator />

      <div className="inner border-x px-8 py-24">
        <div className="max-w-2xl mx-auto border border-dashed p-1 rounded-2xl">
              <div className="border p-8 rounded-xl bg-surface shadow-xl shadow-black/6 text-center flex flex-col items-center gap-2">
                <SectionBadge icon={<SolarArrowRightUpLineDuotone />} label="Get started" />
                <h2 className="text-3xl font-semibold mt-2">Ready to document your codebase?</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Sign in, link your repositories, and let AI generate comprehensive documentation
              in minutes.
            </p>
            <div className="mt-6">
              <Link to="/auth" className={buttonVariants()}>
                Get Started <SolarArrowRightLineDuotone />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t">
        <div className="inner border-x px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/archon.svg" className="size-5" alt="" />
              <span className="text-sm text-muted-foreground">Archon</span>
            </div>
            <a
              href="https://github.com/powxenv/archon"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:underline decoration-wavy"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
