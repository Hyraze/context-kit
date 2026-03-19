export interface Tool {
  id: string
  name: string
  category: string
  emoji: string
  description: string
  tags: string[]
  versions?: string[]    // Selectable major versions shown in UI (e.g. ['18', '19'])
  envVars?: string[]     // .env.example entries for this tool
  bestPractices: string[]   // Injected into every generated config as enforceable rules
  adr: {                    // Pre-written Architecture Decision Record for this tool choice
    title: string
    context: string
    decision: string
    positives: string[]
    negatives: string[]
    alternatives: string[]
  }
  knowledge: {
    overview: string
    patterns: string
    gotchas: string
    quickstart: string
  }
}

export const CATEGORIES = [
  'Frontend',
  'Backend',
  'Database',
  'AI / LLM',
  'Cloud & Deploy',
  'Testing',
  'DevOps',
]

export const TOOLS: Tool[] = [
  // ─── Frontend ────────────────────────────────────────────────────────────
  {
    id: 'react',
    name: 'React',
    category: 'Frontend',
    emoji: '⚛️',
    description: 'UI component library',
    tags: ['frontend', 'ui', 'components'],
    versions: ['18', '19'],
    adr: {
      title: 'Use React for the UI layer',
      context: 'We need a component model for building interactive UIs. The team has varying frontend experience and we need a large ecosystem of libraries.',
      decision: 'Use React with functional components and hooks. No class components.',
      positives: [
        'Largest ecosystem and community — almost every UI problem has a solved library',
        'Functional components + hooks are composable and easy to test',
        'Unidirectional data flow makes state changes predictable',
        'Strong TypeScript support with React.FC and typed hooks',
      ],
      negatives: [
        'More boilerplate than Vue for simple reactivity (useEffect vs. watch)',
        'Context API becomes unwieldy at scale — needs Zustand or similar for complex state',
      ],
      alternatives: ['Vue 3 (simpler reactivity model, smaller bundle)', 'Svelte (no virtual DOM, less boilerplate)', 'Solid.js (fine-grained reactivity, no virtual DOM)'],
    },
    bestPractices: [
      'Never mutate state directly — always use setState, useReducer, or return new objects/arrays',
      'Every useEffect, useCallback, and useMemo must list all referenced variables in the dependency array',
      'Never put objects or arrays inline in dependency arrays — memoize them first',
      'Derive state from existing state rather than storing it separately (no redundant state)',
      'Extract repeated stateful logic into custom hooks, not utility functions',
      'Use React.memo only after measuring — premature memoization adds complexity without benefit',
      'Always provide a stable, unique key prop for list items — never use array index for reorderable lists',
      'Prefer controlled components over uncontrolled for form inputs',
      'Co-locate state as close to where it is used as possible before reaching for context or global state',
    ],
    knowledge: {
      overview: `React 18+ with hooks. Use functional components exclusively. Prefer composition over inheritance. Co-locate state as close to where it's used as possible.`,
      patterns: `
## Key Patterns

### State Management
- Local state: useState / useReducer
- Derived state: useMemo (don't store what you can compute)
- Side effects: useEffect with proper cleanup
- Shared state: Context + useReducer or Zustand for complex cases

### Performance
- useCallback for stable function references passed to children
- useMemo for expensive computations (measure first)
- React.memo for pure child components that re-render often
- React.lazy + Suspense for code-splitting routes

### Component Design
\`\`\`tsx
// Prefer controlled components
function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />
}

// Compound components for complex UI
function Modal({ children }: { children: React.ReactNode }) { ... }
Modal.Header = function ModalHeader(...) { ... }
Modal.Body = function ModalBody(...) { ... }
\`\`\`

### Custom Hooks
Extract logic into hooks when the same stateful logic is used in 2+ places.
\`\`\`tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
\`\`\``,
      gotchas: `
## Common Gotchas

- **Stale closures**: useEffect dependencies must include all values used inside. Use the exhaustive-deps ESLint rule.
- **Infinite loops**: Never update state unconditionally inside useEffect without deps.
- **Object/array deps**: Inline objects in deps cause infinite re-renders — memoize or move outside component.
- **Batching**: React 18 batches all state updates. Multiple setState calls in the same handler = one re-render.
- **Key prop**: Use stable, unique keys for lists. Never use array index for reorderable lists.
- **useLayoutEffect**: Only use when you need to read DOM layout synchronously (avoid by default).`,
      quickstart: `
\`\`\`bash
npm create vite@latest my-app -- --template react-ts
cd my-app && npm install && npm run dev
\`\`\``,
    },
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    category: 'Frontend',
    emoji: '▲',
    description: 'React framework with SSR/SSG and App Router',
    tags: ['frontend', 'ssr', 'fullstack'],
    versions: ['14', '15'],
    adr: {
      title: 'Use Next.js as the React framework',
      context: 'We need SSR/SSG, routing, API routes, and a production-ready build pipeline without configuring them from scratch.',
      decision: 'Use Next.js with App Router. Server Components by default.',
      positives: [
        'Zero-config SSR, SSG, and ISR — critical for SEO and performance',
        'App Router collocates data fetching with components — no prop drilling for server data',
        'Built-in image optimization, font loading, and script management',
        'Vercel deployment is one command with no configuration',
      ],
      negatives: [
        'App Router adds complexity — Server vs Client Component boundary is a new mental model',
        'Vendor proximity to Vercel — some features work best on Vercel infrastructure',
      ],
      alternatives: ['Remix (better web standards alignment, nested loaders)', 'Astro (zero JS by default, best for content sites)', 'Vite + React Router (simpler, more control)'],
    },
    bestPractices: [
      "Default to Server Components — only add 'use client' when the component needs interactivity, browser APIs, or React hooks",
      "Never import a Server Component into a Client Component — pass Server Component output as children props instead",
      'Never expose secrets via NEXT_PUBLIC_ env vars — only use that prefix for genuinely public values',
      'Use next/image for all images — never use raw <img> tags (causes layout shift and missing optimization)',
      'Use next/link for all internal navigation — never use <a href> for same-app routes',
      'Fetch data in Server Components using async/await directly — avoid useEffect for data fetching',
      'Use route handlers (app/api/) instead of pages/api/ in the App Router',
      'Always await cookies() and headers() — they are async in Next.js 15+',
    ],
    knowledge: {
      overview: `Next.js 14+ App Router. Server Components by default — only use "use client" when you need interactivity, browser APIs, or hooks. Colocation: pages, layouts, loading, error files live in app/ directory.`,
      patterns: `
## Key Patterns

### Server vs Client Components
\`\`\`tsx
// Server Component (default) — runs on server, no JS sent to client
export default async function Page() {
  const data = await db.query(...) // Direct DB access OK here
  return <div>{data.title}</div>
}

// Client Component — add directive at top
"use client"
export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
\`\`\`

### Data Fetching
\`\`\`tsx
// In Server Components — fetch with caching
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 3600 } // ISR: revalidate every hour
})

// Route Handlers (API routes)
// app/api/users/route.ts
export async function GET() {
  return Response.json({ users: [] })
}
export async function POST(req: Request) {
  const body = await req.json()
  return Response.json({ created: true }, { status: 201 })
}
\`\`\`

### Layouts & Loading States
- \`layout.tsx\` — persistent UI wrapper (doesn't re-render on navigation)
- \`loading.tsx\` — automatic Suspense boundary
- \`error.tsx\` — error boundary (must be Client Component)
- \`not-found.tsx\` — 404 handler`,
      gotchas: `
## Common Gotchas

- **"use client" propagation**: Marking a component as client makes ALL its imports client too.
- **Server Component can't use hooks**: Move interactive parts into a separate Client Component.
- **cookies()/headers() are async in Next 15**: await them.
- **Dynamic params**: \`params\` and \`searchParams\` are now Promises in Next.js 15 — await them.
- **Env vars**: Only \`NEXT_PUBLIC_\` prefixed vars are exposed to the browser.
- **Image component**: Always provide width/height or use fill prop to avoid layout shift.`,
      quickstart: `
\`\`\`bash
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app && npm run dev
\`\`\``,
    },
  },
  {
    id: 'vue',
    name: 'Vue 3',
    category: 'Frontend',
    emoji: '💚',
    description: 'Progressive JavaScript framework with Composition API',
    tags: ['frontend', 'ui', 'components'],
    adr: {
      title: 'Use Vue 3 for the UI layer',
      context: 'We need a component framework. The team prefers a more opinionated, batteries-included approach over React\'s ecosystem-assembly model.',
      decision: 'Use Vue 3 with Composition API and <script setup>.',
      positives: [
        'Built-in reactivity system is more intuitive than useEffect for most patterns',
        'Single File Components keep template, logic, and styles co-located',
        'Official Pinia, Vue Router, and Vite integration — fewer ecosystem decisions',
        'Smaller bundle size than React for equivalent UIs',
      ],
      negatives: [
        'Smaller ecosystem than React — fewer third-party component libraries',
        'Options API vs Composition API split can cause inconsistency in mixed codebases',
      ],
      alternatives: ['React (larger ecosystem, more hiring pool)', 'Svelte (even less boilerplate, no virtual DOM)'],
    },
    bestPractices: [
      'Use <script setup> syntax for all new components — it is more concise and has better TypeScript inference',
      'Never destructure reactive objects without toRefs() — destructuring breaks reactivity',
      'Use computed() for derived state instead of duplicating values in separate refs',
      'Extract reusable reactive logic into composables (use* prefix), not mixins',
      'Always use :key on v-for — use a stable unique ID, never the array index',
      'Avoid v-if and v-for on the same element — use a wrapper element or computed list instead',
      'Use defineEmits and defineProps at top level of <script setup> — never inside functions',
      'Use Pinia for shared state — avoid Vuex and raw provide/inject for complex state',
    ],
    knowledge: {
      overview: `Vue 3 with Composition API and <script setup>. Use Pinia for state management. Vite for tooling.`,
      patterns: `
## Key Patterns

### Composition API
\`\`\`vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

onMounted(() => { /* side effects */ })
</script>

<template>
  <button @click="count++">{{ doubled }}</button>
</template>
\`\`\`

### Composables (reusable logic)
\`\`\`ts
// composables/useFetch.ts
export function useFetch<T>(url: string) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(true)

  fetch(url).then(r => r.json()).then(d => { data.value = d })
    .catch(e => { error.value = e })
    .finally(() => { loading.value = false })

  return { data, error, loading }
}
\`\`\`

### Pinia Store
\`\`\`ts
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => !!user.value)
  async function login(credentials: Credentials) { ... }
  return { user, isLoggedIn, login }
})
\`\`\``,
      gotchas: `
- **Reactivity**: Destructuring reactive objects loses reactivity — use toRefs() or storeToRefs().
- **ref vs reactive**: ref for primitives, reactive for objects. ref.value is needed in JS, not in templates.
- **v-for key**: Always use :key with v-for.
- **defineEmits/defineProps**: Must be called at top level of <script setup>, not inside functions.`,
      quickstart: `
\`\`\`bash
npm create vue@latest my-app
cd my-app && npm install && npm run dev
\`\`\``,
    },
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    category: 'Frontend',
    emoji: '🎨',
    description: 'Utility-first CSS framework',
    tags: ['frontend', 'css', 'styling'],
    adr: {
      title: 'Use Tailwind CSS for styling',
      context: 'We need a consistent design system without the overhead of maintaining a custom CSS framework or paying for a UI kit.',
      decision: 'Use Tailwind CSS utility classes. No custom CSS except for third-party overrides.',
      positives: [
        'Design constraints are enforced by default — spacing, color, and typography scales are consistent',
        'No context switching between CSS files and components',
        'Unused styles are purged at build time — production CSS is typically under 10kb',
        'Dark mode, responsive variants, and state variants are trivial to add',
      ],
      negatives: [
        'HTML can become verbose with many utility classes',
        'Requires tailwind-merge discipline when combining conditional classes',
      ],
      alternatives: ['CSS Modules (scoped styles, no class naming conflicts)', 'styled-components (CSS-in-JS, dynamic styles)', 'shadcn/ui (pre-built accessible components on top of Tailwind)'],
    },
    bestPractices: [
      'Never construct class names dynamically (e.g. `text-${color}-500`) — Tailwind purges dynamic classes at build time; use full class names or safeList',
      'Use tailwind-merge (twMerge) when conditionally combining classes — prevents conflicting utility collisions',
      'Avoid @apply except for third-party component overrides — it defeats the purpose of utility-first',
      'Use the cn() helper (clsx + twMerge) for conditional class logic, not string concatenation',
      'Never write custom CSS for spacing, colors, or typography that Tailwind already covers',
      "Set darkMode: 'class' in tailwind.config.js and use dark: variants — don't use media queries for theme switching",
      'Extract repeated class combinations into components, not @apply blocks',
    ],
    knowledge: {
      overview: `Tailwind CSS v3+. Write styles directly in markup using utility classes. No custom CSS unless absolutely necessary.`,
      patterns: `
## Key Patterns

### Layout
\`\`\`html
<!-- Centering -->
<div class="flex items-center justify-center min-h-screen">

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- Sticky header -->
<header class="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
\`\`\`

### Dark Mode
\`\`\`html
<div class="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
\`\`\`
Enable in tailwind.config.js: \`darkMode: 'class'\`

### Component Extraction (with cn utility)
\`\`\`ts
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
export const cn = (...inputs) => twMerge(clsx(inputs))

// Usage
<button className={cn('px-4 py-2 rounded', isActive && 'bg-blue-500')}>
\`\`\`

### Typography
Use \`@tailwindcss/typography\` plugin for prose content:
\`<article class="prose dark:prose-invert max-w-none">\``,
      gotchas: `
- **Dynamic class names**: Never construct class strings dynamically (e.g. \`text-\${color}-500\`). Tailwind purges unused classes at build time. Use full class names in source or safeList them.
- **Specificity**: Tailwind utilities use \`!important\` variant (\`!text-red-500\`) only as last resort.
- **Merging**: Use tailwind-merge when conditionally applying conflicting classes.
- **@apply**: Avoid overusing @apply — it defeats the purpose of utility-first.`,
      quickstart: `
\`\`\`bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
# Add to CSS: @tailwind base; @tailwind components; @tailwind utilities;
\`\`\``,
    },
  },

  // ─── Backend ─────────────────────────────────────────────────────────────
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'Backend',
    emoji: '🟢',
    description: 'JavaScript runtime for server-side code',
    tags: ['backend', 'runtime', 'javascript'],
    versions: ['18', '20', '22'],
    adr: {
      title: 'Use Node.js as the server runtime',
      context: 'We need a server runtime. The team is primarily JavaScript/TypeScript, so sharing code and types between frontend and backend is a priority.',
      decision: 'Use Node.js 20+ LTS with ESM modules.',
      positives: [
        'Shared TypeScript types and utilities between frontend and backend',
        'Single language across the stack reduces context switching',
        'Vast npm ecosystem for any server-side need',
        'Non-blocking I/O handles concurrent connections efficiently',
      ],
      negatives: [
        'Single-threaded — CPU-intensive work must be offloaded to worker threads or external services',
        'Callback/async patterns require discipline to avoid event loop blocking',
      ],
      alternatives: ['Bun (faster runtime, built-in test runner)', 'Deno (secure by default, native TypeScript)', 'Python/FastAPI (better for ML-heavy workloads)'],
    },
    bestPractices: [
      'Never use synchronous I/O (fs.readFileSync, etc.) in request handlers — it blocks the event loop for all concurrent requests',
      'Always validate environment variables at startup using Zod or similar — fail fast rather than fail late',
      'Handle SIGTERM and SIGINT for graceful shutdown — close the server and disconnect DB before exiting',
      'Never swallow errors silently — always log them and either recover or propagate',
      'Use ESM modules ("type": "module") in new projects — avoid mixing require() and import',
      'Set resource limits on incoming requests (body size, rate limits) before parsing',
      'Use structured logging (JSON) in production — never console.log in production code',
    ],
    knowledge: {
      overview: `Node.js 20+ LTS. Use ESM modules. async/await everywhere. Never block the event loop with synchronous I/O.`,
      patterns: `
## Key Patterns

### Error Handling
\`\`\`ts
// Wrap async route handlers
const asyncHandler = (fn: RequestHandler) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

// Centralized error middleware
app.use((err, req, res, next) => {
  const status = err.status ?? 500
  res.status(status).json({ error: err.message ?? 'Internal Server Error' })
})
\`\`\`

### Environment Config
\`\`\`ts
// config.ts — validate at startup
import { z } from 'zod'
const env = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
}).parse(process.env)
export default env
\`\`\`

### Graceful Shutdown
\`\`\`ts
process.on('SIGTERM', async () => {
  await server.close()
  await db.disconnect()
  process.exit(0)
})
\`\`\``,
      gotchas: `
- **Event loop blocking**: Never use fs.readFileSync, JSON.parse on huge payloads, or heavy computation in request handlers.
- **Unhandled rejections**: Always add .catch() or use try/catch. Node 20+ crashes on unhandled rejections by default.
- **Memory leaks**: setInterval/event listeners must be cleared. Use WeakMap/WeakRef for caches.
- **require vs import**: Use ESM (\`"type": "module"\` in package.json). Mixing is a pain.`,
      quickstart: `
\`\`\`bash
node --version  # 20+
npm init -y
# Add "type": "module" to package.json
\`\`\``,
    },
  },
  {
    id: 'express',
    name: 'Express',
    category: 'Backend',
    emoji: '🚂',
    description: 'Minimal Node.js web framework',
    tags: ['backend', 'api', 'http'],
    adr: {
      title: 'Use Express as the HTTP framework',
      context: 'We need an HTTP framework for our Node.js backend. We want minimal abstraction with full control over middleware and routing.',
      decision: 'Use Express 4 with a modular router structure organized by feature.',
      positives: [
        'Minimal and unopinionated — no framework magic to fight against',
        'Largest middleware ecosystem (passport, helmet, multer, etc.)',
        'Every developer on the team is already familiar with it',
        'Easy to migrate away from if needed — thin abstraction',
      ],
      negatives: [
        'No built-in TypeScript support — requires careful typing of req/res',
        'No built-in validation, DI, or structure — must be added manually',
      ],
      alternatives: ['Fastify (2x faster, built-in schema validation)', 'Hono (edge-compatible, excellent TypeScript)', 'NestJS (opinionated, DI framework, great for large teams)'],
    },
    bestPractices: [
      'Always wrap async route handlers — unhandled promise rejections in routes crash the process',
      'Validate and sanitize all request bodies with Zod before touching business logic',
      'Apply helmet(), cors(), and express-rate-limit before all routes — security middleware must be first',
      'Set express.json({ limit: "10kb" }) — always cap payload size',
      'Never use * as CORS origin in production — specify allowed origins explicitly',
      'Organize routes by feature module, not by HTTP method',
      'Pass errors to next(err) — never send error responses directly from route handlers',
      'Never expose internal error messages or stack traces to API clients in production',
    ],
    knowledge: {
      overview: `Express 4/5. Organize routes by feature, not by HTTP method. Use middleware for cross-cutting concerns (auth, logging, validation).`,
      patterns: `
## Key Patterns

### Route Organization
\`\`\`ts
// routes/users.ts
const router = Router()
router.get('/', asyncHandler(getUsers))
router.get('/:id', asyncHandler(getUserById))
router.post('/', validateBody(CreateUserSchema), asyncHandler(createUser))
export default router

// app.ts
app.use('/api/users', usersRouter)
\`\`\`

### Validation Middleware
\`\`\`ts
import { z } from 'zod'
const validateBody = (schema: z.ZodSchema) => (req, res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) return res.status(400).json({ errors: result.error.flatten() })
  req.body = result.data
  next()
}
\`\`\`

### Security Middleware Stack
\`\`\`ts
app.use(helmet())                    // Security headers
app.use(cors({ origin: allowedOrigins }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
app.use(express.json({ limit: '10kb' }))  // Limit payload size
app.use(mongoSanitize())             // Prevent NoSQL injection
\`\`\``,
      gotchas: `
- **Order matters**: Middleware runs in declaration order. Auth middleware must come before protected routes.
- **next(err)**: Passing anything to next() triggers error middleware. next() without args = continue normally.
- **JSON limit**: Default body parser has no size limit — always set one.
- **CORS**: Set specific origins in production, never \`*\` with credentials.
- **Router vs app**: Router is a mini-app. Use app.use() to mount routers at a prefix.`,
      quickstart: `
\`\`\`bash
npm install express helmet cors express-rate-limit zod
npm install -D @types/express typescript
\`\`\``,
    },
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    category: 'Backend',
    emoji: '⚡',
    description: 'Modern Python web framework with automatic OpenAPI docs',
    tags: ['backend', 'python', 'api'],
    adr: {
      title: 'Use FastAPI as the Python web framework',
      context: 'We need a Python API framework. Performance, automatic documentation, and type safety are priorities.',
      decision: 'Use FastAPI with Pydantic v2 for all data validation and serialization.',
      positives: [
        'Automatic OpenAPI docs at /docs and /redoc — zero extra work',
        'Pydantic validation means no manual input checking boilerplate',
        'Async-first — handles concurrent requests efficiently',
        'Python type hints drive both editor support and runtime validation',
      ],
      negatives: [
        'Smaller ecosystem than Django/Flask for auth, admin, and ORM integration',
        'Async/sync mixing requires care — calling blocking code in async handlers stalls the event loop',
      ],
      alternatives: ['Django REST Framework (batteries-included, large ecosystem)', 'Flask (simpler, more flexible but more manual)', 'Litestar (similar to FastAPI, more opinionated patterns)'],
    },
    bestPractices: [
      'Use Pydantic models for all request and response bodies — never use raw dicts for I/O',
      'Never call blocking I/O (requests, time.sleep) inside async route functions — use httpx or run_in_executor',
      'Add CORSMiddleware before defining any routes — middleware order matters in FastAPI',
      'Use dependency injection (Depends) for DB sessions, auth, and shared logic — never instantiate these inside route functions',
      'Always type return values with response_model to prevent leaking internal fields',
      'Handle startup/teardown with lifespan context manager, not deprecated @app.on_event',
      'Raise HTTPException with explicit status codes — never return error dicts with 200 status',
      'Use background tasks for fire-and-forget work, not asyncio.create_task in routes',
    ],
    knowledge: {
      overview: `FastAPI with Pydantic v2. Async by default. Automatic OpenAPI docs at /docs. Type everything — FastAPI uses types for validation, serialization, and docs.`,
      patterns: `
## Key Patterns

### Route + Validation
\`\`\`python
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    name: str

@app.post("/users", status_code=201)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = await db.get_user_by_email(user.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    return await db.create_user(user)
\`\`\`

### Dependency Injection
\`\`\`python
# Reusable auth dependency
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    user = await verify_token(token)
    if not user:
        raise HTTPException(status_code=401)
    return user

@app.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return user
\`\`\`

### Background Tasks
\`\`\`python
@app.post("/send-email")
async def send_email(background_tasks: BackgroundTasks, email: str):
    background_tasks.add_task(send_email_async, email)
    return {"message": "Email queued"}
\`\`\``,
      gotchas: `
- **Sync vs async**: Sync route functions run in a thread pool. Async functions run on the event loop. Don't mix blocking I/O in async functions.
- **Pydantic v2**: Breaking changes from v1. Use \`model_validate\` not \`.parse_obj()\`.
- **CORS**: Add CORSMiddleware before other middleware.
- **Startup events**: Use \`@app.on_event("startup")\` or lifespan context manager to initialize DB connections.`,
      quickstart: `
\`\`\`bash
pip install fastapi uvicorn[standard] pydantic
uvicorn main:app --reload
# Docs at http://localhost:8000/docs
\`\`\``,
    },
  },

  // ─── Database ─────────────────────────────────────────────────────────────
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'Database',
    emoji: '🍃',
    description: 'Document database with flexible schema',
    tags: ['database', 'nosql', 'documents'],
    envVars: ['MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mydb'],
    adr: {
      title: 'Use MongoDB as the primary database',
      context: 'We need a database. Our data model is document-oriented with flexible, evolving schemas. We prioritize developer velocity over strict relational integrity.',
      decision: 'Use MongoDB with Mongoose ODM. Embed related data when read together, reference when accessed independently.',
      positives: [
        'Flexible schema suits evolving product requirements — no migration for adding fields',
        'Document model maps directly to JSON API responses — no ORM impedance mismatch',
        'Horizontal scaling via sharding is built in',
        'Rich aggregation pipeline for complex queries without raw SQL',
      ],
      negatives: [
        'No joins — multi-document relationships require application-level logic or $lookup',
        'No ACID transactions across documents without explicit session management',
        'Schema flexibility is a liability without discipline — must enforce structure via Mongoose',
      ],
      alternatives: ['PostgreSQL (ACID, relations, better for financial data)', 'Supabase (PostgreSQL + auth + realtime)', 'DynamoDB (serverless, AWS-native, extreme scale)'],
    },
    bestPractices: [
      'Always use $set for partial updates — never overwrite a whole document unless intentional',
      'Create indexes for every field used in query filters, sorts, or lookups — missing indexes cause full collection scans',
      'Never store unbounded arrays in documents — use references when arrays can grow past ~100 items',
      'Mark sensitive fields with select: false in the schema so they are excluded from queries by default',
      'Use connection pooling — connect once at app startup and reuse the connection, never connect per-request',
      'Use MongoDB transactions ($session) for multi-document operations that must be atomic',
      'Sanitize all user input before using in queries — never interpolate user strings into query operators',
      'Always convert string IDs to ObjectId before querying — never compare strings to ObjectId fields',
    ],
    knowledge: {
      overview: `MongoDB with Mongoose ODM. Model relationships as embedded documents when data is accessed together, as references when accessed independently.`,
      patterns: `
## Key Patterns

### Schema Design Principles
- **Embed** when: data is always fetched together, 1-to-few relationship, child data doesn't grow unbounded
- **Reference** when: data is accessed independently, 1-to-many (many = thousands+), many-to-many

### Mongoose Schema
\`\`\`ts
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false }, // exclude from queries by default
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
})
UserSchema.index({ email: 1 })
UserSchema.index({ createdAt: -1 })
\`\`\`

### Aggregation Pipeline
\`\`\`ts
const result = await Order.aggregate([
  { $match: { status: 'completed', createdAt: { $gte: startDate } } },
  { $group: { _id: '$userId', total: { $sum: '$amount' }, count: { $sum: 1 } } },
  { $sort: { total: -1 } },
  { $limit: 10 },
])
\`\`\`

### Connection Pooling
\`\`\`ts
// Connect once, reuse connection
let cached = global.mongoose
if (!cached) cached = global.mongoose = { conn: null, promise: null }

export async function connectDB() {
  if (cached.conn) return cached.conn
  cached.promise = mongoose.connect(process.env.DATABASE_URL!, { maxPoolSize: 10 })
  cached.conn = await cached.promise
  return cached.conn
}
\`\`\``,
      gotchas: `
- **ObjectId vs string**: _id is an ObjectId, not a string. Use \`new mongoose.Types.ObjectId(id)\` when querying by string ID.
- **select: false**: Fields marked select:false must be explicitly requested: \`.select('+passwordHash')\`.
- **lean()**: Returns plain JS objects (faster, smaller). Can't use Mongoose document methods after lean().
- **$set vs direct assignment**: Always use $set for partial updates to avoid overwriting the whole document.
- **Indexes**: Create indexes for any field used in queries. Missing indexes = full collection scans.
- **Transactions**: Use sessions for multi-document atomic operations.`,
      quickstart: `
\`\`\`bash
npm install mongoose
# .env: MONGODB_URI=mongodb+srv://...
\`\`\``,
    },
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'Database',
    emoji: '🐘',
    description: 'Powerful open-source relational database',
    tags: ['database', 'sql', 'relational'],
    envVars: ['DATABASE_URL=postgresql://user:password@localhost:5432/mydb'],
    adr: {
      title: 'Use PostgreSQL as the primary database',
      context: 'We need a database with strong consistency guarantees, complex relational queries, and ACID transactions. Data integrity is non-negotiable.',
      decision: 'Use PostgreSQL with Prisma ORM. Enforce schema via migrations.',
      positives: [
        'Full ACID compliance — no partial writes, no phantom reads',
        'Powerful query capabilities: JOINs, window functions, CTEs, full-text search',
        'JSONB column type handles semi-structured data without sacrificing query performance',
        'Prisma generates TypeScript types from schema — end-to-end type safety',
      ],
      negatives: [
        'Horizontal scaling is harder than MongoDB — vertical scaling or read replicas required',
        'Schema migrations require more planning — cannot add fields without a migration',
      ],
      alternatives: ['MongoDB (flexible schema, easier horizontal scale)', 'SQLite (zero infrastructure, great for small apps)', 'PlanetScale (serverless MySQL, branching workflow)'],
    },
    bestPractices: [
      'Never concatenate user input into SQL strings — always use parameterized queries or an ORM',
      'Avoid N+1 queries — always fetch relations in a single query using JOIN or ORM include/eager loading',
      'Index every foreign key and every column used in WHERE, ORDER BY, or JOIN conditions',
      'Use database transactions for any operation that writes to multiple tables',
      'Never run schema migrations in application startup code — use a migration tool (Prisma migrate, Flyway)',
      'Use JSONB over JSON in PostgreSQL — JSONB is indexed and faster for queries',
      'Set explicit onDelete behavior on foreign key constraints — never rely on defaults',
      'Use connection pooling (PgBouncer or Prisma Data Proxy) in serverless environments',
    ],
    knowledge: {
      overview: `PostgreSQL with Prisma ORM or raw pg. ACID compliant. Use transactions for multi-step operations. Leverage PG-specific features: JSONB, full-text search, window functions.`,
      patterns: `
## Key Patterns

### Prisma Schema
\`\`\`prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  posts     Post[]
  profile   Profile?
  createdAt DateTime @default(now())

  @@index([email])
}

model Post {
  id        String   @id @default(cuid())
  title     String
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  @@index([authorId])
}
\`\`\`

### Prisma Queries
\`\`\`ts
// Paginated fetch with relations
const posts = await prisma.post.findMany({
  where: { author: { email: { contains: '@example.com' } } },
  include: { author: { select: { name: true, email: true } } },
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * pageSize,
  take: pageSize,
})

// Transaction
const [user, _] = await prisma.$transaction([
  prisma.user.create({ data: { email } }),
  prisma.auditLog.create({ data: { action: 'user_created' } }),
])
\`\`\`

### Migrations
\`\`\`bash
npx prisma migrate dev --name add_user_table
npx prisma migrate deploy  # production
\`\`\``,
      gotchas: `
- **N+1 queries**: Always use \`include\` or \`select\` to fetch relations in one query. Avoid loading a list then looping to fetch each item's relation.
- **Connection limits**: Prisma creates a connection pool. Set \`DATABASE_URL\` with \`?connection_limit=5\` for serverless.
- **Migration drift**: Never manually edit migration files after applying them.
- **JSONB vs JSON**: Use JSONB in PostgreSQL — it's indexed and faster for queries.
- **Cascades**: Define onDelete behavior explicitly or you'll get FK constraint errors.`,
      quickstart: `
\`\`\`bash
npm install prisma @prisma/client
npx prisma init
npx prisma migrate dev
\`\`\``,
    },
  },
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'Database',
    emoji: '⚡',
    description: 'Open-source Firebase alternative with Postgres',
    tags: ['database', 'backend-as-a-service', 'auth', 'realtime'],
    envVars: [
      'NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...',
      'SUPABASE_SERVICE_ROLE_KEY=eyJ...',
    ],
    adr: {
      title: 'Use Supabase as the backend platform',
      context: 'We need authentication, a database, file storage, and realtime subscriptions. Building each from scratch would take months.',
      decision: 'Use Supabase as our primary backend platform. PostgreSQL as the database, Supabase Auth for authentication, Storage for files.',
      positives: [
        'Auth, database, storage, and realtime in one platform — replaces 4 separate services',
        'Row Level Security enforces data access at the database layer, not just the application layer',
        'Generous free tier — no cost until significant scale',
        'Self-hostable if vendor lock-in becomes a concern',
      ],
      negatives: [
        'RLS policies add complexity — bugs in policies can silently expose data',
        'Less control than managing your own PostgreSQL + auth service',
      ],
      alternatives: ['Firebase (Google ecosystem, NoSQL)', 'PocketBase (single binary, self-hosted)', 'Build it yourself (PostgreSQL + Clerk + S3 + custom realtime)'],
    },
    bestPractices: [
      'Enable Row Level Security (RLS) on every table — tables without RLS are fully public to anyone with the anon key',
      'Never use the service role key on the client — it bypasses RLS and exposes your entire database',
      'Generate TypeScript types with `supabase gen types typescript` and use them for all queries',
      'Always check the error object returned from Supabase calls — never assume success',
      'Use select() to specify only needed columns — never fetch entire rows when you only need a few fields',
      'Write RLS policies that reference auth.uid() — never write policies that allow all authenticated users to see each other\'s data',
      'Use Supabase Storage bucket policies, not just app-level checks — assume the URL can be guessed',
    ],
    knowledge: {
      overview: `Supabase = PostgreSQL + Auth + Storage + Realtime + Edge Functions. Use the JS client for frontend, service role key only in trusted server environments.`,
      patterns: `
## Key Patterns

### Client Setup
\`\`\`ts
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Server-side (use service role)
export const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
\`\`\`

### Data Fetching
\`\`\`ts
// Type-safe queries
const { data, error } = await supabase
  .from('posts')
  .select('id, title, author:users(name, email)')
  .eq('published', true)
  .order('created_at', { ascending: false })
  .limit(10)

if (error) throw error
\`\`\`

### Auth
\`\`\`ts
// Sign up
const { data, error } = await supabase.auth.signUp({ email, password })
// Sign in
const { data, error } = await supabase.auth.signInWithPassword({ email, password })
// Get session
const { data: { session } } = await supabase.auth.getSession()
\`\`\`

### Row Level Security (RLS)
Always enable RLS. Example policy:
\`\`\`sql
-- Users can only read their own data
CREATE POLICY "own_data" ON posts
  FOR SELECT USING (auth.uid() = user_id);
\`\`\``,
      gotchas: `
- **RLS must be enabled**: Tables without RLS are fully public. Enable RLS and write policies for all tables.
- **Service role bypasses RLS**: Never expose service role key to the client.
- **Type generation**: Run \`supabase gen types typescript\` to get full type safety.
- **Realtime**: Subscribe to changes per-table. Don't subscribe to tables users shouldn't see.
- **Storage**: Set bucket policies. Private buckets require signed URLs.`,
      quickstart: `
\`\`\`bash
npm install @supabase/supabase-js
npx supabase init
npx supabase gen types typescript --local > src/database.types.ts
\`\`\``,
    },
  },

  // ─── AI / LLM ─────────────────────────────────────────────────────────────
  {
    id: 'openai',
    name: 'OpenAI API',
    category: 'AI / LLM',
    emoji: '🤖',
    description: 'GPT-4o, o1, embeddings, DALL-E, Whisper',
    tags: ['ai', 'llm', 'embeddings'],
    envVars: ['OPENAI_API_KEY=sk-...'],
    adr: {
      title: 'Use OpenAI API for LLM capabilities',
      context: 'We need LLM capabilities for [feature]. We need a reliable API with broad model selection, good documentation, and proven production track record.',
      decision: 'Use OpenAI API with gpt-4o-mini as the default model, escalating to gpt-4o for complex reasoning tasks.',
      positives: [
        'Most mature LLM API — extensive documentation and community',
        'Structured output support makes JSON extraction reliable',
        'Wide model selection allows cost/quality tradeoffs per use case',
        'Tool use and function calling are well-designed and reliable',
      ],
      negatives: [
        'Vendor lock-in — migrating to another provider requires prompt re-testing',
        'Cost can escalate unexpectedly at scale without token budgeting',
      ],
      alternatives: ['Anthropic Claude (better for long documents and analysis)', 'Google Gemini (cheaper, 1M context window)', 'Run local models via Ollama (zero cost, data stays on-prem)'],
    },
    bestPractices: [
      'Never hardcode API keys — always load from environment variables and validate at startup',
      'Always handle rate limit errors (429) with exponential backoff — never retry immediately',
      'Use structured outputs (JSON mode or zodResponseFormat) instead of parsing free-text responses',
      'Set temperature: 0 for deterministic tasks (classification, extraction) and higher values only for creative tasks',
      'Always set a max_tokens limit — uncapped responses can exhaust quota and run indefinitely',
      'Use gpt-4o-mini for simple tasks — only escalate to gpt-4o when reasoning quality matters',
      'Count tokens before sending with tiktoken — never silently truncate context',
      'Validate and sanitize all LLM output before using it in business logic or rendering it as HTML',
    ],
    knowledge: {
      overview: `OpenAI API for chat completions, embeddings, image generation, and speech. Use structured outputs for reliable JSON. Implement streaming for better UX.`,
      patterns: `
## Key Patterns

### Chat Completion with Streaming
\`\`\`ts
import OpenAI from 'openai'
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const stream = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: userMessage },
  ],
  stream: true,
})

for await (const chunk of stream) {
  const text = chunk.choices[0]?.delta?.content ?? ''
  process.stdout.write(text) // or send to client via SSE
}
\`\`\`

### Structured Output (Zod)
\`\`\`ts
import { zodResponseFormat } from 'openai/helpers/zod'

const CalendarEvent = z.object({
  name: z.string(),
  date: z.string(),
  participants: z.array(z.string()),
})

const response = await client.beta.chat.completions.parse({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Alice and Bob meeting on Dec 25' }],
  response_format: zodResponseFormat(CalendarEvent, 'event'),
})
const event = response.choices[0].message.parsed
\`\`\`

### Embeddings
\`\`\`ts
const embedding = await client.embeddings.create({
  model: 'text-embedding-3-small',
  input: text,
})
const vector = embedding.data[0].embedding // float[]
\`\`\``,
      gotchas: `
- **Rate limits**: Implement exponential backoff. Use \`openai\` SDK's built-in retry.
- **Token counting**: Use \`tiktoken\` to count tokens before sending — avoid surprise truncation.
- **Context window**: gpt-4o = 128k tokens. Keep system prompts concise.
- **Temperature**: 0 for deterministic/factual tasks, 0.7-1.0 for creative tasks.
- **Function calling**: Use tools/functions for structured data extraction, not just prompting.
- **Cost**: gpt-4o-mini for simple tasks, gpt-4o for complex reasoning. Huge cost difference.`,
      quickstart: `
\`\`\`bash
npm install openai
# .env: OPENAI_API_KEY=sk-...
\`\`\``,
    },
  },
  {
    id: 'anthropic',
    name: 'Anthropic API',
    category: 'AI / LLM',
    emoji: '🧠',
    description: 'Claude models — analysis, coding, long context',
    tags: ['ai', 'llm', 'claude'],
    envVars: ['ANTHROPIC_API_KEY=sk-ant-...'],
    adr: {
      title: 'Use Anthropic Claude API for LLM capabilities',
      context: 'We need LLM capabilities for [feature]. Our use cases involve long document analysis, complex reasoning, and code generation where output quality matters more than cost.',
      decision: 'Use Anthropic API with claude-sonnet-4-6 as default, claude-haiku-4-5 for high-volume simple tasks.',
      positives: [
        '200k token context window — can process entire codebases or long documents',
        'Consistently strong on coding, analysis, and instruction-following tasks',
        'Streaming is first-class — easy to implement responsive UIs',
        'Tool use implementation is clean and well-documented',
      ],
      negatives: [
        'More expensive than GPT-4o-mini for simple tasks',
        'No image generation — requires a separate provider for that use case',
      ],
      alternatives: ['OpenAI (broader model ecosystem, DALL-E integration)', 'Google Gemini (larger context at lower cost)', 'Mistral (cheaper, self-hostable models available)'],
    },
    bestPractices: [
      'Always specify max_tokens — it is required and has no default in the Anthropic API',
      'Put the system prompt in the top-level system parameter, not as a user message',
      'Use claude-haiku for high-volume simple tasks, claude-sonnet for balanced quality/cost, claude-opus for complex reasoning',
      'Check stop_reason === "tool_use" before assuming the response is complete — multi-turn tool use is common',
      'Never expose ANTHROPIC_API_KEY to the client — proxy all requests through your backend',
      'Implement retry logic with exponential backoff for overloaded_error and rate_limit_error',
      'Use streaming for responses longer than a few sentences — dramatically improves perceived latency',
      'Sanitize user input injected into prompts — treat prompt injection as a real attack surface',
    ],
    knowledge: {
      overview: `Anthropic Claude API. Best for: long document analysis, complex reasoning, coding, safety-sensitive applications. Claude has 200k token context window.`,
      patterns: `
## Key Patterns

### Basic Completion
\`\`\`ts
import Anthropic from '@anthropic-ai/sdk'
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const message = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 1024,
  system: 'You are a helpful assistant.',
  messages: [{ role: 'user', content: userMessage }],
})
const text = message.content[0].type === 'text' ? message.content[0].text : ''
\`\`\`

### Streaming
\`\`\`ts
const stream = await client.messages.stream({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: userMessage }],
})

for await (const chunk of stream) {
  if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
    process.stdout.write(chunk.delta.text)
  }
}
\`\`\`

### Tool Use
\`\`\`ts
const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  tools: [{
    name: 'get_weather',
    description: 'Get current weather for a city',
    input_schema: {
      type: 'object',
      properties: { city: { type: 'string' } },
      required: ['city'],
    },
  }],
  messages: [{ role: 'user', content: 'What is the weather in Paris?' }],
})
\`\`\``,
      gotchas: `
- **Model IDs**: Use exact IDs — \`claude-opus-4-6\`, \`claude-sonnet-4-6\`, \`claude-haiku-4-5-20251001\`.
- **max_tokens required**: Unlike OpenAI, max_tokens is required in the API call.
- **No system in messages array**: System prompt is a top-level parameter, not a message role.
- **stop_reason**: Check stop_reason === 'tool_use' to handle multi-turn tool calls properly.
- **Haiku for speed**: claude-haiku is ~10x cheaper and much faster for simple tasks.`,
      quickstart: `
\`\`\`bash
npm install @anthropic-ai/sdk
# .env: ANTHROPIC_API_KEY=sk-ant-...
\`\`\``,
    },
  },

  // ─── Cloud & Deploy ────────────────────────────────────────────────────────
  {
    id: 'cloudflare-workers',
    name: 'Cloudflare Workers',
    category: 'Cloud & Deploy',
    emoji: '☁️',
    description: 'Edge compute — runs JS/TS globally at the CDN layer',
    tags: ['cloud', 'edge', 'serverless', 'cloudflare'],
    envVars: ['CLOUDFLARE_API_TOKEN=', 'CLOUDFLARE_ACCOUNT_ID='],
    adr: {
      title: 'Use Cloudflare Workers for edge compute',
      context: 'We need compute that runs close to users globally. Traditional serverless has cold start latency and regional bottlenecks.',
      decision: 'Use Cloudflare Workers for API routes and middleware. D1 for database, KV for caching, R2 for storage.',
      positives: [
        'Runs in 300+ locations — sub-10ms response times globally',
        'V8 isolates have zero cold starts unlike Lambda or Cloud Functions',
        'KV, D1, R2, and Durable Objects are natively integrated — no external DB connection overhead',
        'wrangler CLI makes local dev and deployment fast',
      ],
      negatives: [
        'No Node.js APIs — must use Web Platform APIs only (fetch, Request, Response)',
        '10ms CPU limit on free tier — not suitable for heavy computation',
      ],
      alternatives: ['Vercel Edge Functions (Next.js integration, easier DX)', 'AWS Lambda@Edge (more powerful, more complex)', 'Deno Deploy (Node-compatible, simpler pricing)'],
    },
    bestPractices: [
      'Never use Node.js built-ins (fs, path, http, crypto) — Workers use Web Platform APIs only',
      'Store secrets with `wrangler secret put` — never put secrets in wrangler.toml or source code',
      'Use ctx.waitUntil() for logging and analytics after sending the response — never block the response for fire-and-forget work',
      'Never rely on in-memory state between requests — isolates can be recycled; use KV/D1/Durable Objects for persistence',
      'Respect the CPU time limit (10ms free, 30s paid) — offload heavy computation to a Queue or external service',
      'Use Durable Objects for any state that requires strong consistency or coordination between requests',
      'Define all bindings in the Env interface — never access env variables through process.env',
      'Return a Response object from every code path — Workers that do not return a Response produce an error',
    ],
    knowledge: {
      overview: `Cloudflare Workers run at the edge (300+ locations). V8 isolates — faster cold starts than Lambda. 128MB memory, 10ms CPU time (free) / 30s (paid). Use for: APIs, auth, A/B testing, middleware, static site backends.`,
      patterns: `
## Key Patterns

### Basic Worker
\`\`\`ts
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/hello') {
      return Response.json({ message: 'Hello from the edge!' })
    }

    return new Response('Not Found', { status: 404 })
  },
}

interface Env {
  MY_KV: KVNamespace
  MY_DB: D1Database
  MY_BUCKET: R2Bucket
  API_SECRET: string  // secret var
}
\`\`\`

### KV Storage (edge caching)
\`\`\`ts
// Write
await env.MY_KV.put('key', JSON.stringify(data), { expirationTtl: 3600 })
// Read
const raw = await env.MY_KV.get('key')
const data = raw ? JSON.parse(raw) : null
\`\`\`

### D1 Database (SQLite at edge)
\`\`\`ts
const { results } = await env.MY_DB.prepare(
  'SELECT * FROM users WHERE email = ?'
).bind(email).all()
\`\`\`

### Wrangler Config (wrangler.toml)
\`\`\`toml
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "MY_KV"
id = "abc123"

[[d1_databases]]
binding = "MY_DB"
database_name = "my-db"
database_id = "xyz789"
\`\`\``,
      gotchas: `
- **No Node.js APIs**: Workers use the Web Platform API (fetch, Request, Response, URL). No fs, no path, no http.
- **CPU time limit**: 10ms on free tier per request. Offload heavy work to Queues or use paid plan.
- **No persistent state in memory**: Each request may hit a different isolate. Use KV/D1/Durable Objects for state.
- **Durable Objects for consistency**: Use DOs for per-user or per-session state that needs strong consistency.
- **ctx.waitUntil()**: For fire-and-forget async work after sending the response (logging, analytics).
- **Wrangler secrets**: \`wrangler secret put SECRET_NAME\` — never put secrets in wrangler.toml.`,
      quickstart: `
\`\`\`bash
npm create cloudflare@latest my-worker
cd my-worker
wrangler dev       # local dev
wrangler deploy    # ship to edge
\`\`\``,
    },
  },
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'Cloud & Deploy',
    emoji: '▲',
    description: 'Deploy frontend and serverless functions globally',
    tags: ['cloud', 'deploy', 'serverless', 'frontend'],
    envVars: ['VERCEL_TOKEN='],
    adr: {
      title: 'Use Vercel for deployment',
      context: 'We need a deployment platform. We want zero-config deployments, preview environments per PR, and global CDN without DevOps overhead.',
      decision: 'Use Vercel for frontend and serverless function deployment. GitHub integration for automatic deploys.',
      positives: [
        'Preview deployments per PR — every branch gets its own URL',
        'Zero config for Next.js — optimal settings are applied automatically',
        'Edge Network with automatic CDN — no cache configuration needed',
        'Built-in analytics, Web Vitals monitoring, and log streaming',
      ],
      negatives: [
        'Serverless function cold starts on Hobby plan',
        'Can become expensive at high traffic — egress costs add up',
      ],
      alternatives: ['Railway (simpler pricing, supports persistent servers)', 'Fly.io (Docker-based, more control)', 'Cloudflare Pages + Workers (better performance, more complex)'],
    },
    bestPractices: [
      'Never commit .env files — use Vercel dashboard or `vercel env add` for all environment variables',
      'Use Edge Runtime for latency-sensitive routes — it has zero cold starts unlike Node.js runtime',
      'Always set Cache-Control headers explicitly — do not rely on Vercel defaults for dynamic routes',
      'Use next/image and next/font — they are automatically optimized by Vercel\'s build pipeline',
      'Set function timeout explicitly in vercel.json for long-running routes — default is 10s on Hobby',
      'Use ISR (revalidate) for pages that change infrequently instead of disabling caching entirely',
      'For monorepos, set Root Directory in Vercel project settings rather than using symlinks',
    ],
    knowledge: {
      overview: `Vercel for deploying Next.js, React, Vue, and any static site. Serverless functions via /api directory or Next.js route handlers. Zero-config deploys from Git.`,
      patterns: `
## Key Patterns

### Serverless Function (non-Next.js)
\`\`\`ts
// api/hello.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  res.json({ message: 'Hello', time: new Date().toISOString() })
}
\`\`\`

### Edge Functions
\`\`\`ts
// middleware.ts (Next.js) — runs at edge before every request
import { NextResponse } from 'next/server'
export function middleware(request) {
  const token = request.cookies.get('token')
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
export const config = { matcher: ['/dashboard/:path*'] }
\`\`\`

### vercel.json
\`\`\`json
{
  "headers": [{ "source": "/api/(.*)", "headers": [{ "key": "Cache-Control", "value": "no-store" }] }],
  "rewrites": [{ "source": "/legacy/:path*", "destination": "/new/:path*" }]
}
\`\`\``,
      gotchas: `
- **Serverless cold starts**: First request after inactivity is slower. Use Edge Runtime for zero cold starts.
- **Function timeout**: 10s on Hobby, 60s on Pro, 900s on Enterprise. Long-running tasks need a different approach.
- **Build output**: Vercel caches node_modules between builds. Add files to \`outputFileTracingIncludes\` if missing.
- **Environment vars**: Set in dashboard or via \`vercel env add\`. Local: use \`.env.local\` (never commit).
- **Monorepos**: Set Root Directory in project settings to point to the app subfolder.`,
      quickstart: `
\`\`\`bash
npm i -g vercel
vercel login
vercel  # deploys current directory
\`\`\``,
    },
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'Cloud & Deploy',
    emoji: '🐳',
    description: 'Container platform for consistent environments',
    tags: ['devops', 'containers', 'deploy'],
    adr: {
      title: 'Use Docker for containerization',
      context: 'We need consistent environments across dev, CI, and production. "Works on my machine" bugs are costing developer time.',
      decision: 'Use Docker with multi-stage builds for all services. Docker Compose for local development.',
      positives: [
        'Identical environment from dev laptop to production — eliminates environment drift',
        'Multi-stage builds produce small production images (often under 100MB)',
        'Docker Compose lets new devs run the full stack with one command',
        'Portable — can deploy to any cloud provider or on-prem',
      ],
      negatives: [
        'Adds complexity for simple projects — not always worth it for a single-service app',
        'Requires understanding of networking and volume mounts for local dev',
      ],
      alternatives: ['Nix (reproducible builds, more complex)', 'Dev Containers (VS Code integration, good for teams)', 'Just use the host (simpler, acceptable for small teams)'],
    },
    bestPractices: [
      'Always add .dockerignore — at minimum exclude node_modules, .git, .env, and local build artifacts',
      'Never run containers as root in production — always set USER to a non-root user',
      'Use multi-stage builds — the final image should contain only what is needed to run, not build tools or dev dependencies',
      'Copy package.json before source code so the npm install layer is cached independently from code changes',
      'Never put secrets in ENV instructions in the Dockerfile — use runtime environment variables or Docker secrets',
      'Pin base image versions (node:20.11-alpine not node:alpine) to prevent unexpected breakage from upstream updates',
      'Add a HEALTHCHECK instruction so orchestrators can detect unhealthy containers',
    ],
    knowledge: {
      overview: `Docker for containerizing apps. Use multi-stage builds for small production images. Docker Compose for local multi-service development.`,
      patterns: `
## Key Patterns

### Multi-stage Dockerfile (Node.js)
\`\`\`dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3000
USER node
CMD ["node", "dist/index.js"]
\`\`\`

### Docker Compose (dev)
\`\`\`yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/mydb
    depends_on: [db]
    volumes:
      - .:/app            # hot reload
      - /app/node_modules # preserve container's node_modules

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
\`\`\``,
      gotchas: `
- **.dockerignore**: Always add node_modules, .git, .env to .dockerignore.
- **USER node**: Never run containers as root in production.
- **Layer caching**: Copy package.json BEFORE source code so npm install is cached unless deps change.
- **Multi-stage**: Final image should only contain what's needed to run — not build tools.
- **Health checks**: Add HEALTHCHECK in production Dockerfiles.
- **Secrets**: Never put secrets in ENV instructions. Use runtime env vars or Docker secrets.`,
      quickstart: `
\`\`\`bash
docker build -t my-app .
docker run -p 3000:3000 my-app
docker compose up --build
\`\`\``,
    },
  },

  // ─── Testing ──────────────────────────────────────────────────────────────
  {
    id: 'vitest',
    name: 'Vitest',
    category: 'Testing',
    emoji: '🧪',
    description: 'Blazing fast unit testing for Vite projects',
    tags: ['testing', 'unit', 'vite'],
    adr: {
      title: 'Use Vitest for unit and integration testing',
      context: 'We need a test runner. The project uses Vite, and we want fast test execution with a Jest-compatible API so the team can reuse existing knowledge.',
      decision: 'Use Vitest for all unit and integration tests. Co-locate test files with source files.',
      positives: [
        'Native ESM and TypeScript — no transform configuration needed',
        'Jest-compatible API — zero learning curve for teams coming from Jest',
        '10-20x faster than Jest for large test suites due to Vite bundling',
        'Built-in coverage with @vitest/coverage-v8',
      ],
      negatives: [
        'Smaller ecosystem than Jest — some Jest plugins have no Vitest equivalent',
        'Tied to Vite — if the build tool changes, tests may need migration',
      ],
      alternatives: ['Jest (larger ecosystem, more stable)', 'Node:test (built-in, zero dependencies)', 'Bun test (fastest, but only for Bun projects)'],
    },
    bestPractices: [
      'Always return or await async assertions — unawaited assertions never fail the test even when they should',
      'Use vi.clearAllMocks() in beforeEach — shared mock state between tests causes flaky failures',
      'Never use vi.mock() with variables defined in the same scope — mock calls are hoisted and the variable will be undefined',
      'Test behavior, not implementation — assert on outputs and side effects, not on internal function calls',
      'Mock at the boundary (HTTP, DB, file system) not deep inside business logic — over-mocking makes tests useless',
      'Set coverage thresholds in vitest.config.ts and fail CI if they drop below 80%',
      'Use descriptive test names that read as sentences: "it should throw when email is missing"',
    ],
    knowledge: {
      overview: `Vitest — Jest-compatible API, native ESM, runs in Vite. Use for unit and integration tests. Co-locate test files with source (\`*.test.ts\` next to \`*.ts\`).`,
      patterns: `
## Key Patterns

### Basic Test Structure
\`\`\`ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('UserService', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('creates user with hashed password', async () => {
    const user = await createUser({ email: 'test@test.com', password: 'secret' })
    expect(user.email).toBe('test@test.com')
    expect(user.password).not.toBe('secret') // should be hashed
  })

  it('throws on duplicate email', async () => {
    await createUser({ email: 'dupe@test.com', password: 'pass' })
    await expect(createUser({ email: 'dupe@test.com', password: 'pass' }))
      .rejects.toThrow('Email already exists')
  })
})
\`\`\`

### Mocking
\`\`\`ts
// Mock a module
vi.mock('@/lib/email', () => ({ sendEmail: vi.fn().mockResolvedValue(true) }))

// Spy on a function
const spy = vi.spyOn(db, 'findUser').mockResolvedValue({ id: '1', email: 'a@b.com' })
expect(spy).toHaveBeenCalledWith({ email: 'a@b.com' })
\`\`\`

### React Component Testing
\`\`\`tsx
import { render, screen, fireEvent } from '@testing-library/react'

it('shows error on empty submit', async () => {
  render(<LoginForm onSubmit={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: /login/i }))
  expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
})
\`\`\``,
      gotchas: `
- **vi.mock hoisting**: \`vi.mock()\` calls are hoisted to the top of the file. Can't use variables defined before them.
- **async tests**: Always return or await async assertions. Unhandled promise rejections won't fail the test.
- **Snapshot tests**: Use sparingly — they break on any UI change and add noise.
- **Real vs mock**: Don't mock what you don't own. Test against real implementations where fast enough.
- **coverage threshold**: Set in vitest.config.ts: \`coverage: { thresholds: { lines: 80 } }\``,
      quickstart: `
\`\`\`bash
npm install -D vitest @vitest/coverage-v8
# vitest.config.ts: defineConfig({ test: { coverage: { provider: 'v8' } } })
npm run test
\`\`\``,
    },
  },
  {
    id: 'playwright',
    name: 'Playwright',
    category: 'Testing',
    emoji: '🎭',
    description: 'End-to-end browser testing across Chrome, Firefox, Safari',
    tags: ['testing', 'e2e', 'browser'],
    adr: {
      title: 'Use Playwright for end-to-end testing',
      context: 'We need E2E tests for critical user flows. We want cross-browser coverage and a modern API that handles async UI without fragile waits.',
      decision: 'Use Playwright for E2E tests. Page Object Model pattern for reusable page interactions.',
      positives: [
        'Auto-waits on all actions — no explicit waits or sleep() calls needed',
        'Tests run in Chromium, Firefox, and WebKit — real cross-browser coverage',
        'Built-in trace viewer makes debugging failures in CI fast',
        'Fixture and storage state support reduces test setup boilerplate',
      ],
      negatives: [
        'Slower than unit tests — E2E suite should be limited to critical paths only',
        'Requires a running application — adds CI infrastructure complexity',
      ],
      alternatives: ['Cypress (better DX for simple apps, Chrome-only)', 'Selenium (widest browser support, more verbose)', 'WebdriverIO (enterprise-grade, complex setup)'],
    },
    bestPractices: [
      'Never use page.waitForTimeout() — use auto-waiting assertions like expect(locator).toBeVisible() instead',
      'Use role-based and label-based selectors (getByRole, getByLabel) — CSS selectors break on UI refactors',
      'Each test must be fully independent — never share browser state, cookies, or DB state between tests',
      'Use the Page Object Model pattern for any flow tested more than once',
      'Store authenticated session state in a file and reuse it — do not log in via the UI in every test',
      'Use test fixtures for common setup (authenticated pages, seeded DB) rather than beforeEach repetition',
      'Enable screenshot and video on failure in CI — `screenshot: "only-on-failure", video: "on-first-retry"`',
    ],
    knowledge: {
      overview: `Playwright for E2E tests. Tests run in real browsers (Chromium, Firefox, WebKit). Use for critical user flows — login, checkout, form submission. NOT for unit logic.`,
      patterns: `
## Key Patterns

### Page Object Model
\`\`\`ts
// pages/LoginPage.ts
class LoginPage {
  constructor(private page: Page) {}
  async goto() { await this.page.goto('/login') }
  async login(email: string, password: string) {
    await this.page.fill('[name=email]', email)
    await this.page.fill('[name=password]', password)
    await this.page.click('[type=submit]')
    await this.page.waitForURL('/dashboard')
  }
}

// tests/auth.spec.ts
test('user can log in', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login('user@test.com', 'password')
  await expect(page).toHaveURL('/dashboard')
})
\`\`\`

### Fixtures for Authenticated State
\`\`\`ts
// fixtures.ts
export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'auth.json' })
    const page = await context.newPage()
    await use(page)
    await context.close()
  },
})
\`\`\`

### CI Setup
\`\`\`yaml
- name: Run Playwright tests
  run: npx playwright test
  env:
    BASE_URL: http://localhost:3000
\`\`\``,
      gotchas: `
- **Flaky tests**: Use \`await expect(locator).toBeVisible()\` not \`page.waitForTimeout()\`. Playwright auto-waits.
- **Selectors**: Prefer role/label selectors (\`getByRole\`, \`getByLabel\`) over CSS/XPath — more resilient to UI changes.
- **Test isolation**: Each test gets a fresh browser context. Don't share state between tests.
- **Screenshots on failure**: Enable in playwright.config: \`screenshot: 'only-on-failure'\`.
- **Parallel execution**: Tests run in parallel by default. Ensure DB is reset between test files.`,
      quickstart: `
\`\`\`bash
npm init playwright@latest
npx playwright test
npx playwright test --ui  # interactive mode
\`\`\``,
    },
  },

  // ─── DevOps ───────────────────────────────────────────────────────────────
  {
    id: 'prisma',
    name: 'Prisma',
    category: 'DevOps',
    emoji: '💎',
    description: 'Type-safe ORM for Node.js with migrations',
    tags: ['orm', 'database', 'typescript'],
    adr: {
      title: 'Use Prisma as the ORM',
      context: 'We need a database access layer for our Node.js backend. We want type safety, migration management, and a clean query API.',
      decision: 'Use Prisma ORM with schema-first development. Prisma Migrate for all schema changes.',
      positives: [
        'Schema is the single source of truth — types, migrations, and docs all generated from it',
        'Type-safe queries prevent entire classes of runtime errors',
        'Prisma Studio provides a GUI for data inspection during development',
        'Migration history is version-controlled alongside code',
      ],
      negatives: [
        'Generated client must be re-generated after every schema change',
        'Complex queries sometimes require dropping to raw SQL',
      ],
      alternatives: ['Drizzle ORM (lighter, SQL-like syntax, no code generation)', 'Kysely (type-safe query builder, no schema file)', 'Raw SQL with pg (maximum control, maximum boilerplate)'],
    },
    bestPractices: [
      'Use a singleton Prisma client — instantiating a new PrismaClient per request exhausts the connection pool',
      'Run `prisma generate` in CI/CD before building — the generated client must match the current schema',
      'Use `prisma migrate deploy` in production, never `prisma migrate dev` — dev mode can reset data',
      'Never use select and include at the same top level — they are mutually exclusive',
      'Define onDelete behavior on all relations explicitly — never rely on defaults',
      'Use Prisma middleware or extensions for cross-cutting concerns (soft deletes, audit logs) — not ad-hoc in every query',
      'For serverless, set `connection_limit=1` in the DATABASE_URL and use a connection pooler like PgBouncer',
    ],
    knowledge: {
      overview: `Prisma ORM with type-safe client generated from schema. Supports PostgreSQL, MySQL, SQLite, MongoDB. Use Prisma Migrate for schema changes.`,
      patterns: `
## Key Patterns

### Singleton Client
\`\`\`ts
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
})
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
\`\`\`

### Soft Deletes
\`\`\`prisma
model Post {
  id        String    @id @default(cuid())
  deletedAt DateTime?
}
\`\`\`
\`\`\`ts
// Middleware for soft delete
prisma.$use(async (params, next) => {
  if (params.action === 'delete') {
    params.action = 'update'
    params.args.data = { deletedAt: new Date() }
  }
  return next(params)
})
\`\`\``,
      gotchas: `
- **Prisma Client generation**: Run \`npx prisma generate\` after schema changes, before building.
- **Connection pooling**: In serverless, use \`@prisma/client/edge\` with Prisma Data Proxy or PgBouncer.
- **Select vs include**: \`select\` replaces default fields, \`include\` adds to them. Can't use both at top level.
- **Migrations in CI**: Run \`prisma migrate deploy\` (not dev) in production/CI.`,
      quickstart: `
\`\`\`bash
npm install prisma @prisma/client
npx prisma init
npx prisma db push    # quick schema sync (dev only)
npx prisma migrate dev # create migration
\`\`\``,
    },
  },

  // ─── New tools ────────────────────────────────────────────────────────────
  {
    id: 'zod',
    name: 'Zod',
    category: 'Backend',
    emoji: '🛡️',
    description: 'TypeScript-first schema validation with static type inference',
    tags: ['validation', 'typescript', 'schema'],
    bestPractices: [
      'Define schemas once and derive TypeScript types from them with z.infer<typeof MySchema> — never duplicate type definitions',
      'Validate at all system boundaries: API request bodies, env vars, external API responses, URL params',
      'Use z.object().strict() to reject unknown fields at API boundaries — prevents parameter pollution attacks',
      'Use .safeParse() when you want to handle errors gracefully; use .parse() only when failure should throw',
      'Compose schemas with .extend(), .merge(), .pick(), and .omit() — never copy-paste schema definitions',
      'Validate all environment variables at startup with a single Zod schema — fail fast before the app starts',
      'Use z.discriminatedUnion() for union types that share a discriminant field — much better error messages',
      'Transform data during parsing with .transform() — coerce types at the boundary, use clean types inside business logic',
    ],
    adr: {
      title: 'Use Zod for schema validation and type inference',
      context: 'TypeScript types are erased at runtime. We need runtime validation that stays in sync with our TypeScript types without duplicating type definitions.',
      decision: 'Use Zod for all schema validation. Derive TypeScript types with z.infer<> from Zod schemas.',
      positives: [
        'Single source of truth: schema definitions generate both runtime validation and TypeScript types',
        'Parse-and-validate in one step — no separate validation-then-assertion pattern',
        'Excellent composability: schemas are merged, extended, picked, and transformed',
        'First-class integration with tRPC, React Hook Form, Prisma, and most modern TS libraries',
      ],
      negatives: [
        'Bundle size: ~14kb gzipped — meaningful for browser-only use cases without tree-shaking',
        'Complex discriminated unions can be verbose to define',
      ],
      alternatives: ['Valibot (smaller bundle, similar API)', 'Joi (older, weaker TypeScript integration)', 'Yup (React form ecosystem, less composable)'],
    },
    knowledge: {
      overview: `Zod: define schemas, derive TypeScript types, validate at boundaries. Use .parse() to throw on invalid data, .safeParse() to handle errors without exceptions.`,
      patterns: `
## Key Patterns

### Define Schema, Infer Type
\`\`\`ts
import { z } from 'zod'

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'user', 'guest']),
  age: z.number().int().min(0).optional(),
  createdAt: z.coerce.date(),
})

type User = z.infer<typeof UserSchema>
\`\`\`

### Validate Env Vars at Startup
\`\`\`ts
// env.ts — import early in your entry point
const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})
export const env = EnvSchema.parse(process.env)
\`\`\`

### API Request Validation
\`\`\`ts
const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).max(10).default([]),
})

const result = CreatePostSchema.safeParse(req.body)
if (!result.success) {
  return res.status(400).json({ errors: result.error.flatten() })
}
const { title, content, tags } = result.data // fully typed
\`\`\`

### Schema Composition
\`\`\`ts
const BaseSchema = z.object({ id: z.string(), email: z.string().email() })
const CreateSchema = BaseSchema.omit({ id: true })
const UpdateSchema = CreateSchema.partial()
\`\`\``,
      gotchas: `
## Common Gotchas

- **Types are erased at runtime**: Zod schemas are the only runtime validation. TypeScript types alone don't protect at runtime.
- **.parse() throws**: Use .safeParse() and check result.success if you don't want exceptions.
- **Not strict by default**: z.object() allows unknown keys. Use .strict() at API boundaries to reject them.
- **.optional() vs .nullish()**: .optional() allows undefined only. .nullish() allows both null and undefined.
- **Async refinements**: Use .parseAsync() / .safeParseAsync() for schemas with async .refine() calls.
- **Error formatting**: result.error.flatten() gives field-level errors; result.error.format() gives a nested tree.`,
      quickstart: `
\`\`\`bash
npm install zod
\`\`\``,
    },
  },

  {
    id: 'drizzle',
    name: 'Drizzle ORM',
    category: 'DevOps',
    emoji: '💧',
    description: 'Lightweight TypeScript ORM with SQL-like syntax and zero code generation',
    tags: ['orm', 'database', 'typescript', 'sql'],
    envVars: ['DATABASE_URL=postgresql://user:password@localhost:5432/mydb'],
    bestPractices: [
      'Define schema in TypeScript — it is the single source of truth for types and SQL structure',
      'Use drizzle-kit generate to create SQL migrations and commit them to version control — never write migration SQL by hand',
      'Use drizzle-kit push only for local prototyping — always use generate + migrate in staging and production',
      'Always wrap multi-step writes in a transaction: await db.transaction(async (tx) => { ... })',
      'Export inferred types with $inferSelect and $inferInsert from schema tables — no manual type duplication',
      'Use the relational API (db.query) for queries involving relations; use db.select for full SQL control',
      'In serverless, create the db client outside the handler and reuse it — never create a new connection per request',
    ],
    adr: {
      title: 'Use Drizzle ORM for database access',
      context: "We need type-safe database access. We prefer SQL-like syntax and want to avoid Prisma's code generation step and heavy client.",
      decision: 'Use Drizzle ORM with drizzle-kit for migrations. Schema defined in TypeScript, types inferred at compile time.',
      positives: [
        'SQL-like query syntax — readable, predictable, no magic query translation',
        'No code generation — types are inferred from schema directly, no prisma generate step in CI',
        'Minimal dependencies, small bundle — suitable for edge runtimes (Cloudflare Workers, Vercel Edge)',
        'First-class support for Postgres, MySQL, SQLite, Neon, PlanetScale, and Turso',
      ],
      negatives: [
        'Relational query API is newer and has fewer escape hatches than Prisma include',
        'Less GUI tooling compared to Prisma Studio',
      ],
      alternatives: ['Prisma (more batteries, Prisma Studio, larger community)', 'Kysely (pure query builder, no schema management)', 'Raw SQL with pg (maximum control, maximum boilerplate)'],
    },
    knowledge: {
      overview: `Drizzle ORM: schema-first, TypeScript-native, SQL-like queries. No code generation — types inferred from schema at compile time. Supports edge runtimes.`,
      patterns: `
## Key Patterns

### Schema Definition
\`\`\`ts
// db/schema.ts
import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  authorId: integer('author_id').references(() => users.id).notNull(),
})

// Inferred types — no manual type duplication
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
\`\`\`

### CRUD
\`\`\`ts
import { eq, desc } from 'drizzle-orm'

const user = await db.select().from(users).where(eq(users.email, email)).limit(1)
const [newUser] = await db.insert(users).values({ email, name }).returning()
await db.update(users).set({ name }).where(eq(users.id, id))
await db.delete(users).where(eq(users.id, id))
\`\`\`

### Relational Queries
\`\`\`ts
const posts = await db.query.posts.findMany({
  with: { author: true },
  orderBy: desc(posts.createdAt),
  limit: 10,
})
\`\`\`

### Transactions
\`\`\`ts
const result = await db.transaction(async (tx) => {
  const [user] = await tx.insert(users).values({ email }).returning()
  await tx.insert(auditLog).values({ action: 'user_created', userId: user.id })
  return user
})
\`\`\``,
      gotchas: `
## Common Gotchas

- **push vs migrate**: drizzle-kit push syncs the DB directly (dev only). generate creates versioned SQL files. Always use generate+migrate in production.
- **.returning()**: Add .returning() after insert/update to get the created/updated row. Without it you get nothing.
- **Relations must be defined explicitly**: The relational API requires defining relations() — it doesn't infer them from FK constraints alone.
- **eq(), not ==**: Never use == for comparisons in query conditions — always import and use eq(), gt(), lt() etc.
- **Edge runtimes**: Use the neon-http or neon-serverless driver for Cloudflare Workers / Vercel Edge instead of node-postgres.`,
      quickstart: `
\`\`\`bash
npm install drizzle-orm pg
npm install -D drizzle-kit @types/pg
npx drizzle-kit generate
npx drizzle-kit migrate
\`\`\``,
    },
  },

  {
    id: 'authjs',
    name: 'Auth.js',
    category: 'Backend',
    emoji: '🔐',
    description: 'Authentication for Next.js — OAuth, credentials, magic links',
    tags: ['auth', 'oauth', 'session', 'nextjs'],
    versions: ['4', '5'],
    envVars: [
      'NEXTAUTH_URL=http://localhost:3000',
      'NEXTAUTH_SECRET=',
      'GITHUB_CLIENT_ID=',
      'GITHUB_CLIENT_SECRET=',
    ],
    bestPractices: [
      'Always set NEXTAUTH_SECRET — generate it with: openssl rand -base64 32 — missing it causes hard failures in production',
      'Never expose provider client secrets in client-side code or NEXT_PUBLIC_ env vars',
      'Use the session strategy that matches your deployment: "jwt" for serverless/edge, "database" for revocable sessions',
      'In v5, export auth() from auth.ts and use it everywhere — replaces getServerSession(authOptions)',
      'Protect routes in middleware.ts, not in page components — middleware runs before rendering and prevents flash',
      'Add the session callback to expose user.id — it is not included in the session by default',
      'For credentials provider, you handle all security: hash passwords with bcrypt, never store plaintext',
      'Never trust session.user.id without verifying it exists — getSession() can return null at any time',
    ],
    adr: {
      title: 'Use Auth.js for authentication',
      context: 'We need authentication with OAuth providers, session management, and TypeScript support for Next.js. Building OAuth flows from scratch is error-prone.',
      decision: 'Use Auth.js (NextAuth.js) for authentication. OAuth providers for social logins.',
      positives: [
        'OAuth providers (GitHub, Google, Discord, etc.) are a single configuration object — no manual OAuth flow',
        'Handles CSRF protection, session rotation, and token refresh automatically',
        'Adapters for every major database ORM — database session persistence is plug-and-play',
        'First-class Next.js App Router support in v5',
      ],
      negatives: [
        'v4 to v5 is a significant API migration — breaking change in imports and configuration',
        'Credentials provider is less opinionated — you write the security-critical parts yourself',
      ],
      alternatives: ['Clerk (hosted auth, generous free tier, excellent DX)', 'Lucia Auth (more control, less magic)', 'Supabase Auth (if already on Supabase stack)'],
    },
    knowledge: {
      overview: `Auth.js v5 for new projects. auth() replaces getServerSession(). Middleware-based route protection. 40+ OAuth providers, credentials, and magic links supported.`,
      patterns: `
## Key Patterns

### Setup (v5)
\`\`\`ts
// auth.ts — root of project
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isProtected = nextUrl.pathname.startsWith('/dashboard')
      if (isProtected && !isLoggedIn) return false
      return true
    },
  },
})
\`\`\`

### Middleware (route protection)
\`\`\`ts
// middleware.ts
export { auth as middleware } from './auth'
export const config = { matcher: ['/dashboard/:path*', '/api/:path*'] }
\`\`\`

### Server Component — get session
\`\`\`ts
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function Page() {
  const session = await auth()
  if (!session) redirect('/login')
  return <div>Welcome {session.user?.name}</div>
}
\`\`\`

### API Route Handler
\`\`\`ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth'
export const { GET, POST } = handlers
\`\`\``,
      gotchas: `
## Common Gotchas

- **v4 vs v5**: Different import paths and configuration API — check which version is installed.
- **NEXTAUTH_SECRET required**: Missing in production causes a hard failure. Generate: openssl rand -base64 32.
- **Session vs JWT strategy**: JWT can't be revoked server-side. Database sessions can be revoked but need an adapter.
- **user.id not in session by default**: Add the session callback to expose it from the JWT token.sub.
- **Edge runtime**: Not all database adapters work on the edge. Use JWT strategy for Cloudflare Workers.
- **Credentials provider**: You are responsible for password hashing (use bcrypt), validation, and rate limiting.`,
      quickstart: `
\`\`\`bash
npm install next-auth@beta
# Generate secret:
openssl rand -base64 32
\`\`\``,
    },
  },

  {
    id: 'zustand',
    name: 'Zustand',
    category: 'Frontend',
    emoji: '🐻',
    description: 'Minimal, unopinionated React state management',
    tags: ['state-management', 'react', 'frontend'],
    bestPractices: [
      'Keep stores small and domain-focused — one store per concern (auth, cart, UI), not one global store',
      'Always select a minimal slice: const name = useStore(s => s.name) — never useStore() without a selector',
      'Use the immer middleware for nested state updates: set(produce(state => { state.deep.field = x }))',
      'Separate actions from state in the store definition — makes the store testable and readable',
      'Never call store methods during render — call them in event handlers and effects only',
      'For TypeScript, define the full store type and pass it as the generic: create<StoreType>()()',
      'In Next.js SSR: create the store inside a React context to prevent request-to-request state leakage',
    ],
    adr: {
      title: 'Use Zustand for client-side state management',
      context: "We need shared client state that React Context handles poorly at scale. Context causes full subtree re-renders; we need granular subscriptions.",
      decision: 'Use Zustand for shared client state. React useState for local component state.',
      positives: [
        'Minimal API: create() a store, useStore() to subscribe — 5 minute learning curve',
        'Granular subscriptions with selectors — components only re-render when their selected slice changes',
        'No Provider wrapper required — store is a module, accessible anywhere',
        'First-class middleware: immer for immutable updates, devtools for debugging, persist for localStorage',
      ],
      negatives: [
        'No enforced structure — large stores become disorganized without team conventions',
        'Less ecosystem than Redux for legacy enterprise integrations',
      ],
      alternatives: ['Jotai (atomic state, more granular subscriptions)', 'Redux Toolkit (more structure, better for large teams)', 'React Context + useReducer (no dependency, sufficient for simpler apps)'],
    },
    knowledge: {
      overview: `Zustand: create a store, subscribe with selectors. No Provider, minimal boilerplate. Add immer middleware for nested state mutations.`,
      patterns: `
## Key Patterns

### Basic Store
\`\`\`ts
import { create } from 'zustand'

interface CounterStore {
  count: number
  increment: () => void
  reset: () => void
}

export const useCounterStore = create<CounterStore>()((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}))
\`\`\`

### Selector (granular subscription)
\`\`\`ts
// Only re-renders when count changes — not on any other store update
const count = useCounterStore((state) => state.count)
const increment = useCounterStore((state) => state.increment)
\`\`\`

### Immer for Nested State
\`\`\`ts
import { immer } from 'zustand/middleware/immer'

const useStore = create<State>()(immer((set) => ({
  user: { profile: { name: 'Alice' } },
  updateName: (name: string) =>
    set((state) => { state.user.profile.name = name }),
})))
\`\`\`

### Persist to localStorage
\`\`\`ts
import { persist } from 'zustand/middleware'

const usePrefs = create(persist(
  (set) => ({ theme: 'dark', setTheme: (t: string) => set({ theme: t }) }),
  { name: 'user-preferences' }
))
\`\`\``,
      gotchas: `
## Common Gotchas

- **Selector every time**: useStore() without a selector subscribes to the entire store — every state update triggers a re-render.
- **Functional updates**: Use set((state) => ...) when new state depends on current state to avoid stale closures.
- **Immer + spread**: Don't mix Immer mutations and spread returns in the same set call — pick one approach.
- **SSR / Next.js**: Zustand stores are singletons. In Next.js, create stores inside a context to avoid sharing state across server requests.
- **DevTools**: Wrap with devtools() middleware in development to inspect state in Redux DevTools browser extension.`,
      quickstart: `
\`\`\`bash
npm install zustand
# Optional: npm install immer
\`\`\``,
    },
  },

  {
    id: 'redis',
    name: 'Redis / Upstash',
    category: 'Database',
    emoji: '🔴',
    description: 'In-memory store for caching, sessions, queues, and rate limiting',
    tags: ['cache', 'redis', 'session', 'queue', 'rate-limit'],
    envVars: [
      'REDIS_URL=redis://localhost:6379',
      'UPSTASH_REDIS_REST_URL=',
      'UPSTASH_REDIS_REST_TOKEN=',
    ],
    bestPractices: [
      'Set TTL on every key — never store data in Redis without an expiry unless it is intentionally permanent',
      'Use descriptive key namespaces: resource:id (e.g. cache:user:123) — prevents key collisions across features',
      'Never store sensitive data (passwords, raw tokens) in Redis without encryption — it is an in-memory store',
      'Use MULTI/EXEC transactions or Lua scripts for operations that must be atomic',
      'Use Upstash REST client for serverless/edge environments — traditional Redis clients hold TCP connections',
      'Set maxmemory and maxmemory-policy (allkeys-lru is a safe default for caching) to prevent unbounded growth',
      'Implement rate limiting with the sliding window algorithm or the @upstash/ratelimit library',
    ],
    adr: {
      title: 'Use Redis for caching and ephemeral data',
      context: 'We need fast caching for API responses, session storage, rate limiting, and/or background queues. Postgres is too slow and heavy for these ephemeral use cases.',
      decision: 'Use Redis (or Upstash for serverless/edge) for caching, rate limiting, and session storage.',
      positives: [
        'Sub-millisecond read/write performance — orders of magnitude faster than database queries',
        'Native data structures (strings, hashes, sorted sets, lists) suit counters, leaderboards, and queues natively',
        'Upstash is serverless-native with an HTTP REST API — works on Cloudflare Workers and Vercel Edge',
        'TTL on every key — data expires automatically without maintenance jobs',
      ],
      negatives: [
        'Ephemeral by default — data can be lost on restart without AOF/RDB persistence configuration',
        'Memory is limited and expensive — not appropriate for large datasets',
      ],
      alternatives: ['Vercel KV (Upstash under the hood, zero config on Vercel)', 'Memcached (faster pure caching, no data structures)', 'DynamoDB (serverless-native, higher latency)'],
    },
    knowledge: {
      overview: `Redis for caching, sessions, rate limiting, pub/sub, and queues. Use Upstash for serverless/edge (HTTP-based). Always set TTLs. Key design: namespace:resource:id.`,
      patterns: `
## Key Patterns

### Cache-Aside
\`\`\`ts
async function getCachedUser(userId: string): Promise<User> {
  const key = \`cache:user:\${userId}\`
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached) as User
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } })
  await redis.setex(key, 3600, JSON.stringify(user)) // 1 hour TTL
  return user
}
\`\`\`

### Rate Limiting (Upstash)
\`\`\`ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

const { success } = await ratelimit.limit(userId)
if (!success) return new Response('Too Many Requests', { status: 429 })
\`\`\`

### Session Storage
\`\`\`ts
const sessionKey = \`session:\${sessionId}\`
await redis.setex(sessionKey, 86400, JSON.stringify(sessionData)) // 24h TTL
const session = await redis.get(sessionKey)
\`\`\``,
      gotchas: `
## Common Gotchas

- **No TTL = memory leak**: Every key without a TTL stays forever. Always use SETEX or EXPIRE.
- **JSON serialization**: Redis stores strings — JSON.stringify on write, JSON.parse on read.
- **Serverless connections**: Traditional Redis clients hold TCP connections. In serverless, use Upstash REST client.
- **Key collisions**: Without namespacing, features overwrite each other's keys. Use consistent prefixes.
- **Cluster mode**: In Redis Cluster, all keys in a multi-key command must hash to the same slot. Use hash tags: {user:123}.
- **Transactions don't roll back**: MULTI/EXEC queues commands. If one fails, others still execute. There is no rollback.`,
      quickstart: `
\`\`\`bash
# Local Redis
npm install ioredis
# Serverless (Upstash)
npm install @upstash/redis @upstash/ratelimit
\`\`\``,
    },
  },

  {
    id: 'trpc',
    name: 'tRPC',
    category: 'Backend',
    emoji: '🔗',
    description: 'End-to-end type-safe APIs without schemas or code generation',
    tags: ['api', 'typescript', 'rpc', 'nextjs'],
    bestPractices: [
      'Validate all procedure inputs with Zod — never accept unvalidated or loosely typed inputs',
      'Use middleware for cross-cutting concerns: authentication via protectedProcedure, rate limiting, logging',
      'Separate router files by domain (userRouter, postRouter) and merge in the root appRouter',
      'Use superjson transformer to transparently handle Date, Map, and Set serialization across the wire',
      'After mutations, invalidate only the affected queries: utils.posts.list.invalidate() — not the entire cache',
      'Throw TRPCError with appropriate codes (UNAUTHORIZED, NOT_FOUND, BAD_REQUEST) for typed client-side error handling',
      'In Next.js App Router, call procedures directly from Server Components via the server caller — skip HTTP overhead',
    ],
    adr: {
      title: 'Use tRPC for the API layer between frontend and backend',
      context: "We need a type-safe API between our Next.js frontend and backend. REST requires manual type sync; GraphQL adds schema complexity. We are TypeScript-only.",
      decision: 'Use tRPC for all client-to-server communication. Zod for input validation on all procedures.',
      positives: [
        'Zero type duplication: TypeScript types flow from server router to client automatically — no code generation',
        'Full type safety: calling a server procedure from the client has autocomplete and compile-time checks',
        'Procedure inputs are validated with Zod — no validation gaps between types and runtime',
        'First-class Next.js integration with both App Router and Pages Router',
      ],
      negatives: [
        'TypeScript-only — no non-TS clients can consume the API without a REST adapter',
        'Not a REST API — external integrations (webhooks, mobile apps) need separate REST endpoints',
      ],
      alternatives: ['REST + OpenAPI (language-agnostic, broad tooling)', 'GraphQL (flexible querying, better for large API surfaces)', 'Next.js Server Actions (built-in, simpler for form mutations)'],
    },
    knowledge: {
      overview: `tRPC: define procedures on the server, call them from the client with full TypeScript type safety. No codegen, no manual sync, no client/server type drift.`,
      patterns: `
## Key Patterns

### Router Definition
\`\`\`ts
// server/routers/post.ts
import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'

export const postRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10) }))
    .query(async ({ input, ctx }) => {
      return ctx.db.post.findMany({ take: input.limit, orderBy: { createdAt: 'desc' } })
    }),
  create: protectedProcedure
    .input(z.object({ title: z.string().min(1), content: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.post.create({ data: { ...input, authorId: ctx.session.user.id } })
    }),
})
\`\`\`

### Protected Middleware
\`\`\`ts
// server/trpc.ts
export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { ...ctx, session: ctx.session } })
})
\`\`\`

### Client (React)
\`\`\`ts
const { data: posts } = trpc.post.list.useQuery({ limit: 20 })
const createPost = trpc.post.create.useMutation({
  onSuccess: () => utils.post.list.invalidate(),
})
\`\`\`

### App Router API Handler
\`\`\`ts
// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/routers/_app'
import { createContext } from '@/server/context'
const handler = (req: Request) => fetchRequestHandler({ endpoint: '/api/trpc', req, router: appRouter, createContext })
export { handler as GET, handler as POST }
\`\`\`

### Server Component Direct Call
\`\`\`ts
import { createCaller } from '@/server/routers/_app'
const caller = createCaller(await createContext())
const posts = await caller.post.list({ limit: 10 })
\`\`\``,
      gotchas: `
## Common Gotchas

- **App Router**: Use the fetch adapter and createCaller for Server Components — not the Next.js legacy adapter.
- **superjson required**: Without it, Date objects become strings. Add the transformer to both client and server configs.
- **Batching**: tRPC batches multiple queries in a single HTTP request by default — be aware when debugging network requests.
- **Context type**: Make sure createContext() returns the type your procedures expect — TypeScript won't catch mismatches at the router level.
- **Error handling**: TRPCError propagates to the client with its code. Other thrown errors become INTERNAL_SERVER_ERROR.
- **Input required**: Procedures without .input() don't accept typed arguments. Always define input schemas.`,
      quickstart: `
\`\`\`bash
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query superjson zod
\`\`\``,
    },
  },
]

// ─── Presets ──────────────────────────────────────────────────────────────────

export interface Preset {
  id: string
  name: string
  description: string
  tools: string[]
}

export const PRESETS: Preset[] = [
  {
    id: 'saas',
    name: 'SaaS Starter',
    description: 'Next.js · Tailwind · Auth.js · Prisma · PostgreSQL',
    tools: ['nextjs', 'tailwind', 'authjs', 'prisma', 'postgresql'],
  },
  {
    id: 'ai-app',
    name: 'AI App',
    description: 'Next.js · Tailwind · OpenAI · Supabase',
    tools: ['nextjs', 'tailwind', 'openai', 'supabase'],
  },
  {
    id: 't3',
    name: 'T3 Stack',
    description: 'Next.js · tRPC · Auth.js · Prisma · Tailwind',
    tools: ['nextjs', 'trpc', 'authjs', 'prisma', 'tailwind'],
  },
  {
    id: 'rest-api',
    name: 'REST API',
    description: 'Node.js · Express · PostgreSQL · Zod · Docker',
    tools: ['nodejs', 'express', 'postgresql', 'zod', 'docker'],
  },
]
