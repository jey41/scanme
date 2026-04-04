import { getTranslations } from "next-intl/server";

import { LoginForm } from "@/components/auth/login-form";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: { next?: string };
}) {
  const { locale } = await params;
  const t = await getTranslations("LoginPage");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="max-w-3xl space-y-4">
        <p className="text-sm font-medium text-foreground-muted">{t("eyebrow")}</p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t("title")}</h1>
        <p className="text-balance text-lg leading-8 text-foreground-muted">{t("description")}</p>
      </div>

      <LoginForm
        locale={locale}
        nextPath={searchParams?.next ?? `/${locale}/tool/history`}
        isConfigured={hasSupabaseEnv()}
      />
    </div>
  );
}
