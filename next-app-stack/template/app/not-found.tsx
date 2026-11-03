import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  const t = useTranslations("errors")

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 pb-20">
      <div className="flex flex-col items-center gap-2">
        <h1 className="font-mono text-4xl font-semibold tracking-tight">404</h1>

        <h2 className="text-xl text-muted-foreground">{t("pageNotFound")}</h2>
      </div>

      <Button asChild>
        <Link href="/">{t("backToHome")}</Link>
      </Button>
    </div>
  )
}
