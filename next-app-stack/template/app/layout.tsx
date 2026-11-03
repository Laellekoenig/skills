import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { AppProviders } from "@/providers/app-providers"
import { cn } from "@/shared/utils"
import { getSession } from "@/lib/server/session"
import { Role } from "@/lib/server/roles"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "__APP_NAME__",
  description: "__APP_DESCRIPTION__",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()
  const session = await getSession()
  const initialSession = session
    ? { user: session.user, isAdmin: Role.isAdmin(session) }
    : null

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className="overscroll-none"
    >
      <body
        className={cn(geistSans.variable, geistMono.variable, "antialiased")}
      >
        <Toaster richColors />

        <NextIntlClientProvider
          locale={locale}
          messages={messages}
        >
          <AppProviders initialSession={initialSession}>
            <main className="w-full">{children}</main>
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
