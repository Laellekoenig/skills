import { ACTION_RESULT_ERROR_NAME } from "@/lib/client/action-result"
import { NOT_SIGNED_IN } from "@/shared/error-codes"

export type ErrorShape = {
  name: string | undefined
  message: string | undefined
  stackSources?: readonly string[]
}

// Errors that are either expected, already logged by the server, or caused by
// the user's browser rather than by the app.
export function isExpectedClientError(error: unknown): boolean {
  return isHandledClientError(toErrorShape(error))
}

export function isNotSignedInError({ message }: ErrorShape): boolean {
  return message === NOT_SIGNED_IN
}

// Thrown when the browser still runs a build whose server actions are gone.
export function isStaleServerActionError({
  name,
  message,
}: ErrorShape): boolean {
  if (name === "UnrecognizedActionError") {
    return true
  }

  return (
    typeof message === "string"
    && message.includes("Server Action")
    && message.includes("was not found on the server")
  )
}

export function isUnexpectedServerResponseError({
  message,
}: ErrorShape): boolean {
  return message === "An unexpected response was received from the server."
}

export function isNetworkFetchError({ name, message }: ErrorShape): boolean {
  if (name !== "TypeError" || typeof message !== "string") {
    return false
  }

  return (
    message.includes("Failed to fetch")
    || message.includes("Load failed")
    || message.includes("NetworkError when attempting to fetch resource")
  )
}

export function isOpaqueBrowserScriptError({
  name,
  message,
  stackSources,
}: ErrorShape): boolean {
  if (message !== "Script error.") {
    return false
  }

  if (name !== undefined && name !== "Error") {
    return false
  }

  return stackSources === undefined || stackSources.length === 0
}

export function isActionResultError({ name }: ErrorShape): boolean {
  return name === ACTION_RESULT_ERROR_NAME
}

export function isAbortError({ name }: ErrorShape): boolean {
  return name === "AbortError"
}

// Browsers report it when layout changes during a resize observer callback.
// It does not affect the page.
export function isResizeObserverLoopError({ message }: ErrorShape): boolean {
  return message?.startsWith("ResizeObserver loop") ?? false
}

export function isBrowserExtensionError({ stackSources }: ErrorShape): boolean {
  return stackSources?.some(source => source.includes("-extension://")) ?? false
}

export function isHandledClientError(error: ErrorShape): boolean {
  return (
    isStaleServerActionError(error)
    || isNetworkFetchError(error)
    || isUnexpectedServerResponseError(error)
    || isNotSignedInError(error)
    || isOpaqueBrowserScriptError(error)
    || isActionResultError(error)
    || isAbortError(error)
    || isResizeObserverLoopError(error)
    || isBrowserExtensionError(error)
  )
}

function toErrorShape(error: unknown): ErrorShape {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stackSources: error.stack ? [error.stack] : [],
    }
  }

  return { name: undefined, message: String(error) }
}
