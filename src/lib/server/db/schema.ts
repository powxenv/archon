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
    content: text("content"),
    order: integer("order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index().on(table.documentationId), index().on(table.parentId)],
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
