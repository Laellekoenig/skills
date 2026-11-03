"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/client/auth-client"

export function SignOutButton() {
  const router = useRouter()
  const t = useTranslations("home")

  return (
    <Button
      variant="outline"
      className="w-fit"
      onClick={async () => {
        await authClient.signOut()
        router.refresh()
      }}
    >
      {t("signOut")}
    </Button>
  )
}
