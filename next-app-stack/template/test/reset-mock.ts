import type { Mock } from "bun:test"

// Forgets the calls of `fn` and every implementation a test gave it, including
// queued `mockImplementationOnce` ones, and goes back to `implementation`.
// `mockClear` keeps implementations, and `mockReset` drops the default one.
export function resetMock<T extends (...args: never[]) => unknown>(
  fn: Mock<T>,
  implementation: T,
) {
  fn.mockReset()
  fn.mockImplementation(implementation)
}
