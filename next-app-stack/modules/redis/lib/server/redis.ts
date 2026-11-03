import "server-only"

import { createClient } from "redis"
import { env } from "@/shared/env"
import { Result, type Result as ResultType } from "better-result"
import { createLogger } from "@/shared/logging/logger"

const log = createLogger("redis")

export type RedisClient = ReturnType<typeof createRedisClient>

const REDIS_CONNECT_TIMEOUT_MS = 1_000

let redis: RedisClient | null = null
let redisConnection: Promise<ResultType<RedisClient, Error>> | null = null

export async function getRedis(): Promise<ResultType<RedisClient, Error>> {
  if (env.DISABLE_REDIS) {
    return Result.err(new Error("Redis is disabled"))
  }

  if (redis?.isReady) {
    return Result.ok(redis)
  }

  redis = null

  if (!redisConnection) {
    redisConnection = connectRedis()
  }

  // Only clear the in-flight promise if this call is still waiting on it.
  const connection = redisConnection
  const result = await connection
  if (redisConnection === connection) {
    redisConnection = null
  }

  return result
}

async function connectRedis(): Promise<ResultType<RedisClient, Error>> {
  const client = createRedisClient()

  let closedByUs = false

  client
    .on("error", error => {
      clearRedisClient(client)
      if (closedByUs && isSocketClosedUnexpectedlyError(error)) {
        return
      }

      log.warn("Client connection error", { error })
    })
    .on("end", () => {
      clearRedisClient(client)
    })

  let timeout: ReturnType<typeof setTimeout> | undefined
  const connectTimeout = new Promise<never>((_resolve, reject) => {
    timeout = setTimeout(() => {
      reject(
        new Error(
          `Redis connection timed out after ${REDIS_CONNECT_TIMEOUT_MS}ms`,
        ),
      )
    }, REDIS_CONNECT_TIMEOUT_MS)
  })

  const connectResult = await Result.tryPromise({
    try: () => Promise.race([client.connect(), connectTimeout]),
    catch: error => new Error("Failed to connect to redis", { cause: error }),
  })
  if (timeout) {
    clearTimeout(timeout)
  }

  if (connectResult.isErr()) {
    closedByUs = true
    clearRedisClient(client)
    destroyRedisClient(client)
    return connectResult
  }

  redis = connectResult.value
  return connectResult
}

function createRedisClient() {
  return createClient({
    url: env.REDIS_URL,
    socket: {
      connectTimeout: REDIS_CONNECT_TIMEOUT_MS,
      reconnectStrategy: false,
    },
  })
}

function clearRedisClient(client: RedisClient) {
  if (redis === client) {
    redis = null
  }
}

function destroyRedisClient(client: RedisClient) {
  if (!client.isOpen) {
    return
  }

  const destroyResult = Result.try(() => client.destroy())
  if (destroyResult.isErr()) {
    log.warn("Failed to destroy client", { error: destroyResult.error })
  }
}

function isSocketClosedUnexpectedlyError(error: Error): boolean {
  return error.message === "Socket closed unexpectedly"
}
