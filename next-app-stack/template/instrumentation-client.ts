import * as Sentry from "@sentry/nextjs"
import { env } from "./shared/env"
import { addLogSink, createLogger } from "./shared/logging/logger"
import { sentrySink } from "./shared/logging/sentry-sink"
import { isExpectedClientError } from "./lib/client/handled-error-matchers"

const log = createLogger("window")

// The logger is the only path to Sentry, so uncaught errors are filtered by the
// listeners below instead of being captured directly by Sentry.
const DISABLED_SENTRY_INTEGRATIONS = new Set([
  "GlobalHandlers",
  "BrowserApiErrors",
])

// Without a DSN, Sentry stays disabled.
Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: integrations =>
    integrations.filter(
      integration => !DISABLED_SENTRY_INTEGRATIONS.has(integration.name),
    ),
})

addLogSink(sentrySink)

window.addEventListener("error", event => {
  logUncaught("Uncaught error", event.error ?? event.message)
})

window.addEventListener("unhandledrejection", event => {
  logUncaught("Unhandled promise rejection", event.reason)
})

function logUncaught(message: string, error: unknown) {
  const fields = { error, path: window.location.pathname }

  // Expected errors, such as network failures, are handled elsewhere.
  if (isExpectedClientError(error)) {
    log.debug(`${message} (expected)`, fields)
    return
  }

  log.error(message, fields)
}
