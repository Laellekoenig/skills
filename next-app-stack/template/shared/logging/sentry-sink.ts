import * as Sentry from "@sentry/nextjs"
import type { LogEntry } from "./logger"

// Reports error entries to Sentry. Lower levels reach Sentry as breadcrumbs
// through its console integration, since the console sink logs them.
export function sentrySink({
  level,
  scope,
  message,
  error,
  user,
  context,
}: LogEntry) {
  if (level !== "error") {
    return
  }

  Sentry.withScope(sentryScope => {
    sentryScope.setTag("log.scope", scope)
    sentryScope.setContext("log", { message, ...context })

    // Only the id is sent, so no personal data leaves the app.
    if (user) {
      sentryScope.setUser({ id: user.id })
    }

    if (error === undefined) {
      Sentry.captureMessage(message, "error")
      return
    }

    Sentry.captureException(error)
  })
}
