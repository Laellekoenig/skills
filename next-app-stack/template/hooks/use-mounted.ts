import { useSyncExternalStore } from "react"

export function useMounted() {
  return useSyncExternalStore(emptySubscribe, getMountedSnapshot, () => false)
}

function emptySubscribe() {
  return noop
}

function getMountedSnapshot() {
  return true
}

function noop() {}
