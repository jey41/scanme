import { getTranslations } from "next-intl/server";

import { Card } from "@/components/ui/card";

export default async function FaqPage() {
  const t = await getTranslations("Faq");

  const items = ["free", "privacy", "mobile", "formats"] as const;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="space-y-4">
        <p className="text-sm font-medium text-foreground-muted">{t("eyebrow")}</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{t("title")}</h1>
        <p className="text-lg leading-8 text-foreground-muted">{t("description")}</p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item} className="p-6">
            <h2 className="text-lg font-semibold">{t(`${item}.question`)}</h2>
            <p className="mt-3 text-sm leading-7 text-foreground-muted">{t(`${item}.answer`)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
