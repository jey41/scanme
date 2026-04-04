import { getTranslations } from "next-intl/server";

import { Card } from "@/components/ui/card";

export default async function AboutPage() {
  const t = await getTranslations("About");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="space-y-4">
        <p className="text-sm font-medium text-foreground-muted">{t("eyebrow")}</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{t("title")}</h1>
        <p className="text-lg leading-8 text-foreground-muted">{t("description")}</p>
      </div>

      <Card className="space-y-5 p-6 sm:p-7">
        <p className="text-base leading-8 text-foreground-muted">{t("body.one")}</p>
        <p className="text-base leading-8 text-foreground-muted">{t("body.two")}</p>
      </Card>
    </div>
  );
}
