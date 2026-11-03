import { Result, type Result as ResultType } from "better-result"
import { drizzle } from "drizzle-orm/node-postgres"
import { env } from "@/shared/env"
import * as schema from "./schemas"

export const db = drizzle(env.DATABASE_URL, {
  schema: {
    ...schema,
  },
})

// Runs a query and turns a thrown error into "Failed to <label>: <cause>".
export function dbQuery<T>(
  label: string,
  query: () => Promise<T>,
): Promise<ResultType<T, Error>> {
  return Result.tryPromise({
    try: query,
    catch: error => new Error(`Failed to ${label}`, { cause: error }),
  })
}
