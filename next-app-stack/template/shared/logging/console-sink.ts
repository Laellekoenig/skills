import type { LogEntry } from "./logger"

const IS_BROWSER = typeof window !== "undefined"

// Passes context and errors as separate arguments, so the browser and Node
// render them as expandable objects with stack traces and causes.
export function consoleSink({
  level,
  scope,
  message,
  timestamp,
  error,
  user,
  context,
}: LogEntry) {
  const prefix = IS_BROWSER
    ? `[${scope}]`
    : `${timestamp.toISOString()} ${level.toUpperCase()} [${scope}]`

  // Only the id is logged, since Sentry's console integration turns console
  // output into breadcrumbs.
  const details: Record<string, unknown> = { ...context }
  if (user) {
    details.user = user.id
  }

  const args: unknown[] = [`${prefix} ${message}`]
  if (Object.keys(details).length > 0) {
    args.push(details)
  }

  if (error !== undefined) {
    args.push(error)
  }

  console[level](...args)
}
