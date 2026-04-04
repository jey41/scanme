import { getTranslations } from "next-intl/server";

import { QrToolTabs } from "@/components/qr/qr-tool-tabs";

export default async function ToolPage() {
  const t = await getTranslations("ToolPage");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="max-w-3xl space-y-4">
        <p className="text-sm font-medium text-foreground-muted">{t("eyebrow")}</p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t("title")}</h1>
        <p className="text-balance text-lg leading-8 text-foreground-muted">{t("description")}</p>
      </div>

      <QrToolTabs />
    </div>
  );
}
