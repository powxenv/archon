import { createServerFn } from "@tanstack/react-start";
import { ensureSession } from "./auth.func";
import {
  enqueueJob,
  getJob,
  getJobsByDocumentation,
  cancelJob,
  type JobWithMetadata,
  type DocumentationJob,
} from "../server/jobs";
import { z } from "zod";
import { documentationJobs } from "../server/db/schema";
import { eq } from "drizzle-orm";
import { db } from "../server/db";

export const createJob = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      documentationId: z.string(),
      repositories: z.array(
        z.object({
          url: z.string().url().refine((url) => url.startsWith("https://"), {
            message: "Repository URL must use HTTPS",
          }),
          branch: z.string(),
        }),
      ),
      documentationType: z.string(),
      systemPrompt: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    await ensureSession();

    const job = await enqueueJob(data);

    return job;
  });

export const getJobStatus = createServerFn({ method: "GET" })
  .inputValidator(z.string())
  .handler(async ({ data }) => {
    await ensureSession();

    const job = await getJob(data);

    return job;
  });

export const getDocumentationJobs = createServerFn({ method: "GET" })
  .inputValidator(z.string())
  .handler(async ({ data }) => {
    await ensureSession();

    const jobs = await getJobsByDocumentation(data);

    return jobs;
  });

export const cancelDocumentationJob = createServerFn({ method: "POST" })
  .inputValidator(z.string())
  .handler(async ({ data }) => {
    await ensureSession();

    const job = await cancelJob(data);

    return job;
  });

export const getLatestJob = createServerFn({ method: "GET" })
  .inputValidator(z.string())
  .handler(async ({ data }) => {
    await ensureSession();

    const [job] = await db
      .select()
      .from(documentationJobs)
      .where(eq(documentationJobs.documentationId, data))
      .orderBy(documentationJobs.createdAt)
      .limit(1);

    if (!job) return null;
    if (!job.metadata) return null;

    return job as JobWithMetadata;
  });

export type JobStatus = DocumentationJob["status"];
