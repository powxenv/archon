import { db } from "../db/index.server";
import {
  documentationJobs,
  type DocumentationJob,
} from "../db/schema.server";
import { eq, and, lt, desc, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export type JobInput = {
  documentationId: string;
  repositories: Array<{ url: string; branch: string }>;
  documentationType: string;
  systemPrompt?: string;
};

export type JobStatus = DocumentationJob["status"];

type JobWithMetadata = DocumentationJob & {
  metadata: NonNullable<DocumentationJob["metadata"]>;
};

const MAX_JOB_AGE = 1000 * 60 * 30;

function assertHasMetadata(job: DocumentationJob): JobWithMetadata {
  if (!job.metadata) {
    throw new Error(`Job ${job.id} is missing metadata`);
  }
  return job as JobWithMetadata;
}

export async function enqueueJob(input: JobInput): Promise<JobWithMetadata> {
  const [job] = await db
    .insert(documentationJobs)
    .values({
      id: createId(),
      documentationId: input.documentationId,
      status: "pending",
      metadata: input,
    })
    .returning();

  if (!job) {
    throw new Error("Failed to create job");
  }

  return assertHasMetadata(job);
}

export async function dequeueJob(): Promise<JobWithMetadata | null> {
  const staleThreshold = new Date(Date.now() - MAX_JOB_AGE);

  const result = await db
    .select()
    .from(documentationJobs)
    .where(
      and(
        eq(documentationJobs.status, "pending"),
        sql`${documentationJobs.createdAt} > ${staleThreshold}`,
      ),
    )
    .orderBy(documentationJobs.createdAt)
    .limit(1)
    .for("update", { skipLocked: true });

  if (result.length === 0) return null;

  const [job] = result;

  const [updated] = await db
    .update(documentationJobs)
    .set({
      status: "running",
      startedAt: new Date(),
    })
    .where(eq(documentationJobs.id, job.id))
    .returning();

  if (!updated) return null;

  return assertHasMetadata(updated);
}

export async function updateJobStatus(
  id: string,
  status: JobStatus,
  data?: { output?: string; errorMessage?: string },
): Promise<JobWithMetadata | null> {
  const updateData: Partial<DocumentationJob> = { status };

  if (status === "completed" || status === "failed" || status === "cancelled") {
    updateData.completedAt = new Date();
  }

  if (data?.output !== undefined) {
    updateData.output = data.output;
  }

  if (data?.errorMessage !== undefined) {
    updateData.errorMessage = data.errorMessage;
  }

  const [updated] = await db
    .update(documentationJobs)
    .set(updateData)
    .where(eq(documentationJobs.id, id))
    .returning();

  if (!updated) return null;

  return assertHasMetadata(updated);
}

export async function getJob(id: string): Promise<JobWithMetadata | null> {
  const [job] = await db
    .select()
    .from(documentationJobs)
    .where(eq(documentationJobs.id, id))
    .limit(1);

  if (!job) return null;

  return assertHasMetadata(job);
}

export async function getJobsByDocumentation(documentationId: string): Promise<JobWithMetadata[]> {
  const jobs = await db
    .select()
    .from(documentationJobs)
    .where(eq(documentationJobs.documentationId, documentationId))
    .orderBy(desc(documentationJobs.createdAt));

  return jobs.map(assertHasMetadata);
}

export async function getPendingJobs(): Promise<JobWithMetadata[]> {
  const jobs = await db
    .select()
    .from(documentationJobs)
    .where(eq(documentationJobs.status, "pending"))
    .orderBy(documentationJobs.createdAt);

  return jobs.map(assertHasMetadata);
}

export async function cancelJob(id: string): Promise<JobWithMetadata | null> {
  return updateJobStatus(id, "cancelled");
}

export async function resetStaleJobs(): Promise<number> {
  const staleThreshold = new Date(Date.now() - MAX_JOB_AGE);

  const result = await db
    .update(documentationJobs)
    .set({
      status: "pending",
      startedAt: null,
      errorMessage: "Job timed out and was reset",
    })
    .where(
      and(
        eq(documentationJobs.status, "running"),
        lt(documentationJobs.startedAt, staleThreshold),
      ),
    );

  return result.rowCount ?? 0;
}

export type { DocumentationJob, JobWithMetadata };
