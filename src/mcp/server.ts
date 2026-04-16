import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import {
  documentations,
  documentationPages,
} from "../lib/server/db/schema.js";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const server = new McpServer(
  { name: "archon-docs", version: "1.0.0" },
  {
    capabilities: { logging: {} },
    instructions: [
      "Documentation storage server for Archon.",
      "Use create_page to store documentation pages and groups.",
      "Use get_groups to discover existing groups before placing pages under them.",
      "Use mark_generated once all documentation pages have been written.",
    ].join(" "),
  },
);

server.registerTool(
  "create_page",
  {
    title: "Create Documentation Page",
    description:
      "Create a documentation page or group under a documentation entry. Use type 'group' to create a section header, and type 'page' for actual content.",
    inputSchema: {
      documentationId: z.string().describe("ID of the documentation entry"),
      title: z.string().describe("Page title"),
      type: z
        .enum(["page", "group"])
        .default("page")
        .describe("Page type: 'group' for a section, 'page' for content"),
      content: z
        .string()
        .optional()
        .describe("Page body content in markdown. Required for pages, omitted for groups."),
      parentId: z
        .string()
        .optional()
        .describe("Parent group ID to nest this page under"),
      order: z
        .number()
        .optional()
        .describe("Sort order within siblings"),
    },
  },
  async ({ documentationId, title, type, content, parentId, order }) => {
    const id = createId();
    await db.insert(documentationPages).values({
      id,
      documentationId,
      title,
      type,
      content,
      parentId,
      order,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ id, documentationId, title, type }),
        },
      ],
    };
  },
);

server.registerTool(
  "get_groups",
  {
    title: "Get Documentation Groups",
    description:
      "List all groups for a documentation entry. Use this to discover where to place new pages.",
    inputSchema: {
      documentationId: z
        .string()
        .describe("ID of the documentation entry"),
    },
  },
  async ({ documentationId }) => {
    const groups = await db
      .select({
        id: documentationPages.id,
        title: documentationPages.title,
        parentId: documentationPages.parentId,
        order: documentationPages.order,
      })
      .from(documentationPages)
      .where(
        and(
          eq(documentationPages.documentationId, documentationId),
          eq(documentationPages.type, "group"),
        ),
      );

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(groups, null, 2),
        },
      ],
    };
  },
);

server.registerTool(
  "mark_generated",
  {
    title: "Mark Documentation as Generated",
    description:
      "Update the documentation entry's isGenerated field to true after all pages have been written.",
    inputSchema: {
      documentationId: z
        .string()
        .describe("ID of the documentation entry"),
    },
  },
  async ({ documentationId }) => {
    await db
      .update(documentations)
      .set({ isGenerated: true })
      .where(eq(documentations.id, documentationId));

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            documentationId,
            isGenerated: true,
          }),
        },
      ],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Archon Docs MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
