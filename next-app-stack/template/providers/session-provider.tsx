"use client"

import { authClient, type ClientSession } from "@/lib/client/auth-client"
import { useMounted } from "@/hooks/use-mounted"
import { useRouter } from "next/navigation"
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"

export type SessionUser = NonNullable<ClientSession>["user"]

export interface SessionSnapshot {
  user: SessionUser
  isAdmin: boolean
}

interface SessionContextType {
  user: SessionUser | null
  userId: string | null
  isLoggedIn: boolean
  isAdmin: boolean
  refetch: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | null>(null)

export function SessionProvider({
  children,
  initialSession,
}: {
  children: ReactNode
  initialSession: SessionSnapshot | null
}) {
  const {
    data: clientSession,
    isPending: isClientSessionPending,
    refetch,
  } = authClient.useSession()
  const mounted = useMounted()
  const [hasClientSessionSettled, setHasClientSessionSettled] = useState(false)

  // Better Auth marks refetches as pending while the session is null, e.g.
  // after logout. Only the first request may fall back to the server snapshot.
  if (mounted && !isClientSessionPending && !hasClientSessionSettled) {
    setHasClientSessionSettled(true)
  }

  const user = getCurrentUser({
    clientSession,
    initialSession,
    useClientSession:
      hasClientSessionSettled || (mounted && !isClientSessionPending),
  })
  const userId = user?.id ?? null
  const initialUserId = initialSession?.user.id ?? null

  useRefreshSnapshotOnUserChange(userId, initialUserId)

  const value: SessionContextType = {
    user,
    userId,
    isLoggedIn: user !== null,
    isAdmin: isInitialAdmin(initialSession, userId),
    refetch,
  }

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error(`useSession must be used within SessionProvider`)
  }
  return ctx
}

function getCurrentUser({
  clientSession,
  initialSession,
  useClientSession,
}: {
  clientSession: ClientSession
  initialSession: SessionSnapshot | null
  useClientSession: boolean
}): SessionUser | null {
  if (useClientSession) {
    return clientSession?.user ?? null
  }

  return initialSession?.user ?? null
}

function useRefreshSnapshotOnUserChange(
  userId: string | null,
  initialUserId: string | null,
) {
  const router = useRouter()

  useEffect(() => {
    if (userId === initialUserId) {
      return
    }

    router.refresh()
  }, [initialUserId, router, userId])
}

function isInitialAdmin(
  initialSession: SessionSnapshot | null,
  userId: string | null,
) {
  return (
    initialSession !== null
    && initialSession.isAdmin
    && initialSession.user.id === userId
  )
}
