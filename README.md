# Archon

[Archon](https://archon.noval.me) is a documentation platform that generates comprehensive, AI-ready documentation from your codebases. Point it at a GitHub repository, and it autonomously analyzes the entire codebase to produce structured, navigable documentation.

## How It Works

1. **Create** a documentation project linked to one or more repositories
2. **Generate** — an AI agent clones the repos, explores the codebase, and writes documentation pages using MCP tools
3. **Publish** — toggle visibility to make documentation publicly accessible at `/docs/{slug}`
4. **Install as an Agent Skill** — public documentation is automatically available as a discoverable AI agent skill

## Agent Skills

Every public documentation is automatically exposed as an [Agent Skill](https://agentskills.io/) following the [Agent Skills Discovery RFC](https://github.com/cloudflare/agent-skills-discovery-rfc). AI agents can discover available skills at:

```
/.well-known/agent-skills/index.json
/.well-known/agent-skills/{name}/SKILL.md
```

To install a documentation skill into your AI agent:

```bash
npx flins@latest add archon.noval.me --skill <docs-name>
// or
npx skills@latest add https://archon.noval.me/ --skill <docs-name>
```

## Tech Stack

- [TanStack Start](https://tanstack.com/start) — full-stack React framework with file-based routing
- [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL — type-safe database layer
- [Better Auth](https://better-auth.com/) — authentication
- [Tailwind CSS v4](https://tailwindcss.com/) + [HeroUI](https://heroui.com/) — styling and components
- [OpenCode](https://opencode.ai/) + MCP — AI-powered documentation generation

## Getting Started

```bash
bun install
bun run dev
```

Start the documentation worker in a separate process:

```bash
bun run worker
```

## Building for Production

```bash
bun run build
```

## Project Structure

```
src/
├── components/        UI components
├── lib/
│   ├── func/          Server functions (API handlers)
│   ├── server/
│   │   ├── db/        Database connection and schema
│   │   ├── jobs/      Job queue management
│   │   └── agent-skills.ts  Agent Skills Discovery logic
│   └── utils/         Utility functions
├── routes/            TanStack Router file-based routes
services/
├── worker/            Background job processor
└── mcp-server/        MCP server for AI documentation tools
```
