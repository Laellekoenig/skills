import "server-only"

import { Result, type Result as ResultType } from "better-result"
import { env } from "@/shared/env"
import { createLogger } from "@/shared/logging/logger"
import { getRedis } from "@/lib/server/redis"

const WINDOW_SECONDS = 60

const log = createLogger("rate-limit")

// Counts this request against the user's per-minute limit for `key` and
// returns whether it is within `max`.
export async function isBelowRateLimit(
  key: string,
  userId: string,
  max: number,
): Promise<ResultType<boolean, Error>> {
  if (env.DISABLE_REDIS) {
    log.warn("Redis is disabled, skipping rate limit")
    return Result.ok(true)
  }

  const redisResult = await getRedis()
  if (redisResult.isErr()) {
    return Result.err(redisResult.error)
  }
  const redis = redisResult.value

  const redisKey = `${key}:${userId}:${new Date().getMinutes()}`

  const execResult = await Result.tryPromise({
    try: () =>
      redis.multi().incr(redisKey).expire(redisKey, WINDOW_SECONDS).execTyped(),
    catch: error =>
      new Error(`Failed to count ${key} request for ${userId}`, {
        cause: error,
      }),
  })

  return execResult.map(([count]) => count <= max)
}
