import { db } from "./index";
import { documentationTypes } from "./schema";

const documentationTypeSeeds = [
  {
    name: "Onboarding Guide",
    slug: "onboarding",
    description:
      "Step-by-step guides to help new developers get started with your codebase quickly",
    systemPrompt:
      "You are a technical writer creating onboarding documentation. Focus on helping new developers understand the project structure, setup process, and core concepts. Write clear, beginner-friendly instructions.",
  },
  {
    name: "Developer Reference",
    slug: "developer",
    description: "In-depth API references and architecture docs for contributors and maintainers",
    systemPrompt:
      "You are a technical writer creating developer reference documentation. Focus on API details, architecture decisions, internal patterns, and integration points. Be precise and comprehensive.",
  },
  {
    name: "User Manual",
    slug: "user",
    description: "End-user documentation explaining features, workflows, and troubleshooting",
    systemPrompt:
      "You are a technical writer creating user-facing documentation. Focus on features, common workflows, FAQs, and troubleshooting. Use simple language and practical examples.",
  },
];

async function main() {
  console.log("Seeding documentation types...");
  await db.insert(documentationTypes).values(documentationTypeSeeds).onConflictDoNothing();
  console.log("Done.");
}

await main();
