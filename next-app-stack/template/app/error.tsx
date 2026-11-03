"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { createLogger } from "@/shared/logging/logger"

const log = createLogger("react")

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations("errors")

  useEffect(() => {
    log.error("Page crashed", { error, digest: error.digest })
  }, [error])

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 pb-20">
      <h1 className="text-4xl font-semibold tracking-tight">
        {t("somethingWentWrong")}
      </h1>

      <Button
        size="lg"
        onClick={() => reset()}
      >
        {t("tryAgain")}
      </Button>
    </div>
  )
}
