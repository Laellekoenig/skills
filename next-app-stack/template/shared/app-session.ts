import type { auth } from "@/lib/server/auth"

export type AppSession = typeof auth.$Infer.Session

export type AppUser = AppSession["user"]
