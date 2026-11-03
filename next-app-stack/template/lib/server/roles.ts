import "server-only"

import { env } from "@/shared/env"
import type { AppSession } from "@/shared/app-session"

export const Role = {
  // Emails match case-insensitively, since providers may return mixed-case
  // addresses.
  isAdmin: (session: AppSession): boolean =>
    listsEmail(env.ADMIN_EMAILS, session.user.email),
} as const

function listsEmail(list: string[], email: string): boolean {
  const normalized = email.toLowerCase()
  return list.some(entry => entry.toLowerCase() === normalized)
}
