# Archon — Product Specification Document

## 1. Product Overview

**Product Name:** Archon
**Tagline:** Turn any codebase into clear, structured documentation
**URL:** https://archon.noval.me
**Repository:** https://github.com/powxenv/archon

### 1.1 Problem Statement

Creating and maintaining technical documentation is time-consuming, error-prone, and often neglected. Teams struggle with:
- Outdated documentation that diverges from the actual codebase
- Inconsistent quality and coverage across documentation
- No onboarding materials for new team members
- Documentation that is siloed and inaccessible to AI tools

### 1.2 Product Vision

Archon is an AI-powered documentation platform that autonomously generates comprehensive, structured documentation from codebases. Users point it at GitHub repositories, and an AI agent clones, explores, and analyzes the entire codebase to produce navigable, publishable documentation — without manual writing.

### 1.3 Target Users

| Persona | Description |
|---|---|
| Engineering Leads | Need onboarding docs for new hires and architecture references |
| Open Source Maintainers | Want comprehensive docs without manual effort |
| DevOps / Platform Teams | Need up-to-date technical references across microservices |
| Technical Writers | Use AI-generated docs as a starting baseline for refinement |
| AI Agent Developers | Discover and consume documentation as agent skills |

---

## 2. Core Product Features

### 2.1 Authentication & Access Control

**Description:** Secure user authentication with email/password and GitHub OAuth.

| Capability | Details |
|---|---|
| Sign In | Email + password authentication |
| Sign Up | Name, email, password (min 8 chars, max 128) |
| GitHub OAuth | One-click sign in via GitHub |
| Session Management | Cookie-based sessions via Better Auth |
| Access Restriction | Whitelisted email domains (`testsprite.com`) and specific emails |
| Error Handling | Dedicated `/auth/error` page with error code and message display |

**User Flows:**
1. User navigates to `/auth` → selects Sign In or Sign Up tab
2. Provides credentials or clicks "Sign in with GitHub"
3. On success → redirected to `/app` (dashboard)
4. On failure → error displayed inline or on `/auth/error`

### 2.2 Documentation Dashboard

**Description:** Central hub for managing all documentation projects.

**Route:** `/app`

| Capability | Details |
|---|---|
| List Documentations | Grid view of all user's documentation projects |
| Status Indicators | Visual badges: Generating (spinner), Failed (red), Cancelled (yellow), Generated (description) |
| Visibility Badge | Public (globe icon) or Private (lock icon) per documentation |
| Dirty Indicator | "Updated" badge when unpublished changes exist |
| Quick Navigation | Click card → routes to edit page or status page based on generation state |
| Empty State | Guided onboarding with 3-step visual walkthrough for first-time users |
| Create New | "New Documentation" button → navigates to creation wizard |

### 2.3 Documentation Creation Wizard

**Description:** Multi-step wizard for creating a new documentation project.

**Route:** `/app/new`

#### Step 1: Name Your Documentation
- Input: Documentation name (required, max 255 chars)
- Auto-generates URL slug from name

#### Step 2: Choose Documentation Type
- Radio selection from seeded documentation types:

| Type | Slug | Purpose |
|---|---|---|
| Onboarding Guide | `onboarding` | Setup instructions, project overview, first contributions |
| Developer Reference | `developer` | Architecture, APIs, data flows, system internals |
| User Manual | `user` | Features, workflows, troubleshooting for end-users |

- Each type has a unique system prompt that guides AI generation behavior

#### Step 3: Add Repositories
- Input: One or more HTTPS GitHub repository URLs
- Validation: Must be valid HTTPS URLs (no SSH)
- Support for multiple repositories (multi-repo documentation)
- Add/remove repository inputs dynamically

#### Step 4: Select Branches
- Fetches available branches from each repository via GitHub API
- Autocomplete dropdown with search/filter for each repo
- Select specific branch to document per repository

#### Step 5: Custom Instructions (Optional)
- Free-text textarea for AI guidance
- Max 2000 characters after sanitization
- Sanitization strips injection patterns (jailbreak, roleplay, system prompts, etc.)
- Soft guidance — does not override system rules

**On Submit:**
- Creates documentation record with unique slug
- Stores repository associations
- Enqueues a background job for AI generation
- Redirects to status tracking page

### 2.4 Documentation Generation (AI Worker)

**Description:** Background worker that autonomously generates documentation using AI.

**Architecture:**

```
User creates documentation
       ↓
Job enqueued (status: pending)
       ↓
Worker polls every 2 seconds
       ↓
Dequeue job → clone repos → run OpenCode AI
       ↓
AI explores codebase using MCP tools
       ↓
AI creates pages via MCP server
       ↓
AI calls mark_generated when done
       ↓
Job marked completed/failed
```

**Worker Configuration:**
- Poll interval: 2 seconds
- Max concurrent jobs: configurable (default 2)
- Job timeout: 30 minutes (stale jobs auto-reset)
- Job directory: `/tmp/archon-jobs/{jobId}`

**MCP Server Tools (exposed to AI agent):**

| Tool | Purpose |
|---|---|
| `create_page` | Create documentation pages (type: "page") or section groups (type: "group") with title, content, parent, and order |
| `get_groups` | List all existing groups to discover placement for new pages |
| `mark_generated` | Mark documentation as complete with a description of coverage |

**AI Agent Capabilities:**
- Autonomous codebase exploration (no human intervention)
- Web research via Exa MCP (optional, when `EXA_API_KEY` is set)
- Code context search
- Deep research for complex topics
- Structured page creation with hierarchy (groups → pages)

**Job Lifecycle:**

| Status | Description |
|---|---|
| `pending` | Waiting in queue |
| `running` | AI agent actively working |
| `completed` | Successfully generated and marked |
| `failed` | Error occurred (error message stored) |
| `cancelled` | User cancelled or worker shutdown |

### 2.5 Generation Status Tracking

**Description:** Real-time status tracking for documentation generation.

**Route:** `/app/new/$documentationId/status`

| Capability | Details |
|---|---|
| Live Polling | Polls job status every 2 seconds |
| Status Display | Visual spinner + status message |
| Error Display | Shows error message on failure |
| Cancel | Cancel an active generation job |
| Regenerate | Restart generation with optional new custom instructions |
| Completion | "View Documentation" button on success |

**Status Messages:**
- Pending: "Waiting to start..."
- Running: "Generating documentation... This may take a few minutes."
- Completed: "Documentation generated successfully!"
- Failed: "Generation failed." + error details
- Cancelled: "Generation cancelled."

### 2.6 Documentation Viewer

**Description:** Public/private documentation reading experience.

**Routes:**
- `/docs/$slug` — redirects to first page
- `/docs/$slug/$pageSlug` — individual page view

| Capability | Details |
|---|---|
| Sidebar Navigation | Hierarchical page list with groups and pages |
| Page Content | Markdown rendered to HTML with syntax highlighting |
| Code Highlighting | Automatic language detection via highlight.js |
| Mermaid Diagrams | Rendered inline from mermaid code blocks |
| Previous/Next | Sequential page navigation at bottom |
| SEO | Dynamic meta tags (title, description, OpenGraph, Twitter cards) per page |
| Access Control | Public docs accessible to all; private docs only to owner |
| Owner Actions | "Edit" link visible to documentation owner |

**Ask AI Dropdown:**
- Send page context to ChatGPT, Claude, or Cursor with pre-loaded prompt
- Opens external AI tool with URL-based prompt containing the documentation page URL

**Add to AI Agent:**
- Modal with copyable CLI commands:
  - `npx flins@latest add archon.noval.me --skill archon-docs-{slug}`
  - `npx skills@latest add {origin} --skill archon-docs-{slug}`

### 2.7 Documentation Editor

**Description:** Edit existing documentation settings, content, and lifecycle.

**Route:** `/app/$documentationId`

| Capability | Details |
|---|---|
| Edit Name | Text field with validation (1-255 chars) |
| Edit Description | Textarea |
| Edit Repositories | Modal wizard to update repo URLs and branches |
| Toggle Public/Private | Switch control for visibility |
| Save Changes | Persists name, description, and repositories |
| Regenerate | Full regeneration with confirmation + optional new instructions |
| Delete | Confirmation modal, permanently removes documentation and all pages |
| View Published | Link to `/docs/$slug` for generated documentation |
| Dirty Flag | "Unpublished changes" badge when edits are pending |

**Auto-redirect:** Ungenerated documentation redirects to the status page.

### 2.8 Agent Skills Discovery

**Description:** Automatic exposure of public documentation as discoverable AI agent skills.

**Endpoints:**
- `/.well-known/agent-skills/index.json` — Discovery index listing all public skills
- `/.well-known/agent-skills/{skillName}/SKILL.md` — Individual skill markdown

**Skill Name Format:** `archon-docs-{slug}`

**Discovery Index Schema** (Agent Skills Discovery RFC v0.2.0):
```json
{
  "$schema": "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  "skills": [
    {
      "name": "archon-docs-my-project",
      "type": "skill-md",
      "description": "...",
      "url": "/.well-known/agent-skills/archon-docs-my-project/SKILL.md",
      "digest": "sha256:..."
    }
  ]
}
```

**SKILL.md Contents:**
- YAML frontmatter with name and description
- Documentation title and description
- Page listing with links (root pages + grouped pages)
- Usage instructions for AI consumption

**Caching:** 5-minute cache (`max-age=300`) on both endpoints.

---

## 3. Technical Architecture

### 3.1 System Architecture

```
┌─────────────────────────────────────────────┐
│                   Frontend                   │
│         TanStack Start (React SSR)           │
│    Vite + Tailwind CSS v4 + HeroUI v3        │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴───────┐
       │  Server Fn     │  (createServerFn API)
       │  (RPC Layer)   │
       └───────┬───────┘
               │
    ┌──────────┼──────────────┐
    ▼          ▼              ▼
┌────────┐ ┌────────┐  ┌───────────┐
│  Auth  │ │  Docs  │  │   Jobs    │
│ (Better│ │Functions│  │ Functions │
│  Auth) │ │        │  │           │
└───┬────┘ └───┬────┘  └─────┬─────┘
    │          │             │
    └──────────┼─────────────┘
               ▼
      ┌────────────────┐
      │  PostgreSQL    │
      │  (Neon +       │
      │   Drizzle ORM) │
      └────────────────┘

┌─────────────────────────────────────────────┐
│              Background Worker               │
│         (Bun process, long-running)          │
│                                              │
│  Poll → Dequeue → Clone → Run OpenCode AI    │
│         ↓                                    │
│  ┌─────────────────────┐                     │
│  │    MCP Server        │                    │
│  │  (stdio transport)   │                    │
│  │                      │                    │
│  │  - create_page       │                    │
│  │  - get_groups        │                    │
│  │  - mark_generated    │                    │
│  └──────────────────────┘                    │
└─────────────────────────────────────────────┘
```

### 3.2 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | TanStack Start | Full-stack React with file-based routing and SSR |
| UI | HeroUI v3 + Tailwind CSS v4 | Component library and styling |
| Database | PostgreSQL (Neon Serverless) | Primary data store |
| ORM | Drizzle ORM | Type-safe database queries |
| Auth | Better Auth | Authentication with GitHub OAuth |
| AI Agent | OpenCode | CLI-based AI agent for codebase analysis |
| AI Protocol | MCP (Model Context Protocol) | Tool interface for AI ↔ database |
| Search | Exa (optional) | Web research capabilities for AI |
| Markdown | marked + highlight.js | Rendering and syntax highlighting |
| Diagrams | mermaid | Inline diagram rendering |
| Validation | Zod v4 | Runtime type checking |
| Forms | React Hook Form | Form state management |
| Runtime | Bun | JavaScript runtime |
| Process Manager | PM2 | Production process management |

### 3.3 Database Schema

**Core Tables:**

| Table | Purpose | Key Fields |
|---|---|---|
| `user` | User accounts | id, name, email, image |
| `session` | Auth sessions | id, token, userId, expiresAt |
| `account` | OAuth accounts | id, providerId, accountId, userId |
| `documentation` | Documentation projects | id, userId, name, slug, description, isPublic, isGenerated, isDirty, customInstructions, documentationTypeId |
| `documentation_type` | Documentation templates | id, name, slug, description, systemPrompt |
| `repository` | Linked GitHub repos | id, documentationId, url, branch |
| `documentation_page` | Generated pages | id, documentationId, type (page/group), parentId, title, slug, content, order |
| `documentation_jobs` | Background jobs | id, documentationId, status, metadata, startedAt, completedAt, errorMessage, output |

**Relationships:**
- User → Documentations (1:many)
- Documentation → Repositories (1:many)
- Documentation → Pages (1:many, hierarchical via parentId)
- Documentation → DocumentationType (many:1)
- Documentation → Jobs (1:many)
- Page → Page (self-referential for groups)

### 3.4 Project Structure

```
archon/
├── src/
│   ├── components/           # UI components
│   │   ├── header.tsx        # Global navigation header
│   │   ├── markdown-content.tsx  # Markdown HTML renderer
│   │   └── new-form.tsx      # Reusable wizard form layout
│   ├── lib/
│   │   ├── client/
│   │   │   └── auth.ts       # Client-side auth client
│   │   ├── func/             # Server functions (RPC API)
│   │   │   ├── auth.functions.ts   # Session management
│   │   │   ├── docs.functions.ts   # Documentation CRUD + regeneration
│   │   │   └── jobs.functions.ts   # Job status + cancellation
│   │   ├── server/
│   │   │   ├── agent-skills.ts     # Agent Skills Discovery logic
│   │   │   ├── auth.server.ts      # Better Auth configuration
│   │   │   ├── db/
│   │   │   │   ├── auth.server.ts  # User/session/account schema
│   │   │   │   ├── index.server.ts # Database connection
│   │   │   │   ├── schema.server.ts # Full schema + relations
│   │   │   │   └── seed.server.ts  # Documentation type seeds
│   │   │   └── jobs/
│   │   │       └── index.server.ts # Job queue (enqueue, dequeue, status)
│   │   ├── utils/
│   │   │   ├── markdown.ts   # Markdown → HTML with highlight.js + mermaid
│   │   │   └── sanitize.ts   # Prompt injection prevention
│   │   ├── env.ts            # Environment variable validation
│   │   └── utils.ts          # Slug generation, initials, hash rotation
│   ├── routes/               # TanStack Router file-based routes
│   │   ├── __root.tsx        # Root layout, session loading, meta
│   │   ├── _app.tsx          # Header layout wrapper
│   │   ├── _app.index.tsx    # Landing page
│   │   ├── _app_.app.tsx     # Dashboard layout
│   │   ├── _app.app.index.tsx       # Documentation dashboard
│   │   ├── _app_.app.new.index.tsx  # Creation wizard (5 steps)
│   │   ├── _app_.app.new.$documentationId.status.tsx  # Status tracking
│   │   ├── _app_.app.$documentationId.tsx             # Editor
│   │   ├── docs.$slug.index.tsx      # Doc viewer (redirect)
│   │   ├── docs.$slug.$pageSlug.tsx  # Doc viewer (page)
│   │   ├── auth.tsx                  # Auth layout (redirects if logged in)
│   │   ├── auth.index.tsx            # Sign in/up forms
│   │   ├── auth.error.index.tsx      # Auth error display
│   │   ├── api/auth/$.ts            # Better Auth API handler
│   │   └── .well-known/             # Agent Skills endpoints
│   ├── router.tsx
│   ├── routeTree.gen.ts
│   └── styles.css
├── services/
│   ├── worker/
│   │   └── index.ts          # Background job processor
│   └── mcp-server/
│       └── index.ts          # MCP tool server for AI agent
├── drizzle.config.ts
├── ecosystem.config.cjs       # PM2 production config
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 3.5 API Surface (Server Functions)

| Function | Method | Purpose |
|---|---|---|
| `getSession` | GET | Get current session (nullable) |
| `ensureSession` | GET | Get current session (throws if null) |
| `getDocumentations` | GET | List user's documentations with job status |
| `getDocumentationTypes` | GET | List available documentation types |
| `createDocumentation` | POST | Create documentation + enqueue job |
| `getDocumentationBySlug` | GET | Get documentation by slug (access control) |
| `getDocumentationPageBySlug` | GET | Get page with rendered HTML |
| `getDocumentationForEdit` | GET | Get full documentation for editing |
| `updateDocumentation` | POST | Update name, description, repos, pages, visibility |
| `deleteDocumentation` | POST | Permanently delete documentation |
| `regenerateDocumentation` | POST | Clear pages + enqueue new job |
| `getRepoBranches` | GET | Fetch branches from GitHub API |
| `createJob` | POST | Enqueue a documentation job |
| `getJobStatus` | GET | Get job by ID |
| `getDocumentationJobs` | GET | List jobs for a documentation |
| `cancelDocumentationJob` | POST | Cancel a running job |
| `getLatestJob` | GET | Get most recent job for a documentation |

### 3.6 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Neon) |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth app client secret |
| `MAX_CONCURRENT_JOBS` | No | Worker concurrency limit (default: 2) |
| `OPENCODE_PATH` | No | Custom path to opencode binary |
| `EXA_API_KEY` | No | Enables web research in AI generation |

---

## 4. User Flows

### 4.1 First-Time User

```
Landing Page → Sign In/Sign Up → Dashboard (empty state)
→ "New Documentation" → Name → Type → Repos → Branches
→ Custom Instructions → Submit → Status Page (polling)
→ Generation Complete → View Documentation
```

### 4.2 Generating Documentation

```
Dashboard → Click "New Documentation"
→ Step 1: Enter name (e.g. "Frontend API Docs")
→ Step 2: Select type (e.g. "Developer Reference")
→ Step 3: Add repo URLs (e.g. https://github.com/org/frontend)
→ Step 4: Select branch (e.g. "main")
→ Step 5: Optional custom instructions
→ Submit → Redirected to status page
→ Watch progress (spinner, status messages)
→ On completion: "View Documentation" button
```

### 4.3 Viewing Documentation

```
Public URL: /docs/{slug}
→ Sidebar with page hierarchy
→ Click page → rendered markdown with code highlighting
→ Navigate between pages (prev/next)
→ Ask AI about page (ChatGPT/Claude/Cursor)
→ Add to AI Agent (copy CLI commands)
```

### 4.4 Editing Documentation

```
Dashboard → Click documentation card
→ Edit page: name, description, repositories, visibility
→ Save changes
→ Regenerate (optional): confirm → new instructions → regenerate
→ Delete (optional): confirm → permanent removal
```

### 4.5 AI Agent Skill Discovery

```
External AI tool → Query /.well-known/agent-skills/index.json
→ Find relevant skill (e.g. "archon-docs-my-project")
→ Fetch /.well-known/agent-skills/archon-docs-my-project/SKILL.md
→ AI reads skill contents with page URLs
→ AI fetches specific pages as needed
```

---

## 5. Non-Functional Requirements

### 5.1 Security
- All repository URLs must use HTTPS (SSH rejected)
- Custom instructions sanitized against prompt injection patterns
- Session-based authentication with cookie tokens
- Access control: private documentation only accessible to owner
- CORS and CSP via TanStack Start defaults

### 5.2 Performance
- Server-side rendering for documentation pages
- 5-minute cache on Agent Skills endpoints
- Neon serverless PostgreSQL for auto-scaling
- Shallow git clone (`--depth 1`) for worker speed
- Job polling at 2-second intervals

### 5.3 Reliability
- Stale job detection: jobs running >30 minutes are auto-reset to pending
- Orphaned job cleanup on worker startup
- Graceful shutdown: worker cancels running jobs on SIGINT/SIGTERM
- PM2 auto-restart for production (max 10 restarts, 5s delay)
- Row-level locking (`FOR UPDATE SKIP LOCKED`) for job dequeuing

### 5.4 Type Safety
- End-to-end TypeScript with strict null checks
- Zod validation on all API inputs
- Drizzle ORM for type-safe database queries
- No `any` types; discriminated unions for job status

---

## 6. Constraints & Limitations

| Constraint | Details |
|---|---|
| Public Repos Only | Only public GitHub repositories can be documented (shallow clone without auth) |
| GitHub Only | Repository integration is GitHub-specific (branch fetching uses GitHub API) |
| Access Control | Sign-up restricted to whitelisted email domains and addresses |
| No Real-time Updates | Job status uses polling (2s interval), not WebSockets |
| No Version History | Editing/regeneration replaces content; no version diffing |
| Single AI Provider | Generation relies on OpenCode CLI with its default AI provider |
| Max Concurrent Jobs | Configurable but limited (default: 2) |
| No Collaborative Editing | Single-owner documentation; no multi-user collaboration |
| Google OAuth Placeholder | UI shows Google sign-in button but it is disabled |

---

## 7. Future Considerations

These items are not currently implemented but represent logical extensions:

- Private repository support via GitHub App authentication
- Webhook-based regeneration on repository changes
- Multi-language documentation generation
- Custom domain support for published documentation
- Team/organization accounts with shared documentation
- API key authentication for programmatic access
- Export to PDF/HTML/static site
- Versioned documentation tied to git tags/releases
- Real-time job progress via Server-Sent Events or WebSockets
