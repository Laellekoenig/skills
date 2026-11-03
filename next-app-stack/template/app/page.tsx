import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/server/session"
import { SignOutButton } from "@/components/SignOutButton"

export default async function Page() {
  const session = await getSession()
  const t = await getTranslations("home")

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-14 sm:px-8 sm:py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-semibold tracking-tight">{t("title")}</h1>

        <p className="text-base leading-7 text-muted-foreground">
          {session
            ? t("signedInAs", { name: session.user.name })
            : t("signedOut")}
        </p>
      </div>

      {session ? (
        <SignOutButton />
      ) : (
        <Button
          asChild
          className="w-fit"
        >
          <Link href="/login">{t("signIn")}</Link>
        </Button>
      )}
    </div>
  )
}
