import { makeSignature } from "better-auth/crypto"
import { NextResponse } from "next/server"
import { env } from "@/shared/env"
import { auth } from "@/lib/server/auth"
import { defineRoute } from "@/lib/server/define-route"
import { buildResponse } from "@/lib/server/response"
import { errorCodes } from "@/shared/error-codes"

const DEV_USER = {
  name: "Dev User",
  email: "dev@example.com",
}

const DEFAULT_CALLBACK_PATH = "/"

// Signs in as the dev user without OAuth, then returns to `callbackURL`. Only
// answers while `DEV_LOGIN` is set, so agents can test the app locally.
export const GET = defineRoute(
  { name: "dev-login", access: "public" },
  async (_session, request) => {
    if (!env.DEV_LOGIN) {
      return buildResponse("Not found.", errorCodes.notFound)
    }

    const authContext = await auth.$context
    const userId = await findOrCreateDevUserId(authContext)
    const session = await authContext.internalAdapter.createSession(userId)
    const { name, attributes } = authContext.authCookies.sessionToken
    const signature = await makeSignature(session.token, authContext.secret)

    const response = NextResponse.redirect(getCallbackURL(request))
    response.cookies.set(name, `${session.token}.${signature}`, {
      domain: attributes.domain,
      expires: session.expiresAt,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: attributes.secure,
    })

    return response
  },
)

async function findOrCreateDevUserId(
  authContext: Awaited<typeof auth.$context>,
) {
  const existing = await authContext.internalAdapter.findUserByEmail(
    DEV_USER.email,
  )
  if (existing) {
    return existing.user.id
  }

  const user = await authContext.internalAdapter.createUser(
    { ...DEV_USER, emailVerified: true },
    { method: "dev-login" },
  )

  return user.id
}

// Resolves `callbackURL` against the app, falling back to the home page when
// it points to another origin.
function getCallbackURL(request: Request) {
  const appURL = new URL(env.NEXT_PUBLIC_BETTER_AUTH_URL)
  const callbackURL = new URL(
    new URL(request.url).searchParams.get("callbackURL")
      ?? DEFAULT_CALLBACK_PATH,
    appURL,
  )

  if (callbackURL.origin !== appURL.origin) {
    return new URL(DEFAULT_CALLBACK_PATH, appURL)
  }

  return callbackURL
}
