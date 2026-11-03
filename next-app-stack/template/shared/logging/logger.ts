import { Result } from "better-result"
import { consoleSink } from "./console-sink"

export type LogLevel = "debug" | "info" | "warn" | "error"

export type LogContext = Record<string, unknown>

export type LogUser = {
  id: string
}

// `error` and `user` are reserved. All other fields are logged as context. The
// most specific user wins: the call's, then the logger's, then the ambient one.
export type LogFields = LogContext & {
  error?: unknown
  user?: LogUser | null
}

export type LogEntry = {
  level: LogLevel
  scope: string
  message: string
  timestamp: Date
  // The original thrown value or Result error, so sinks can keep stack traces.
  error: unknown
  user: LogUser | undefined
  context: LogContext
}

// Forwards entries to an output such as the console, PostHog or Sentry.
export type LogSink = (entry: LogEntry) => void

export type Logger = {
  debug: (message: string, fields?: LogFields) => void
  info: (message: string, fields?: LogFields) => void
  warn: (message: string, fields?: LogFields) => void
  error: (message: string, fields?: LogFields) => void
  // Returns a logger that adds the given context to every entry.
  child: (context: LogFields) => Logger
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const MIN_LEVEL: LogLevel =
  process.env.NODE_ENV === "production" ? "info" : "debug"

const sinks: LogSink[] = [consoleSink]

let getAmbientContext: () => LogContext | undefined = () => undefined

export function createLogger(scope: string, context: LogFields = {}): Logger {
  const logAt = (level: LogLevel) => (message: string, fields?: LogFields) => {
    write({ level, scope, message, context, fields })
  }

  return {
    debug: logAt("debug"),
    info: logAt("info"),
    warn: logAt("warn"),
    error: logAt("error"),
    child: childContext => createLogger(scope, { ...context, ...childContext }),
  }
}

export function addLogSink(sink: LogSink) {
  sinks.push(sink)
}

// Supplies context, such as the current request, that is added to every entry.
export function setAmbientLogContext(provider: () => LogContext | undefined) {
  getAmbientContext = provider
}

function write({
  level,
  scope,
  message,
  context,
  fields,
}: {
  level: LogLevel
  scope: string
  message: string
  context: LogFields
  fields: LogFields | undefined
}) {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[MIN_LEVEL]) {
    return
  }

  const { user: ambientUser, ...ambientContext } = getAmbientContext() ?? {}
  const { user: boundUser, ...boundContext } = context
  const { error, user: callUser, ...callContext } = fields ?? {}

  const entry: LogEntry = {
    level,
    scope,
    message,
    timestamp: new Date(),
    error,
    user: [callUser, boundUser, ambientUser].find(isLogUser),
    context: { ...ambientContext, ...boundContext, ...callContext },
  }

  for (const sink of sinks) {
    // A broken sink must neither break the caller nor the other sinks.
    const sinkResult = Result.try(() => sink(entry))
    if (sinkResult.isErr()) {
      console.error("Log sink failed.", sinkResult.error)
    }
  }
}

function isLogUser(value: unknown): value is LogUser {
  return (
    typeof value === "object"
    && value !== null
    && "id" in value
    && typeof value.id === "string"
  )
}
