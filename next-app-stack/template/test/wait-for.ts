// Lets already queued work run, such as resolved promises and their
// continuations. `setImmediate` is not faked by `jest.useFakeTimers`, so this
// also works while timers are faked.
export function settle(): Promise<void> {
  return new Promise(resolve => setImmediate(resolve))
}

// Settles queued work until `condition` holds.
export async function waitFor(condition: () => boolean) {
  for (let i = 0; i < 100; i++) {
    if (condition()) {
      return
    }

    await settle()
  }

  throw new Error("Condition was not met.")
}
