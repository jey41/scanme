import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-black/5">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-foreground-muted sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>{t("tagline")}</p>
        <div className="flex items-center gap-4">
          <Link href="/tool" className="hover:text-foreground">
            {t("tool")}
          </Link>
          <Link href="/faq" className="hover:text-foreground">
            {t("faq")}
          </Link>
          <Link href="/about" className="hover:text-foreground">
            {t("about")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
