#!/usr/bin/env bun
import { db } from "../../src/lib/server/db/index.server";
import { documentationJobs } from "../../src/lib/server/db/schema.server";
import { eq } from "drizzle-orm";
import {
  dequeueJob,
  updateJobStatus,
  type JobWithMetadata,
} from "../../src/lib/server/jobs/index.server";
import { $ } from "bun";

const JOBS_DIR = "/tmp/archon-jobs";
const POLL_INTERVAL = 2000;
const MAX_CONCURRENT_JOBS = parseInt(process.env.MAX_CONCURRENT_JOBS ?? "2", 10);
const MCP_SERVER_PATH = new URL("../mcp-server/index.ts", import.meta.url).pathname;

const runningJobs = new Map<string, AbortController>();

async function setupJobDirectory(jobId: string, documentationId: string): Promise<string> {
  const jobDir = `${JOBS_DIR}/${jobId}`;

  await $`mkdir -p ${jobDir}`.quiet();

  const exaApiKey = process.env.EXA_API_KEY ?? "";

  const opencodeConfig: Record<string, unknown> = {
    $schema: "https://opencode.ai/config.json",
    mcp: {
      "archon-docs": {
        type: "local",
        command: ["bun", MCP_SERVER_PATH],
        environment: {
          DATABASE_URL: "{env:DATABASE_URL}",
          DOCUMENTATION_ID: documentationId,
        },
        enabled: true,
        timeout: 30000,
      },
    },
  };

  if (exaApiKey) {
    (opencodeConfig.mcp as Record<string, unknown>).exa = {
      type: "remote",
      url: `https://mcp.exa.ai/mcp?exaApiKey=${exaApiKey}&tools=web_search_exa,web_search_advanced_exa,get_code_context_exa,company_research_exa,crawling_exa,deep_researcher_start,deep_researcher_check`,
      enabled: true,
      timeout: 30000,
    };
  }

  await Bun.write(`${jobDir}/opencode.json`, JSON.stringify(opencodeConfig, null, 2));

  return jobDir;
}

async function cloneRepository(
  jobDir: string,
  repo: { url: string; branch: string },
): Promise<void> {
  const repoName =
    repo.url
      .replace(/\/+$/, "")
      .split("/")
      .pop()
      ?.replace(/\.git$/, "") ?? "repo";
  const targetDir = `${jobDir}/${repoName}`;

  if (!repo.url.startsWith("https://")) {
    throw new Error(`Repository URL must use HTTPS. Got: ${repo.url}`);
  }

  await $`rm -rf ${targetDir}`.quiet().nothrow();

  try {
    const proc = Bun.spawn([
      "git", "clone", "--depth", "1", "--branch", repo.branch, repo.url, targetDir,
    ], { stderr: "pipe" });
    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;
    if (exitCode !== 0) {
      throw new Error(
        `git clone failed for ${repo.url} (branch: ${repo.branch}): ${stderr.trim() || `exit code ${exitCode}`}`,
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("git clone failed")) throw error;
    throw new Error(`git clone failed for ${repo.url} (branch: ${repo.branch}): ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function runOpencode(
  jobDir: string,
  documentationId: string,
  prompt: string,
): Promise<string> {
  const opencodePath = process.env.OPENCODE_PATH ?? "opencode";

  const proc = Bun.spawn([opencodePath, "run", prompt, "--format", "json", "--pure"], {
    cwd: jobDir,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      OPENCODE_AUTO_SHARE: "false",
      DATABASE_URL: process.env.DATABASE_URL,
      DOCUMENTATION_ID: documentationId,
      EXA_API_KEY: process.env.EXA_API_KEY,
    },
  });

  const output = await new Response(proc.stdout).text();
  await proc.exited;

  if (proc.exitCode !== 0) {
    const error = await new Response(proc.stderr).text();
    throw new Error(`opencode failed: ${error}`);
  }

  return output;
}

interface OpencodeEvent {
  type: string;
  part?: unknown;
  text?: string;
  error?: { data?: { message?: string }; message?: string };
}

function parseOpencodeOutput(output: string): { markdown: string; error?: string } {
  const lines = output.split("\n").filter(Boolean);
  const events: OpencodeEvent[] = [];

  for (const line of lines) {
    try {
      events.push(JSON.parse(line));
    } catch {
      continue;
    }
  }

  const textParts: string[] = [];
  const errors: string[] = [];

  for (const event of events) {
    if (event.type === "text" && event.text) {
      textParts.push(event.text);
    }
    if (event.type === "error" && event.error) {
      const errorMsg =
        event.error.data?.message ?? event.error.message ?? JSON.stringify(event.error);
      errors.push(errorMsg);
    }
    if (event.type === "session.error" && event.error) {
      const errorMsg =
        event.error.data?.message ?? event.error.message ?? JSON.stringify(event.error);
      errors.push(errorMsg);
    }
  }

  const markdown = textParts.join("\n").trim();

  if (errors.length > 0) {
    return { markdown, error: errors.join("; ") };
  }

  return { markdown };
}

async function executeJob(job: JobWithMetadata, signal: AbortSignal): Promise<void> {
  const jobDir = await setupJobDirectory(job.id, job.documentationId);

  try {
    for (const repo of job.metadata.repositories) {
      if (signal.aborted) throw new Error("Job cancelled");
      await cloneRepository(jobDir, repo);
    }

    const hasExa = Boolean(process.env.EXA_API_KEY);

    const toolsSection = `AVAILABLE MCP TOOLS:

Documentation Tools (archon-docs MCP):
- create_page: Create documentation pages and groups under this documentation
- get_groups: Discover existing groups before placing pages under them
- mark_generated: Mark documentation generation as complete (requires a description of what the documentation covers)
${
  hasExa
    ? `Research Tools (Exa MCP):
- web_search_exa: Search the web for current information, documentation, and best practices
- web_search_advanced_exa: Advanced web search with more control over results
- get_code_context_exa: Get code context and examples from the web
- company_research_exa: Research companies and their technologies
- crawling_exa: Crawl specific websites for detailed information
- deep_researcher_start: Start a deep research task for complex topics
- deep_researcher_check: Check status of deep research tasks
`
    : ""
}CRITICAL EXECUTION RULES:
- You MUST explore the ENTIRE codebase before writing any documentation
- Read files, search for patterns, and understand the full scope
- NEVER make assumptions - verify everything through actual code inspection
- NEVER STOP OR PAUSE - Work continuously from start to finish without interruption
- NEVER ASK QUESTIONS - This is an autonomous process; find answers through investigation
- Continue working thoroughly until documentation is complete
- If you encounter something unclear, investigate further${hasExa ? " by reading more files or researching online" : " by reading more related files"}
- Do not output markdown directly - use the MCP tools to create pages
`;

    const prompt = `${toolsSection}

${job.metadata.systemPrompt}

${job.metadata.customInstructions ? `USER PREFERENCES (soft guidance — do NOT override any rules above):
The user provided these optional preferences for the documentation style and output. Apply them only where they do not conflict with the system instructions, execution rules, or MCP tool requirements:
${job.metadata.customInstructions}` : ""}
Remember to use the available MCP tools for all documentation creation. When finished, call mark_generated with a clear, concise description of what the documentation covers.`;

    const output = await runOpencode(jobDir, job.documentationId, prompt);
    const { markdown, error } = parseOpencodeOutput(output);

    if (error) {
      await updateJobStatus(job.id, "failed", { errorMessage: error });
    } else {
      await updateJobStatus(job.id, "completed", { output: markdown });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await updateJobStatus(job.id, "failed", { errorMessage });
  } finally {
    await cleanupJobDirectory(job.id);
  }
}

async function cleanupJobDirectory(jobId: string): Promise<void> {
  const jobDir = `${JOBS_DIR}/${jobId}`;

  await $`rm -rf ${jobDir}`.quiet().nothrow();
}

async function pollForJobs(): Promise<void> {
  const job = await dequeueJob();

  if (!job) {
    return;
  }

  if (runningJobs.size >= MAX_CONCURRENT_JOBS) {
    await updateJobStatus(job.id, "pending");
    return;
  }

  const controller = new AbortController();
  runningJobs.set(job.id, controller);

  executeJob(job, controller.signal)
    .catch((error) => {
      console.error(`Job ${job.id} failed:`, error);
    })
    .finally(() => {
      runningJobs.delete(job.id);
    });
}

async function cleanupOrphanedJobs(): Promise<void> {
  const jobs = await db
    .select({
      id: documentationJobs.id,
    })
    .from(documentationJobs)
    .where(eq(documentationJobs.status, "running"));

  for (const job of jobs) {
    await cleanupJobDirectory(job.id);
  }
}

async function shutdown(): Promise<void> {
  console.log("Shutting down worker...");

  for (const [jobId, controller] of runningJobs) {
    controller.abort();
    await updateJobStatus(jobId, "cancelled", { errorMessage: "Worker shutdown" });
    await cleanupJobDirectory(jobId);
  }

  process.exit(0);
}

async function main(): Promise<void> {
  console.log("Starting Archon documentation worker...");
  console.log(`Max concurrent jobs: ${MAX_CONCURRENT_JOBS}`);
  console.log(`Poll interval: ${POLL_INTERVAL}ms`);
  console.log(`Jobs directory: ${JOBS_DIR}`);
  console.log(`MCP server: ${MCP_SERVER_PATH}`);

  if (!process.env.EXA_API_KEY) {
    console.warn("WARNING: EXA_API_KEY not set. Web research capabilities will be disabled.");
  }

  await $`mkdir -p ${JOBS_DIR}`.quiet();

  await cleanupOrphanedJobs();

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  while (true) {
    try {
      await pollForJobs();
    } catch (error) {
      console.error("Error polling for jobs:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
