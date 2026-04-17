import {
  pgTable,
  text,
  varchar,
  timestamp,
  index,
  integer,
  pgEnum,
  type AnyPgColumn,
  boolean,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { user } from "./auth.server";

export * from "./auth.server";

export const pageTypeEnum = pgEnum("page_type", ["page", "group"]);

export const documentations = pgTable(
  "documentation",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    documentationTypeId: text("documentation_type_id").references(() => documentationTypes.id, {
      onDelete: "restrict",
    }),
    isGenerated: boolean("is_generated").default(false).notNull(),
    isPublic: boolean("is_public").default(false).notNull(),
    isDirty: boolean("is_dirty").default(false).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index().on(table.slug), index().on(table.userId)],
);

export const repositories = pgTable(
  "repository",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    documentationId: text("documentation_id")
      .notNull()
      .references(() => documentations.id, { onDelete: "cascade" }),
    url: varchar("url", { length: 2048 }).notNull(),
    branch: varchar("branch", { length: 100 }).default("main"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index().on(table.documentationId)],
);

export const documentationTypes = pgTable("documentation_type", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  description: text("description"),
  systemPrompt: text("system_prompt").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const documentationPages = pgTable(
  "documentation_page",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    documentationId: text("documentation_id")
      .notNull()
      .references(() => documentations.id, { onDelete: "cascade" }),
    type: pageTypeEnum("type").notNull().default("page"),
    parentId: text("parent_id").references((): AnyPgColumn => documentationPages.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 500 }).notNull(),
    slug: varchar("slug", { length: 500 }).notNull(),
    content: text("content"),
    order: integer("order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index().on(table.documentationId),
    index().on(table.parentId),
    uniqueIndex("documentation_page_slug_unique").on(table.documentationId, table.slug),
  ],
);

export const documentationsRelations = relations(documentations, ({ one, many }) => ({
  user: one(user, {
    fields: [documentations.userId],
    references: [user.id],
  }),
  documentationType: one(documentationTypes, {
    fields: [documentations.documentationTypeId],
    references: [documentationTypes.id],
  }),
  repositories: many(repositories),
  documentationPages: many(documentationPages),
  jobs: many(documentationJobs),
}));

export const repositoriesRelations = relations(repositories, ({ one, many }) => ({
  documentations: one(documentations, {
    fields: [repositories.documentationId],
    references: [documentations.id],
  }),
  documentationPages: many(documentationPages),
}));

export const documentationTypesRelations = relations(documentationTypes, ({ many }) => ({
  documentations: many(documentations),
}));

export const documentationPagesRelations = relations(documentationPages, ({ one, many }) => ({
  documentations: one(documentations, {
    fields: [documentationPages.documentationId],
    references: [documentations.id],
  }),
  parent: one(documentationPages, {
    fields: [documentationPages.parentId],
    references: [documentationPages.id],
  }),
  children: many(documentationPages),
}));

export const jobStatusEnum = pgEnum("job_status", [
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled",
]);

export const documentationJobs = pgTable(
  "documentation_jobs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    documentationId: text("documentation_id")
      .notNull()
      .references(() => documentations.id, { onDelete: "cascade" }),
    status: jobStatusEnum("status").notNull().default("pending"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    errorMessage: text("error_message"),
    output: text("output"),
    metadata: jsonb("metadata")
      .$type<{
        repositories: Array<{ url: string; branch: string }>;
        documentationType: string;
        systemPrompt: string;
      }>()
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("job_status_idx").on(table.status),
    index("job_created_at_idx").on(table.createdAt),
    index("job_documentation_id_idx").on(table.documentationId),
  ],
);

export const documentationJobsRelations = relations(documentationJobs, ({ one }) => ({
  documentation: one(documentations, {
    fields: [documentationJobs.documentationId],
    references: [documentations.id],
  }),
}));

export type DocumentationJob = typeof documentationJobs.$inferSelect;
export type NewDocumentationJob = typeof documentationJobs.$inferInsert;
