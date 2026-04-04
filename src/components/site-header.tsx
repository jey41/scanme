import { ScanQrCode } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader() {
  const t = useTranslations("Nav");

  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold text-foreground">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-foreground text-background">
            <ScanQrCode className="size-5" />
          </span>
          <span className="text-base">Scanme</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-foreground-muted md:flex">
          <Link href="/tool" className="hover:text-foreground">
            {t("tool")}
          </Link>
          <Link href="/faq" className="hover:text-foreground">
            {t("faq")}
          </Link>
          <Link href="/about" className="hover:text-foreground">
            {t("about")}
          </Link>
        </nav>

        <LanguageSwitcher />
      </div>
    </header>
  );
}
