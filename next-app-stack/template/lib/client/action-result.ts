import {
  Result,
  type Result as ResultType,
  type SerializedResult,
} from "better-result"

export const ACTION_RESULT_ERROR_NAME = "ActionResultError"

// An error message returned by a server action. The server already logs its
// internal errors, so the client does not need to report them again.
export class ActionResultError extends Error {
  constructor(message: string) {
    super(message)
    this.name = ACTION_RESULT_ERROR_NAME
  }
}

export function readActionResult<T>(
  serialized: SerializedResult<T, string>,
): ResultType<T, string> {
  return serialized.status === "ok"
    ? Result.ok(serialized.value)
    : Result.err(serialized.error)
}

// For query and mutation functions, which report failures by throwing.
export function unwrapActionResult<T>(
  serialized: SerializedResult<T, string>,
): T {
  const result = readActionResult(serialized)
  if (result.isErr()) {
    throw new ActionResultError(result.error)
  }

  return result.value
}
