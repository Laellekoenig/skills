import { mock } from "bun:test"
import { testEnv } from "./test-env"

// Runs before every test file, which `bun run test` isolates from the others.

// The real module throws outside of React Server Components.
mock.module("server-only", () => ({}))

mock.module("@/shared/env", () => ({ env: testEnv }))

// Keeps the test output readable. Tests that check logs add their own sink.
mock.module("@/shared/logging/console-sink", () => ({ consoleSink: () => {} }))
