"use client"

import "./globals.css"
import { Result } from "better-result"
import { Geist } from "next/font/google"
import { useEffect, useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"
import { createLogger } from "@/shared/logging/logger"
import { cn } from "@/shared/utils"
import messages from "@/messages/en.json"

// The key under which next-themes stores the theme chosen in the app.
const THEME_STORAGE_KEY = "theme"

const log = createLogger("react")

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

// Replaces the root layout when it crashes, e.g. while the database is down.
// It therefore brings its own document, styles, theme and messages.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  const isDark = useSyncExternalStore(
    emptySubscribe,
    getClientIsDark,
    () => false,
  )
  const t = messages.errors

  useEffect(() => {
    log.error("Root layout crashed", { error, digest: error.digest })
  }, [error])

  return (
    <html
      lang="en"
      className={cn(isDark && "dark")}
    >
      <body className={cn(geistSans.variable, "antialiased")}>
        <title>__APP_NAME__</title>

        <main className="flex h-screen w-full flex-col items-center justify-center gap-8 p-6 pb-20 text-center">
          <div className="flex max-w-md flex-col items-center gap-2">
            <h1 className="text-4xl font-semibold tracking-tight">
              {t.unavailable}
            </h1>

            <p className="text-muted-foreground">{t.unavailableBody}</p>
          </div>

          <Button
            size="lg"
            onClick={() => retry()}
          >
            {t.tryAgain}
          </Button>
        </main>
      </body>
    </html>
  )
}

function emptySubscribe() {
  return noop
}

function noop() {}

function getClientIsDark(): boolean {
  // Reading storage throws when the browser blocks it.
  const theme = Result.try(() =>
    localStorage.getItem(THEME_STORAGE_KEY),
  ).unwrapOr(null)

  if (theme === "dark") {
    return true
  }

  if (theme === "light") {
    return false
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
}
