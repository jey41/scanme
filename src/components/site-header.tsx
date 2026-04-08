import { ScanQrCode } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { AuthButton } from "./auth/auth-button";
import { LanguageSwitcher } from "./language-switcher";

type SiteHeaderProps = {
  locale: string;
};

export async function SiteHeader({ locale }: SiteHeaderProps) {
  const t = await getTranslations("Nav");
  const isConfigured = hasSupabaseEnv();
  const supabase = await createSupabaseServerClient();
  const userEmail = isConfigured && supabase ? (await supabase.auth.getUser()).data.user?.email ?? null : null;

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
          <Link href="/about" className="hover:text-foreground">
            {t("about")}
          </Link>
          <Link href="/tool/history" className="hover:text-foreground">
            {t("history")}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <AuthButton locale={locale} userEmail={userEmail} isConfigured={isConfigured} />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
