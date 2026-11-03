import "server-only"

import type { LogFields, Logger } from "@/shared/logging/logger"
import {
  logGuardError,
  type GuardError,
  type GuardErrorType,
} from "@/lib/server/guards"
import { errorCodes, type ErrorCode } from "@/shared/error-codes"

const STATUS_BY_GUARD_ERROR_TYPE: Record<GuardErrorType, ErrorCode> = {
  invalid: errorCodes.badRequest,
  notSignedIn: errorCodes.forbidden,
  forbidden: errorCodes.forbidden,
  notFound: errorCodes.notFound,
  tooManyRequests: errorCodes.tooManyRequests,
  internal: errorCodes.internalServerError,
}

export function buildResponse(message: string, status: ErrorCode) {
  return Response.json({ message }, { status })
}

// Adapts a guard error to an HTTP response for route handlers.
export function buildGuardErrorResponse(
  logger: Logger,
  error: GuardError,
  fields?: LogFields,
): Response {
  logGuardError(logger, error, fields)

  return buildResponse(error.message, STATUS_BY_GUARD_ERROR_TYPE[error.type])
}
