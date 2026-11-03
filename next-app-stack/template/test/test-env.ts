import type { env } from "@/shared/env"

export const ADMIN_EMAIL = "admin@example.com"

// Replaces the validated env in tests. Nothing here points at a real service,
// and the database URL refuses connections.
export const testEnv: typeof env = {
  BETTER_AUTH_SECRET: "secret",
  BETTER_AUTH_TRUSTED_ORIGINS: ["https://example.com"],
  DATABASE_URL: "postgres://test:test@127.0.0.1:1/test",
  DEV_LOGIN: false,
  ADMIN_EMAILS: [ADMIN_EMAIL],
  GOOGLE_CLIENT_ID: "id",
  GOOGLE_CLIENT_SECRET: "secret",
  NEXT_PUBLIC_BETTER_AUTH_URL: "https://example.com",
  NEXT_PUBLIC_SENTRY_DSN: undefined,
}
