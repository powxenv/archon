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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { user } from "./auth";

export * from "./auth";

export const pageTypeEnum = pgEnum("page_type", ["page", "group"]);

export const projects = pgTable(
  "project",
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
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    url: varchar("url", { length: 2048 }).notNull(),
    branch: varchar("branch", { length: 100 }).default("main"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index().on(table.projectId)],
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
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    type: pageTypeEnum("type").notNull().default("page"),
    parentId: text("parent_id").references((): AnyPgColumn => documentationPages.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 500 }).notNull(),
    content: text("content"),
    order: integer("order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index().on(table.projectId), index().on(table.parentId)],
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(user, {
    fields: [projects.userId],
    references: [user.id],
  }),
  documentationType: one(documentationTypes, {
    fields: [projects.documentationTypeId],
    references: [documentationTypes.id],
  }),
  repositories: many(repositories),
  documentationPages: many(documentationPages),
}));

export const repositoriesRelations = relations(repositories, ({ one, many }) => ({
  project: one(projects, {
    fields: [repositories.projectId],
    references: [projects.id],
  }),
  documentationPages: many(documentationPages),
}));

export const documentationTypesRelations = relations(documentationTypes, ({ many }) => ({
  projects: many(projects),
}));

export const documentationPagesRelations = relations(documentationPages, ({ one, many }) => ({
  project: one(projects, {
    fields: [documentationPages.projectId],
    references: [projects.id],
  }),
  parent: one(documentationPages, {
    fields: [documentationPages.parentId],
    references: [documentationPages.id],
  }),
  children: many(documentationPages),
}));
