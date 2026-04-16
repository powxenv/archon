import { createServerFn } from "@tanstack/react-start";
import { ensureSession } from "./auth.func";
import { db } from "../server/db";
import { documentationTypes, documentations as documentationTable } from "#/lib/server/db/schema";
import { eq } from "drizzle-orm";

export const getDocumentations = createServerFn({ method: "GET" }).handler(async () => {
  const session = await ensureSession();

  const documentations = await db
    .select()
    .from(documentationTable)
    .where(eq(documentationTable.userId, session.user.id))
    .innerJoin(documentationTypes, eq(documentationTable.id, documentationTypes.id));

  return documentations;
});
