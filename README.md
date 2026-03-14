# context-kit

> Generate AI context for your dev stack — works with Claude Code, Cursor, Windsurf, GitHub Copilot, Gemini CLI, or any LLM.

Pick your tools. Pick your AI assistant. Download a zip with:
- The right config file for your assistant (`CLAUDE.md`, `.cursorrules`, `.windsurfrules`, etc.)
- Per-tool skill files with patterns, gotchas, and best practices
- Pre-written Architecture Decision Records (ADRs) for every tool choice
- `.env.example` pre-filled for your stack
- Slash commands: `/plan`, `/adr`, `/architecture`, `/code-review`, `/build-fix`

**[Try it live →](https://context-kit.vercel.app)**  ·  `npm run dev` to run locally

---

## For a new project

```bash
# 1. Go to context-kit, pick your stack and assistant, download the zip
# 2. Extract into your project root
unzip my-project-context-kit.zip -d my-project/

# 3. Start your AI assistant — it will pick up the config automatically
claude  # Claude Code reads CLAUDE.md
# or open Cursor/Windsurf — they read .cursorrules / .windsurfrules automatically
```

That's it. Your AI assistant now knows your stack, enforces best practices, and has decision records for every tool choice.

---

## For an existing project

You have an existing codebase and want AI context that reflects what you're actually using.

### Option 1 — Use context-kit (2 minutes)

1. Go to context-kit, select the tools your project uses, select your assistant
2. Download the zip
3. Copy only the files you need into your project:

```
# For Claude Code:
cp CLAUDE.md your-project/
cp -r .claude/ your-project/
cp -r docs/decisions/ your-project/  # ADRs (optional but recommended)

# For Cursor:
cp .cursorrules your-project/

# For Windsurf:
cp .windsurfrules your-project/

# For GitHub Copilot:
mkdir -p your-project/.github
cp .github/copilot-instructions.md your-project/.github/
```

4. Edit the generated files to reflect your actual project structure — the generator gives you a strong starting point, not a final answer.

### Option 2 — Use the ready-to-paste prompt

Copy the prompt below, fill in the bracketed sections, and paste it into your AI assistant. It will generate the right config files for your project directly.

---

### Ready-to-paste prompt

```
You are helping me set up AI context files for my existing project.

## My project
- Name: [your project name]
- Stack: [e.g. Next.js, PostgreSQL, Prisma, Vercel, Vitest]
- AI assistant I use: [Claude Code / Cursor / Windsurf / GitHub Copilot / Gemini CLI / Other]
- Main language: [TypeScript / JavaScript / Python / other]
- Project type: [web app / API / CLI tool / library / other]

## What I want you to generate

### 1. AI config file
Generate the correct config file for my assistant:
- Claude Code → CLAUDE.md (project root)
- Cursor → .cursorrules (project root)
- Windsurf → .windsurfrules (project root)
- GitHub Copilot → .github/copilot-instructions.md
- Gemini CLI → GEMINI.md

The config file must include:
a) My stack listed with one-line descriptions
b) Universal rules: no `any` types, immutability, error handling, no hardcoded secrets, 80% test coverage
c) Stack-specific rules for EACH tool — e.g. for Next.js: "Server Components by default, never import Server Components into Client Components"; for PostgreSQL: "always parameterized queries, index foreign keys, use transactions for multi-table writes"
d) Git workflow: conventional commits, never push directly to main
e) For Claude Code only: list skill files in .claude/skills/ and available commands

### 2. Per-tool skill files (Claude Code only)
For each tool in my stack, generate .claude/skills/[tool].md with:
- Best practices (enforceable rules)
- Key patterns with code examples
- Common gotchas
- Quick start command

### 3. Architecture Decision Records
Generate docs/decisions/ with:
- ADR-INDEX.md (table of all decisions)
- ADR-000-template.md (blank template for future decisions)
- One ADR per tool explaining: why this tool, what are the trade-offs, what alternatives were considered

### 4. Slash commands (Claude Code only)
Generate .claude/commands/:
- plan.md — structured planning before coding
- adr.md — create new ADRs with $ARGUMENTS
- architecture.md — generate/update ARCHITECTURE.md
- code-review.md — review staged changes
- build-fix.md — diagnose and fix build errors

### 5. .env.example
List all environment variables needed for my stack with comments.

## Additional context about my project
[Optional: describe your folder structure, any existing conventions, things the AI should know]

Please generate all files. Start with the main config file, then skill files, then ADRs.
```

---

### Option 3 — Manual setup (step by step)

If you prefer to set up each piece yourself:

#### Step 1 — Create the main config file

**Claude Code** — create `CLAUDE.md` in your project root:

```markdown
# my-project

## Stack
- Next.js — React framework with App Router
- PostgreSQL — relational database via Prisma
- Vercel — deployment

## Rules
- No `any` types
- Immutability: never mutate state directly
- All async code has try/catch
- No hardcoded secrets — env vars only
- Conventional commits: feat: / fix: / refactor: / test:

## Stack-Specific Rules

### Next.js
- Server Components by default — add `use client` only when needed
- Never import Server Components into Client Components
- Use next/image for all images

### PostgreSQL
- Always parameterized queries — never string concatenation
- Index every foreign key and queried column
- Use transactions for multi-table writes
```

**Cursor** — create `.cursorrules`, **Windsurf** — create `.windsurfrules`, **Copilot** — create `.github/copilot-instructions.md`. Same content structure, just a different filename.

#### Step 2 — Add skill files (Claude Code only)

```bash
mkdir -p .claude/skills
```

Create `.claude/skills/[tool].md` for each tool. At minimum:

```markdown
# Next.js

## Best Practices — Enforce These
- Server Components by default
- Never use `any` types
- ...

## Key Patterns
[patterns with code examples]

## Gotchas
[common mistakes]
```

#### Step 3 — Add ADRs

```bash
mkdir -p docs/decisions
```

Create `docs/decisions/ADR-001-[tool].md` for each major technology choice:

```markdown
# ADR-001: Use Next.js as the React framework

## Status
Accepted

## Date
2026-03-16

## Context
We need a React framework for our web app...

## Decision
Use Next.js with App Router...

## Consequences

### Positive
- Zero-config SSR and SSG
- ...

### Negative
- Server/Client Component boundary adds complexity
- ...

## Alternatives Considered
- Remix: better web standards, less ecosystem
- Vite + React Router: simpler but no SSR
```

#### Step 4 — Add slash commands (Claude Code only)

```bash
mkdir -p .claude/commands
```

**`.claude/commands/adr.md`** — run with `/adr "reason for decision"`
```
Create a new Architecture Decision Record for the decision described in $ARGUMENTS.
1. Read docs/decisions/ADR-INDEX.md for the next number
2. Create docs/decisions/ADR-XXX-short-slug.md with: Status, Date, Context, Decision, Consequences, Alternatives
3. Update ADR-INDEX.md
```

**`.claude/commands/architecture.md`** — run with `/architecture`
```
Read the project structure and generate ARCHITECTURE.md covering:
system overview, layers, data flow, key design decisions (link to ADRs), external dependencies.
If ARCHITECTURE.md exists, update it in place.
```

**`.claude/commands/code-review.md`** — run with `/code-review`
```
Review staged changes for: correctness, security (injection, auth bypass, data exposure),
performance (N+1, blocking ops), types, test coverage, style.
Output as [CRITICAL] / [WARNING] / [SUGGESTION].
```

---

## What gets generated

| File | Purpose |
|------|---------|
| `CLAUDE.md` / `.cursorrules` / etc. | Main AI config — rules + stack context |
| `.claude/skills/[tool].md` | Deep reference per tool (Claude Code) |
| `.claude/commands/adr.md` | `/adr` slash command |
| `.claude/commands/architecture.md` | `/architecture` slash command |
| `.claude/commands/plan.md` | `/plan` slash command |
| `.claude/commands/code-review.md` | `/code-review` slash command |
| `docs/decisions/ADR-INDEX.md` | Index of all architectural decisions |
| `docs/decisions/ADR-000-template.md` | Blank template for future ADRs |
| `docs/decisions/ADR-00N-[tool].md` | Pre-written ADR for each tool choice |
| `.env.example` | Required environment variables |

---

## Why ADRs?

Architectural decisions are made once and forgotten. Six months later nobody knows *why* you chose MongoDB over PostgreSQL, or *why* the API uses REST instead of tRPC. New team members make contradictory decisions because the context is lost.

ADRs fix this. They're short markdown files that record:
- **What** was decided
- **Why** it was decided
- **What trade-offs** were accepted

context-kit generates a starter ADR for every tool you select — written at the moment you make the decision, not reconstructed months later.

---

## Why an `/architecture` command?

Architecture documents go stale. A generated `ARCHITECTURE.md` that you never run again becomes misleading noise. The `/architecture` command is designed to be re-run:

```bash
# After a major refactor:
/architecture

# Claude reads your actual codebase, updates ARCHITECTURE.md to reflect reality
```

It reads your folder structure, dependencies, and existing ADRs — so the output always reflects the current state of the project, not the state it was in when you first set it up.

---

## Development

```bash
git clone https://github.com/your-org/context-kit
cd context-kit
npm install
npm run dev     # http://localhost:5173
npm test        # run all tests
npm run build   # production build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add tools, assistants, and cross-tool combos.

---

## License

[AGPL-3.0-only](LICENSE)
