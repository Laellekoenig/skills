import { afterAll, mock } from "bun:test"

// Replaces exports of the module at `path` for the calling test file, and puts
// the real module back once the file is done. Plain `bun test` runs every file
// in one process, where a module mock would otherwise stay in place for the
// files that run later. Call it before importing the code under test.
export async function mockModule(
  path: string,
  overrides: Record<string, unknown>,
) {
  const real: Record<string, unknown> = { ...(await import(path)) }

  mock.module(path, () => ({ ...real, ...overrides }))
  afterAll(() => {
    mock.module(path, () => real)
  })
}
