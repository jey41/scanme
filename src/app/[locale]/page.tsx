import { ArrowRight, Camera, ImageUp, Link, QrCode } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { AccordionFaq } from "@/components/accordion-faq";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { Link as NavLink } from "@/i18n/navigation";

export default async function HomePage() {
  const t = await getTranslations("Home");
  const tFaq = await getTranslations("Faq");

  const faqItems = (["free", "privacy", "mobile", "formats"] as const).map(
    (key) => ({
      question: tFaq(`${key}.question`),
      answer: tFaq(`${key}.answer`),
    }),
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-5 py-10 sm:px-6 lg:px-8 lg:py-16">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-7">
          <div className="inline-flex rounded-full border border-border bg-background-elevated px-4 py-2 text-sm text-foreground-muted">
            {t("badge")}
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {t("title")}
            </h1>
            <p className="max-w-2xl text-balance text-lg leading-8 text-foreground-muted">
              {t("description")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <NavLink
              href="/tool"
              className={cn(
                "inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium outline-none",
                "bg-foreground text-background hover:opacity-90 shadow-[0_10px_24px_rgba(27,23,18,0.14)]",
              )}
            >
              {t("actions.primary")}
              <ArrowRight className="ml-2 size-4" />
            </NavLink>
            <a
              href="#faq"
              className={cn(
                "inline-flex h-11 items-center justify-center rounded-full border border-border bg-background-elevated px-5 text-sm font-medium text-foreground outline-none hover:bg-white",
              )}
            >
              {t("actions.secondary")}
            </a>
          </div>
        </div>

        <Card className="p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: QrCode, title: t("cards.generate.title"), text: t("cards.generate.text"), href: "/tool?tab=generate" as const },
              { icon: ImageUp, title: t("cards.decode.title"), text: t("cards.decode.text"), href: "/tool?tab=decode" as const },
              { icon: Camera, title: t("cards.scan.title"), text: t("cards.scan.text"), href: "/tool?tab=camera" as const },
              { icon: ArrowRight, title: t("cards.download.title"), text: t("cards.download.text"), href: "/tool?tab=generate" as const },
              { icon: Link, title: t("cards.shortlink.title"), text: t("cards.shortlink.text"), href: "/tool?tab=shortlink" as const },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.title}
                  href={item.href}
                  className="group rounded-[24px] border border-border bg-white/80 p-5 transition-colors hover:border-foreground/20 hover:bg-white"
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-black/5 text-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-foreground-muted">{item.text}</p>
                </NavLink>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[t("steps.one"), t("steps.two"), t("steps.three")].map((step, index) => (
          <Card key={step} className="p-6">
            <p className="text-sm font-medium text-foreground-muted">0{index + 1}</p>
            <p className="mt-4 text-lg font-medium leading-8">{step}</p>
          </Card>
        ))}
      </section>

      <section id="faq" className="scroll-mt-24">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-4 text-center">
            <p className="text-sm font-medium text-foreground-muted">
              {tFaq("eyebrow")}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {tFaq("title")}
            </h2>
            <p className="text-lg leading-8 text-foreground-muted">
              {tFaq("description")}
            </p>
          </div>
          <AccordionFaq items={faqItems} />
        </div>
      </section>
    </div>
  );
}
