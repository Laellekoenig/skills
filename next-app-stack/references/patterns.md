# Patterns

Shapes for common features. Follow them; do not invent parallel ones.

## Table and query

One file per table in `db/schemas/`, re-exported from `db/schemas/index.ts`, then `bun run db:generate`.

```ts
// db/schemas/notes-schema.ts
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./auth-schema"

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})
```

Data access in `lib/server/<feature>.ts`, returning Results through `dbQuery`:

```ts
import "server-only"

import { desc, eq } from "drizzle-orm"
import { db, dbQuery } from "@/db/db"
import { notes } from "@/db/schemas"

export function getNotes(userId: string) {
  return dbQuery("load notes", () =>
    db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.createdAt)),
  )
}
```

## Server action

`access` is `"public"`, `"user"` or `"admin"`; `args` a zod tuple (`NO_ARGS` for none). Return `Result.ok(null)`, never `void`.

```ts
"use server"

import { Result } from "better-result"
import z from "zod"
import { defineAction, NO_ARGS } from "@/lib/server/define-action"
import { internalError } from "@/lib/server/guards"
import { addNote, getNotes } from "@/lib/server/notes"

export const serverGetNotes = defineAction(
  { name: "serverGetNotes", access: "user", args: NO_ARGS },
  async session =>
    (await getNotes(session.user.id)).mapError(
      internalError("Failed to load notes", "Could not load your notes."),
    ),
)

export const serverAddNote = defineAction(
  {
    name: "serverAddNote",
    access: "user",
    args: z.tuple([z.string().trim().min(1).max(10_000)]),
  },
  async (session, content) => {
    if (content.includes("forbidden")) {
      return Result.err("Notes cannot contain that word.")
    }

    return (await addNote(session.user.id, content)).mapError(
      internalError("Failed to add note", "Could not save your note."),
    )
  },
)
```

## Query hook

Keys live in one object in `lib/client/query-keys.ts`.

```ts
// lib/client/query-keys.ts
export const QueryKeys = {
  forNotes: (userId: string | null) => ["notes", userId],
} as const
```

```ts
// hooks/use-notes-query.ts
import { useQuery } from "@tanstack/react-query"
import { unwrapActionResult } from "@/lib/client/action-result"
import { QueryKeys } from "@/lib/client/query-keys"
import { useSession } from "@/providers/session-provider"
import { serverGetNotes } from "@/server-actions/notes"

export function useNotesQuery() {
  const { userId } = useSession()

  return useQuery({
    queryKey: QueryKeys.forNotes(userId),
    enabled: !!userId,
    queryFn: async () => unwrapActionResult(await serverGetNotes()),
  })
}
```

Failures are logged once by the `QueryClient` in `providers/app-providers.tsx`; toast them with `sonner` where the user needs to know. Server components call `lib/server/` directly after `requireSessionOrRedirect()`.

## Route handler

```ts
// app/api/notes/export/route.ts
import { createLogger } from "@/shared/logging/logger"
import { defineRoute } from "@/lib/server/define-route"
import { internalError } from "@/lib/server/guards"
import { getNotes } from "@/lib/server/notes"
import { buildGuardErrorResponse } from "@/lib/server/response"

const log = createLogger("notes-export")

export const GET = defineRoute(
  { name: "notes-export", access: "user" },
  async session => {
    const notesResult = (await getNotes(session.user.id)).mapError(
      internalError("Failed to export notes", "Could not export your notes."),
    )
    if (notesResult.isErr()) {
      return buildGuardErrorResponse(log, notesResult.error)
    }

    return Response.json(notesResult.value)
  },
)
```

## Chaining Results

```ts
const result = await Result.gen(async function* () {
  const body = yield* Result.await(parseBody(request))
  const user = yield* Result.await(loadUser(body.userId))
  return Result.ok({ body, user })
})
```

Wrap throwing code in `Result.try` / `Result.tryPromise`, or use `safeFetch` and `safeJsonParse` from `shared/utils.ts`.

## Persisted store

```ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { createSafeJsonStorage } from "@/lib/client/persist-storage"

export interface PreferencesState {
  fontSize: number
}

export interface PreferencesActions {
  setFontSize: (size: number) => void
}

export const usePreferencesStore = create<
  PreferencesState & PreferencesActions
>()(
  persist(
    set => ({
      fontSize: 14,

      setFontSize: fontSize => set({ fontSize }),
    }),
    {
      name: "preferences",
      version: 1,
      skipHydration: true,
      storage: createSafeJsonStorage<PreferencesState>(
        () => window.localStorage,
      ),
      partialize: ({ fontSize }) => ({ fontSize }),
    },
  ),
)
```

Rehydrate `skipHydration` stores once in a `useEffect` in `AppProviders` with `store.persist.rehydrate()`.

## Test

```ts
import { beforeEach, expect, test } from "bun:test"
import { readActionResult } from "@/lib/client/action-result"
import type { AppSession } from "@/shared/app-session"
import { mockModule } from "@/test/mock-module"

let currentSession: AppSession | null = null

await mockModule("@/lib/server/session", {
  getSession: async () => currentSession,
})

const { serverGetNotes } = await import("@/server-actions/notes")

beforeEach(() => {
  currentSession = null
})

test("rejects signed-out callers", async () => {
  const result = readActionResult(await serverGetNotes())

  expect(result.isErr()).toBe(true)
})
```

## UI

`bunx shadcn@latest add <name>`, then align it with the design rules in `AGENTS.md`. Do not let the CLI overwrite `components/ui/button.tsx`. Strings go in `messages/en.json`, read with `useTranslations` or `getTranslations`.

## Optional modules

- **Redis rate limiting:** copy `modules/redis/` into the app, `bun add redis`, add `REDIS_URL` and `DISABLE_REDIS` to the env files, and add a `requireRateLimit` guard in `lib/server/guards.ts` that maps `isBelowRateLimit` to a `tooManyRequests` guard error.
- **LLM calls:** `bun add ai` plus a provider (e.g. `@openrouter/ai-sdk-provider`). Call models only from `lib/server/`, stream from a route handler, and wrap calls in `Result.try`. Check the installed SDK's docs first; its API moves fast.
- **More locales:** add `messages/<locale>.json` and resolve the locale in `i18n/request.ts` (cookie, then user preference, then `Accept-Language`).
