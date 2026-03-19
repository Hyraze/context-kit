export interface ToolCombo {
  /** All tool IDs must be selected for this combo to activate */
  tools: string[]
  label: string
  /** Additional best-practice rules injected into the Stack-Specific Rules section */
  rules: string[]
  /** Additional patterns / gotchas injected into the knowledge section */
  notes: string
}

export const COMBOS: ToolCombo[] = [
  {
    tools: ['nextjs', 'supabase'],
    label: 'Next.js + Supabase',
    rules: [
      'Use createServerClient from @supabase/ssr (not the default createClient) in Server Components, Route Handlers, and Middleware',
      'Use createBrowserClient from @supabase/ssr in Client Components — never use createServerClient on the client',
      'Call supabase.auth.getUser() (not getSession()) on the server — getSession() does not re-validate the JWT with the auth server',
      'Refresh the session in middleware on every request by calling supabase.auth.getUser() and propagating updated cookies',
    ],
    notes: `
### Next.js + Supabase: SSR Auth Setup

Use \`@supabase/ssr\` package, not the plain \`@supabase/supabase-js\` client, for server-side auth:

\`\`\`ts
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(c) {
          try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) }
          catch { /* Called from Server Component — cookies are read-only */ }
        },
      },
    }
  )
}
\`\`\`

Middleware must refresh the session on every request:
\`\`\`ts
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(c) { c.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options)) },
      },
    }
  )
  await supabase.auth.getUser() // refreshes session + rotates token if needed
  return supabaseResponse
}
\`\`\``,
  },

  {
    tools: ['nextjs', 'prisma'],
    label: 'Next.js + Prisma',
    rules: [
      'Use a singleton PrismaClient to prevent connection exhaustion in hot-reload dev and serverless environments',
      'In serverless (Vercel, AWS Lambda), add ?connection_limit=1 to DATABASE_URL and use PgBouncer or Prisma Accelerate',
      'Add prisma generate to your build script — the generated client must match the deployed schema in CI/CD',
      'Use prisma migrate deploy in production CI, never prisma migrate dev — dev mode can reset data',
    ],
    notes: `
### Next.js + Prisma: Singleton Client

\`\`\`ts
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
})
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
\`\`\`

Build script in \`package.json\`:
\`\`\`json
{ "scripts": { "build": "prisma generate && next build" } }
\`\`\`

Serverless DATABASE_URL (Vercel):
\`\`\`
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=1&pool_timeout=0"
\`\`\``,
  },

  {
    tools: ['nextjs', 'authjs'],
    label: 'Next.js + Auth.js',
    rules: [
      'Export auth, handlers, signIn, signOut from a single auth.ts file at the project root',
      'Use middleware.ts with the exported auth function to protect routes before rendering — not in page components',
      'Use await auth() in Server Components to get the session — never useSession() in Server Components',
      'Add the session callback to expose user.id (it is not included by default)',
    ],
    notes: `
### Next.js App Router + Auth.js v5

\`\`\`ts
// auth.ts
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

export const { handlers, auth, signIn, signOut } = NextAuth({
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
  providers: [GitHub],
})

// middleware.ts
export { auth as middleware } from './auth'
export const config = { matcher: ['/dashboard/:path*'] }
\`\`\``,
  },

  {
    tools: ['react', 'tailwind'],
    label: 'React + Tailwind',
    rules: [
      'Use a cn() utility (clsx + tailwind-merge) for all conditional class logic — never template literals with Tailwind',
      'Use CVA (class-variance-authority) for multi-variant components — avoids nested ternary class logic',
      'Never mix Tailwind utility classes with CSS Modules on the same element — pick one approach per component',
      'Extract repeated class groups into component abstractions, not @apply directives',
    ],
    notes: `
### React + Tailwind: cn() utility

\`\`\`bash
npm install clsx tailwind-merge
\`\`\`

\`\`\`ts
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
\`\`\`

\`\`\`tsx
// Usage — conditional classes without conflict
<button className={cn('px-4 py-2 rounded font-medium', isActive && 'bg-blue-500 text-white', className)}>
\`\`\`

### CVA for multi-variant components

\`\`\`bash
npm install class-variance-authority
\`\`\`

\`\`\`ts
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva('px-4 py-2 rounded font-medium transition-colors', {
  variants: {
    variant: {
      primary: 'bg-blue-600 text-white hover:bg-blue-500',
      ghost: 'bg-transparent border border-zinc-300 hover:bg-zinc-100',
    },
    size: { sm: 'text-sm py-1', lg: 'text-lg px-6' },
  },
  defaultVariants: { variant: 'primary', size: 'sm' },
})

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>
export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
\`\`\``,
  },

  {
    tools: ['nextjs', 'tailwind'],
    label: 'Next.js + Tailwind',
    rules: [
      'Configure Tailwind content paths to cover the App Router: app/**/*.{ts,tsx}, components/**/*.{ts,tsx}',
      'Use the cn() utility (clsx + tailwind-merge) for conditional classes — never string interpolation with Tailwind',
      'Use CSS variables for theme tokens in tailwind.config.ts to enable runtime theme switching',
    ],
    notes: `
### Next.js + Tailwind config

\`\`\`ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: { extend: {} },
  plugins: [],
}
export default config
\`\`\``,
  },

  {
    tools: ['trpc', 'nextjs'],
    label: 'tRPC + Next.js',
    rules: [
      'Use the fetch adapter (fetchRequestHandler) for the App Router API route — not the legacy Next.js adapter',
      'Call procedures directly from Server Components via createCaller — skip the HTTP round-trip for server-to-server calls',
      'Add superjson as the transformer to both the client config and server config — otherwise Dates become strings',
    ],
    notes: `
### tRPC + Next.js App Router

API Route:
\`\`\`ts
// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/routers/_app'
import { createContext } from '@/server/context'

const handler = (req: Request) =>
  fetchRequestHandler({ endpoint: '/api/trpc', req, router: appRouter, createContext })

export { handler as GET, handler as POST }
\`\`\`

Server Component direct call (no HTTP):
\`\`\`ts
import { createCaller } from '@/server/routers/_app'
import { createContext } from '@/server/context'

const caller = createCaller(await createContext())
const posts = await caller.post.list({ limit: 10 })
\`\`\``,
  },

  {
    tools: ['drizzle', 'postgresql'],
    label: 'Drizzle + PostgreSQL',
    rules: [
      'Use @neondatabase/serverless or postgres.js driver for serverless/edge; use node-postgres (pg) for traditional Node.js servers',
      'Commit generated migration SQL files to version control — never apply un-reviewed SQL to production',
      'Run npx drizzle-kit migrate in CI after building, not during application startup',
    ],
    notes: `
### Drizzle + PostgreSQL setup

Node.js server:
\`\`\`ts
// db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
export const db = drizzle(pool, { schema })
\`\`\`

Serverless (Neon / Vercel Postgres):
\`\`\`ts
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
\`\`\`

\`drizzle.config.ts\`:
\`\`\`ts
import { defineConfig } from 'drizzle-kit'
export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
})
\`\`\``,
  },

  {
    tools: ['authjs', 'prisma'],
    label: 'Auth.js + Prisma',
    rules: [
      'Install @auth/prisma-adapter and pass it as the adapter in your Auth.js config',
      'Run npx auth secret and npx prisma migrate dev --name add-auth-tables after adding the Prisma adapter schema',
      'Use database sessions (not JWT) when using the Prisma adapter — it enables server-side session revocation',
    ],
    notes: `
### Auth.js + Prisma Adapter

\`\`\`bash
npm install @auth/prisma-adapter
\`\`\`

\`\`\`ts
// auth.ts
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import NextAuth from 'next-auth'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  providers: [...],
})
\`\`\`

Add Auth.js schema to \`prisma/schema.prisma\` — see the official Auth.js Prisma adapter docs for the required models (Account, Session, User, VerificationToken).`,
  },

  {
    tools: ['trpc', 'zod'],
    label: 'tRPC + Zod',
    rules: [
      'Every tRPC procedure must have a Zod .input() schema — never skip validation even for procedures with no parameters',
      'Reuse Zod schemas between tRPC input validation and form validation (React Hook Form, etc.) — single source of truth',
      'Use z.object({}) as the input for procedures that take no arguments — enables future non-breaking input extension',
    ],
    notes: `
### tRPC + Zod: Shared schemas

\`\`\`ts
// shared/schemas/post.ts — reuse on client and server
import { z } from 'zod'

export const CreatePostSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).max(10).default([]),
})
export type CreatePostInput = z.infer<typeof CreatePostSchema>
\`\`\`

\`\`\`ts
// tRPC procedure
create: protectedProcedure
  .input(CreatePostSchema)
  .mutation(async ({ input }) => { ... })

// React Hook Form
const form = useForm<CreatePostInput>({
  resolver: zodResolver(CreatePostSchema),
})
\`\`\``,
  },
]

/** Returns all combos that are active given the currently selected tool IDs */
export function getActiveCombos(selectedToolIds: string[]): ToolCombo[] {
  const selected = new Set(selectedToolIds)
  return COMBOS.filter(combo => combo.tools.every(id => selected.has(id)))
}
