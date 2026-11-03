import "server-only"

import { createLogger } from "@/shared/logging/logger"
import { auth } from "@/lib/server/auth"
import {
  authorize,
  type Access,
  type AuthorizedSession,
  type GuardError,
} from "@/lib/server/guards"
import { withLogContext } from "@/lib/server/log-context"
import { buildGuardErrorResponse } from "@/lib/server/response"
import { getSession } from "@/lib/server/session"

type RouteDefinition<TAccess extends Access> = {
  name: string
  access: TAccess
}

type RouteHandler<TAccess extends Access, TContext> = (
  session: AuthorizedSession<TAccess>,
  request: Request,
  context: TContext,
) => Promise<Response>

const UNTRUSTED_ORIGIN_ERROR: GuardError = {
  type: "forbidden",
  message: "Untrusted origin.",
}

const SAFE_METHODS = new Set(["GET", "HEAD"])

const log = createLogger("route")

// Wraps a route handler: rejects requests that change state from untrusted
// origins, authorizes the caller and answers rejections with an error
// response. Everything logged during the request is tagged with the
// route name and a request id.
export function defineRoute<TAccess extends Access, TContext = unknown>(
  { name, access }: RouteDefinition<TAccess>,
  handler: RouteHandler<TAccess, TContext>,
) {
  return (request: Request, context: TContext): Promise<Response> =>
    withLogContext({ route: name }, () =>
      runRoute({ access, handler, request, context }).catch(
        (error: unknown) => {
          log.error("Route handler threw", { error })
          return Promise.reject(error)
        },
      ),
    )
}

async function runRoute<TAccess extends Access, TContext>({
  access,
  handler,
  request,
  context,
}: {
  access: TAccess
  handler: RouteHandler<TAccess, TContext>
  request: Request
  context: TContext
}): Promise<Response> {
  if (!SAFE_METHODS.has(request.method) && !(await hasTrustedOrigin(request))) {
    return buildGuardErrorResponse(log, UNTRUSTED_ORIGIN_ERROR, {
      origin: request.headers.get("origin"),
    })
  }

  const sessionResult = authorize(await getSession(), access)
  if (sessionResult.isErr()) {
    return buildGuardErrorResponse(log, sessionResult.error)
  }

  return handler(
    sessionResult.value as AuthorizedSession<TAccess>,
    request,
    context,
  )
}

// Session cookies are sent with same-site requests, so a request that changes
// state must also come from an origin Better Auth trusts. Browsers send the
// Origin header with every such request.
async function hasTrustedOrigin(request: Request): Promise<boolean> {
  const origin = request.headers.get("origin")
  if (!origin) {
    return false
  }

  const authContext = await auth.$context

  return authContext.isTrustedOrigin(origin, { allowRelativePaths: false })
}
