import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { normalizeQrHistoryEntries } from "@/lib/history/normalize";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("History");

  if (!hasSupabaseEnv()) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="space-y-4">
          <p className="text-sm font-medium text-foreground-muted">{t("eyebrow")}</p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t("title")}</h1>
        </div>
        <Card className="p-6 sm:p-7">
          <p className="text-sm leading-7 text-foreground-muted">{t("setupRequired")}</p>
        </Card>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/tool/history`)}`);
  }

  const { data, error } = await supabase
    .from("qr_history")
    .select("id, action, content, payload, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="space-y-4">
          <p className="text-sm font-medium text-foreground-muted">{t("eyebrow")}</p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t("title")}</h1>
          <p className="text-balance text-lg leading-8 text-foreground-muted">{t("description")}</p>
        </div>

        <Card className="p-6 sm:p-7">
          <p className="text-sm leading-7 text-red-600">{t("loadError")}</p>
        </Card>
      </div>
    );
  }

  const entries = normalizeQrHistoryEntries(data ?? []);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="space-y-4">
        <p className="text-sm font-medium text-foreground-muted">{t("eyebrow")}</p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t("title")}</h1>
        <p className="text-balance text-lg leading-8 text-foreground-muted">{t("description")}</p>
      </div>

      {entries.length === 0 ? (
        <Card className="p-6 sm:p-7">
          <p className="text-sm leading-7 text-foreground-muted">{t("empty")}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="space-y-4 p-6 sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground-muted">{t(`actions.${entry.action}`)}</p>
                  <p className="mt-2 break-all text-sm leading-7 text-foreground">{entry.content}</p>
                </div>
                <p className="text-xs uppercase tracking-[0.16em] text-foreground-muted">
                  {new Date(entry.createdAt).toLocaleString(locale === "id" ? "id-ID" : "en-US")}
                </p>
              </div>

              {entry.payload ? (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(entry.payload).map(([key, value]) => (
                    <span
                      key={key}
                      className="rounded-full border border-border bg-white/80 px-3 py-1 text-xs text-foreground-muted"
                    >
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
