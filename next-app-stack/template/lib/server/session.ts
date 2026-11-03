import "server-only"

import { cache } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/server/auth"
import { Role } from "@/lib/server/roles"
import type { AppSession } from "@/shared/app-session"

// Returns the session of the current request, or null when signed out. Cached
// so that a render queries the session only once.
export const getSession = cache(async (): Promise<AppSession | null> => {
  return auth.api.getSession({
    headers: await headers(),
  })
})

// For app pages: sends signed-out users to the login.
export async function requireSessionOrRedirect() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return session
}

// For admin pages: sends signed-out users to the login and other users home.
export async function requireAdminOrRedirect() {
  const session = await requireSessionOrRedirect()

  if (!Role.isAdmin(session)) {
    redirect("/")
  }

  return session
}
