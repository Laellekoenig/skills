import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { env } from "@/shared/env"
import { getSession } from "@/lib/server/session"
import { SignInButton } from "@/components/SignInButton"

export default async function Page() {
  if (await getSession()) {
    redirect("/")
  }

  if (env.DEV_LOGIN) {
    redirect("/api/dev-login?callbackURL=/")
  }

  const t = await getTranslations("login")

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-14 sm:px-8 sm:py-16">
      <h1 className="text-4xl font-semibold tracking-tight">{t("title")}</h1>

      <SignInButton />
    </div>
  )
}
