import { Result } from "better-result"
import { createJSONStorage, type StorageValue } from "zustand/middleware"
import { createLogger } from "@/shared/logging/logger"

const log = createLogger("persist-storage")

// Failed reads use defaults; failed writes must not block hydration or state
// updates. Hydration only finishes on success, so persist `merge` options must
// not throw either. Stays synchronous over localStorage, so stores without
// `skipHydration` are hydrated as soon as they are created.
export function createSafeJsonStorage<State>(getStorage: () => Storage) {
  const storage = createJSONStorage<State>(getStorage)

  if (!storage) {
    return undefined
  }

  return {
    ...storage,
    getItem: (name: string) => {
      // Storage is synchronous, so reads never return a promise.
      const result = Result.try(
        () => storage.getItem(name) as StorageValue<State> | null,
      )

      if (result.isErr()) {
        log.warn("Failed to read persisted state", {
          name,
          error: result.error,
        })
        return null
      }

      return result.value
    },
    setItem: (name: string, value: StorageValue<State>) => {
      const result = Result.try(() => storage.setItem(name, value))

      if (result.isErr()) {
        log.warn("Failed to write persisted state", {
          name,
          error: result.error,
        })
      }
    },
  }
}
