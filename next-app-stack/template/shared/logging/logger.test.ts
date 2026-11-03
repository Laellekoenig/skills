import {
  afterEach,
  beforeEach,
  describe,
  expect,
  mock,
  spyOn,
  test,
} from "bun:test"
import { withLogContext } from "@/lib/server/log-context"
import { addLogSink, createLogger, type LogEntry } from "./logger"

const entries: LogEntry[] = []

let isSinkBroken = false

// Registered before the capturing sink, so a broken sink is followed by one
// that must still run. Sinks cannot be removed, so it is only broken during
// the test that needs it.
addLogSink(() => {
  if (isSinkBroken) {
    throw new Error("sink down")
  }
})

addLogSink(entry => entries.push(entry))

beforeEach(() => {
  entries.length = 0
})

afterEach(() => {
  isSinkBroken = false
  mock.restore()
})

describe("createLogger", () => {
  test("separates the error and user from the context", () => {
    const error = new Error("boom")

    createLogger("test").error("Failed", {
      error,
      user: { id: "user-1" },
      itemId: "item-1",
    })

    expect(entries[0]).toMatchObject({
      level: "error",
      scope: "test",
      message: "Failed",
      error,
      user: { id: "user-1" },
      context: { itemId: "item-1" },
    })
  })

  test("prefers the call's user, then the logger's, then the ambient one", () => {
    const logger = createLogger("test", { user: { id: "bound" } })

    withLogContext({ user: { id: "ambient" } }, () => {
      logger.info("call", { user: { id: "call" } })
      logger.info("bound")
      createLogger("test").info("ambient")
      createLogger("test").info("invalid user", { user: null })
    })

    expect(entries.map(e => e.user?.id)).toEqual([
      "call",
      "bound",
      "ambient",
      "ambient",
    ])
  })

  test("lets the call's context override the child's and the ambient one", () => {
    const logger = createLogger("test")
      .child({ source: "parent", route: "/api" })
      .child({ source: "child" })

    withLogContext({ requestId: "r1", source: "ambient" }, () => {
      logger.info("first")
      logger.info("second", { source: "call" })
    })

    expect(entries.map(e => e.context)).toEqual([
      { requestId: "r1", source: "child", route: "/api" },
      { requestId: "r1", source: "call", route: "/api" },
    ])
  })

  test("keeps logging when a sink throws", () => {
    isSinkBroken = true
    const consoleError = spyOn(console, "error").mockImplementation(() => {})

    expect(() => createLogger("test").warn("still works")).not.toThrow()
    expect(consoleError).toHaveBeenCalledTimes(1)

    expect(entries.map(e => e.message)).toEqual(["still works"])
  })
})
