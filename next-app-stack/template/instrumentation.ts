import type { Instrumentation } from "next"
import * as Sentry from "@sentry/nextjs"
import { env } from "./shared/env"
import { addLogSink, createLogger } from "./shared/logging/logger"
import { sentrySink } from "./shared/logging/sentry-sink"

const log = createLogger("next")

export function register() {
  // Without a DSN, Sentry stays disabled.
  Sentry.init({ dsn: env.NEXT_PUBLIC_SENTRY_DSN })
  addLogSink(sentrySink)
}

// Logs errors thrown in server components, route handlers and server actions.
export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  log.error("Unhandled request error", {
    error,
    // Shown to the user on the error page, which also logs it in the browser.
    digest: getDigest(error),
    method: request.method,
    // Drops the query string, which can contain tokens such as OAuth codes.
    path: request.path.split("?")[0],
    routePath: context.routePath,
    routeType: context.routeType,
  })
}

function getDigest(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("digest" in error)) {
    return undefined
  }

  return String(error.digest)
}
