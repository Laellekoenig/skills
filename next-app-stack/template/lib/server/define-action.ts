import "server-only"

import type { Result, SerializedResult } from "better-result"
import z from "zod"
import { createLogger, type LogFields } from "@/shared/logging/logger"
import {
  authorize,
  logGuardError,
  type Access,
  type AuthorizedSession,
  type GuardError,
} from "@/lib/server/guards"
import { withLogContext } from "@/lib/server/log-context"
import { getSession } from "@/lib/server/session"

type ActionArgs<TArgs extends z.ZodTuple> = Extract<z.output<TArgs>, unknown[]>

// A string is shown to the user as is. A guard error is logged and only its
// message is shown to the user.
export type ActionError = string | GuardError

type ActionDefinition<TAccess extends Access, TArgs extends z.ZodTuple> = {
  name: string
  access: TAccess
  args: TArgs
}

const INVALID_REQUEST_ERROR = "Invalid request."

export const NO_ARGS = z.tuple([])

const log = createLogger("action")

// Wraps a server action handler: authorizes the caller, validates the
// arguments, logs internal errors and serializes the result. Everything logged
// during the action is tagged with the action name, user and a request id.
export function defineAction<
  TAccess extends Access,
  TArgs extends z.ZodTuple,
  TValue,
>(
  { name, access, args }: ActionDefinition<TAccess, TArgs>,
  handler: (
    session: AuthorizedSession<TAccess>,
    ...args: ActionArgs<TArgs>
  ) => Promise<Result<TValue, ActionError>>,
) {
  return (
    ...rawArgs: z.input<TArgs>
  ): Promise<SerializedResult<TValue, string>> =>
    withLogContext({ action: name }, () =>
      runAction({ access, args, handler, rawArgs }).catch((error: unknown) => {
        log.error("Server action threw", { error })
        return Promise.reject(error)
      }),
    )
}

async function runAction<
  TAccess extends Access,
  TArgs extends z.ZodTuple,
  TValue,
>({
  access,
  args,
  handler,
  rawArgs,
}: {
  access: TAccess
  args: TArgs
  handler: (
    session: AuthorizedSession<TAccess>,
    ...args: ActionArgs<TArgs>
  ) => Promise<Result<TValue, ActionError>>
  rawArgs: z.input<TArgs>
}): Promise<SerializedResult<TValue, string>> {
  const sessionResult = authorize(await getSession(), access)
  if (sessionResult.isErr()) {
    logGuardError(log, sessionResult.error)
    return { status: "error", error: sessionResult.error.message }
  }
  const session = sessionResult.value

  const argsResult = args.safeParse(rawArgs)
  if (!argsResult.success) {
    log.warn("Rejected invalid arguments", {
      error: argsResult.error,
      user: session?.user,
    })
    return { status: "error", error: INVALID_REQUEST_ERROR }
  }

  const startedAt = performance.now()
  const result = await handler(
    session as AuthorizedSession<TAccess>,
    ...(argsResult.data as ActionArgs<TArgs>),
  )

  return result.match<SerializedResult<TValue, string>>({
    ok: value => ({ status: "ok", value }),
    err: error => ({
      status: "error",
      error: toUserMessage(error, {
        user: session?.user,
        durationMs: Math.round(performance.now() - startedAt),
      }),
    }),
  })
}

function toUserMessage(error: ActionError, fields: LogFields): string {
  if (typeof error === "string") {
    log.info("Returned error to user", { ...fields, reason: error })
    return error
  }

  logGuardError(log, error, fields)

  return error.message
}
