import { createServerFn } from "@tanstack/react-start";
import { ensureSession } from "./auth.func";
import { db } from "../server/db";
import { documentationTypes, projects as projectTable } from "#/lib/server/db/schema";
import { eq } from "drizzle-orm";

export const getProjects = createServerFn({ method: "GET" }).handler(async () => {
  const session = await ensureSession();

  const projects = await db
    .select()
    .from(projectTable)
    .where(eq(projectTable.userId, session.user.id))
    .innerJoin(documentationTypes, eq(projectTable.id, documentationTypes.id));

  return projects;
});
