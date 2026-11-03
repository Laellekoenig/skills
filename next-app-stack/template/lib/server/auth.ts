import "server-only"

import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/db/db"
import * as schema from "@/db/schemas/auth-schema"
import { env } from "@/shared/env"

// After adding plugins or user fields, run `bun run auth:generate` and then
// `bun run db:generate`.
export const auth = betterAuth({
  appName: "__APP_NAME__",

  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  user: {
    deleteUser: {
      enabled: false,
    },

    changeEmail: {
      enabled: false,
    },
  },

  telemetry: {
    enabled: false,
  },

  trustedOrigins: env.BETTER_AUTH_TRUSTED_ORIGINS,

  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
})
