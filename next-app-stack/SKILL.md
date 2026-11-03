---
name: next-app-stack
description: Scaffold a new full-stack web app on Next.js + Bun with Tailwind, shadcn/ui, Better Auth, Drizzle/Postgres, TanStack Query, Zustand, next-intl, zod, better-result, Sentry, Oxlint, Oxfmt and cspell, including conventions and agent guidance. Use when asked to start, create or scaffold a new app or repo on this stack.
---

# next-app-stack

Creates an app from `template/`: a working skeleton with auth, database,
logging, error handling, checks and CI. Copy it; do not rebuild it from memory
or with `create-next-app`. Dependencies are installed at their latest versions.

## Stack

- Bun, Next.js (App Router, Turbopack), React, TypeScript
- Tailwind CSS, shadcn/ui, Lucide, Geist, next-themes, sonner
- Better Auth (Google OAuth + local dev login), Drizzle, PostgreSQL
- Server actions + TanStack Query, Zustand, next-intl, zod, `@t3-oss/env-nextjs`
- `better-result` instead of `try`; own logger with a Sentry sink
- Oxlint (custom rules in `oxlint/`), Oxfmt, cspell, `bun test`, GitHub Actions

## Setup

1. **Inputs.** Ask only for what is missing: kebab-case name, one-line
   description, target directory (empty or new).

2. **Copy.**

   ```sh
   mkdir -p <app> && cp -R <skill>/template/. <app>/ && cd <app>
   grep -rl -e __APP_NAME__ -e __APP_DESCRIPTION__ . \
     | xargs perl -pi -e 's/__APP_NAME__/<name>/g; s/__APP_DESCRIPTION__/<description>/g'
   git init
   ```

3. **Install latest.**

   ```sh
   bun add next react react-dom server-only \
     @t3-oss/env-nextjs zod better-result better-auth drizzle-orm pg \
     @tanstack/react-query zustand next-intl next-themes sonner @sentry/nextjs \
     radix-ui class-variance-authority clsx tailwind-merge lucide-react
   bun add -d typescript @types/bun @types/node @types/react @types/react-dom @types/pg \
     tailwindcss @tailwindcss/postcss @tailwindcss/typography tw-animate-css \
     oxlint oxfmt @tanstack/eslint-plugin-query cspell drizzle-kit
   ```

4. **Env.** `cp .env.example .env`. Set `BETTER_AUTH_SECRET` from
   `openssl rand -base64 32`, point `DATABASE_URL` at a local Postgres, enable
   `DEV_LOGIN=true` and `ADMIN_EMAILS=dev@example.com`. Leave OAuth
   credentials as placeholders; never invent secrets.

5. **Database.** `bun run db:generate`, then `bun run db:migrate` against a
   local database only.

6. **Verify.** `bun run verify` and `bun run build` must pass without
   warnings. If a newer package version broke a template file, fix it against
   that package's current docs (Next.js ships them in
   `node_modules/next/dist/docs/`), not by downgrading. Then run
   `bun run dev`, open `/login`, and confirm it lands on `/` signed in as
   Dev User.

7. **Report** what was created and what the user still needs to supply (OAuth
   credentials, production database, Sentry DSN). Commit only when asked.

## Building on it

Read `<app>/AGENTS.md` before writing features, and follow the shapes in
`references/patterns.md`. The server entry points (`lib/server/define-action.ts`,
`define-route.ts`, `guards.ts`) and `shared/logging/` show the conventions.

## Gotchas

- `bun run test` (isolated), never bare `bun test`.
- New env vars go in `shared/env.ts`, `test/test-env.ts`, `.env.example` and, if the build needs them, CI.
- `next.config.ts` sets a strict CSP; add new external hosts there.
- After changing Better Auth plugins or user fields: `bun run auth:generate`, then `bun run db:generate`.
- Turbopack turns raw imports of non-JS files into `undefined`; serve them from `public/`.
- The first `next dev` appends a Next.js block to `AGENTS.md`. Keep it.
