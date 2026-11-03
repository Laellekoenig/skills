"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/client/auth-client"

export function SignInButton() {
  const t = useTranslations("login")

  return (
    <Button
      size="lg"
      className="w-fit"
      onClick={() =>
        authClient.signIn.social({ provider: "google", callbackURL: "/" })
      }
    >
      {t("withGoogle")}
    </Button>
  )
}
