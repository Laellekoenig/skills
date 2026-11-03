import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

const booleanSchema = z.enum(["true", "false"]).transform(v => v === "true")

const optionalStringListSchema = z
  .string()
  .optional()
  .transform(s => {
    if (s === undefined) {
      return []
    }
    return s
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0)
  })

const urlListSchema = z
  .string()
  .transform(s =>
    s
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0),
  )
  .pipe(z.array(z.url()))

// Validated on startup. Add every new variable here, to `.env.example`, to
// `test/test-env.ts` and, if `next build` needs it, to the CI workflow.
export const env = createEnv({
  server: {
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_TRUSTED_ORIGINS: urlListSchema,
    DATABASE_URL: z.url(),
    // Always off in production. Ignoring it instead of failing keeps `next
    // typegen` and `next build` working with a dev `.env`.
    DEV_LOGIN: booleanSchema
      .optional()
      .default(false)
      .transform(enabled => enabled && process.env.NODE_ENV !== "production"),
    ADMIN_EMAILS: optionalStringListSchema,
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
  },

  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z.url(),
    NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
})
