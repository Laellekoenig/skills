import "server-only"

import { Result, type Result as ResultType } from "better-result"
import {
  createLogger,
  type LogFields,
  type Logger,
} from "@/shared/logging/logger"
import { Role } from "@/lib/server/roles"
import type { AppSession } from "@/shared/app-session"
import { NOT_SIGNED_IN } from "@/shared/error-codes"

export type Access = "public" | "user" | "admin"

// The session a handler receives once `authorize` lets the caller through.
export type AuthorizedSession<TAccess extends Access> = TAccess extends "public"
  ? AppSession | null
  : AppSession

export type GuardError =
  | {
      type:
        | "invalid"
        | "notSignedIn"
        | "forbidden"
        | "notFound"
        | "tooManyRequests"
      message: string
    }
  | {
      type: "internal"
      message: string
      log: string
      cause: unknown
    }

export type GuardErrorType = GuardError["type"]

type RejectionType = Exclude<GuardErrorType, "internal">

const NOT_ADMIN_ERROR = "Not admin."

const log = createLogger("guard")

export function authorize(
  session: AppSession | null,
  access: "public",
): ResultType<AppSession | null, GuardError>
export function authorize(
  session: AppSession | null,
  access: Exclude<Access, "public">,
): ResultType<AppSession, GuardError>
export function authorize(
  session: AppSession | null,
  access: Access,
): ResultType<AppSession | null, GuardError>
export function authorize(
  session: AppSession | null,
  access: Access,
): ResultType<AppSession | null, GuardError> {
  if (!session) {
    if (access === "public") {
      return Result.ok(null)
    }

    return guardError("notSignedIn", NOT_SIGNED_IN)
  }

  if (access === "admin" && !Role.isAdmin(session)) {
    log.warn("Rejected non-admin caller", { user: session.user })
    return guardError("forbidden", NOT_ADMIN_ERROR)
  }

  return Result.ok(session)
}

export function logGuardError(
  logger: Logger,
  error: GuardError,
  fields: LogFields = {},
) {
  if (error.type === "internal") {
    logger.error(error.log, { ...fields, error: error.cause })
    return
  }

  const rejectionFields = { ...fields, type: error.type, reason: error.message }
  if (error.type === "notSignedIn") {
    logger.debug("Rejected request", rejectionFields)
    return
  }

  logger.info("Rejected request", rejectionFields)
}

export function guardError(
  type: RejectionType,
  message: string,
): ResultType<never, GuardError> {
  return Result.err({ type, message })
}

// Builds a `mapError` callback for failed dependencies. The log message and
// the cause are logged, only `message` is shown to the user.
export function internalError(
  log: string,
  message: string,
): (cause: unknown) => GuardError {
  return cause => ({ type: "internal", log, cause, message })
}
