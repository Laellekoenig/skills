import type { NextConfig } from "next"
import { withSentryConfig } from "@sentry/nextjs/config"
import createNextIntlPlugin from "next-intl/plugin"
import { env } from "./shared/env"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

const isDev = process.env.NODE_ENV !== "production"
const wsConnectSources = isDev ? "ws: wss:" : "wss:"

const nextConfig: NextConfig = {
  devIndicators: false,

  // Lets the dev server answer on the host the app is configured for.
  allowedDevOrigins: [new URL(env.NEXT_PUBLIC_BETTER_AUTH_URL).hostname],

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "img-src 'self' data: blob: https://*.googleusercontent.com",
              `connect-src 'self' ${wsConnectSources}`,
              "worker-src 'self' blob:",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
    ]
  },
}

// Source maps are uploaded when `SENTRY_ORG`, `SENTRY_PROJECT` and
// `SENTRY_AUTH_TOKEN` are set during the build.
export default withSentryConfig(withNextIntl(nextConfig), {
  silent: !process.env.CI,
  tunnelRoute: "/monitoring",
  // Route changes are not traced, since only errors are reported.
  suppressOnRouterTransitionStartWarning: true,
})
