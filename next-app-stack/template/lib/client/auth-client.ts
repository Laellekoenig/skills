import { createAuthClient } from "better-auth/react"
import { env } from "@/shared/env"
import { inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "../server/auth"

export type ClientSession = ReturnType<typeof authClient.useSession>["data"]

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
})
