"use client"

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import type { ReactNode } from "react"
import { ThemeProvider } from "next-themes"
import { SessionProvider, type SessionSnapshot } from "./session-provider"
import { isExpectedClientError } from "@/lib/client/handled-error-matchers"
import { createLogger, type LogFields } from "@/shared/logging/logger"

const log = createLogger("query")

// Logs every failed query and mutation, after retries, in one place.
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      logFailure("Query failed", { error, queryKey: query.queryKey })
    },
  }),

  mutationCache: new MutationCache({
    onError: (error, _variables, _onMutateResult, mutation) => {
      logFailure("Mutation failed", {
        error,
        mutationKey: mutation.options.mutationKey,
      })
    },
  }),
})

export function AppProviders({
  children,
  initialSession,
}: {
  children: ReactNode
  initialSession: SessionSnapshot | null
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider initialSession={initialSession}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          {children}
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}

function logFailure(message: string, fields: LogFields & { error: Error }) {
  if (isExpectedClientError(fields.error)) {
    log.debug(message, fields)
    return
  }

  log.error(message, fields)
}
