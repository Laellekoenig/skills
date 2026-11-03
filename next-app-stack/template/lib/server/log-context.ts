import "server-only"

import { AsyncLocalStorage } from "node:async_hooks"
import { setAmbientLogContext, type LogContext } from "@/shared/logging/logger"

const REQUEST_ID_LENGTH = 8

const storage = new AsyncLocalStorage<LogContext>()

setAmbientLogContext(() => storage.getStore())

// Adds the context and a short request id to every entry logged while `fn`
// runs, including in its async continuations. This correlates the entries of
// one request.
export function withLogContext<T>(context: LogContext, fn: () => T): T {
  const parentContext = storage.getStore()

  return storage.run(
    {
      requestId: crypto.randomUUID().slice(0, REQUEST_ID_LENGTH),
      ...parentContext,
      ...context,
    },
    fn,
  )
}
