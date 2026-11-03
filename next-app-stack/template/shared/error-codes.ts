export const errorCodes = {
  badRequest: 400,
  forbidden: 403,
  notFound: 404,
  tooManyRequests: 429,
  internalServerError: 500,
} as const

export type ErrorCode = (typeof errorCodes)[keyof typeof errorCodes]

// Returned to the client when a request needs a signed-in user.
export const NOT_SIGNED_IN = "Not signed-in." as const
