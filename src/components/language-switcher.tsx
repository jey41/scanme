"use client";

import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useTransition } from "react";

import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

export function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-background-elevated p-1 text-sm">
      <span className="px-2 text-foreground-muted">
        <Languages className="size-4" />
      </span>
      {routing.locales.map((nextLocale) => {
        const active = nextLocale === locale;

        return (
          <button
            key={nextLocale}
            type="button"
            onClick={() => {
              startTransition(() => {
                router.replace(pathname, { locale: nextLocale });
              });
            }}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium uppercase",
              active ? "bg-foreground text-background" : "text-foreground-muted hover:text-foreground",
            )}
            disabled={isPending || active}
          >
            {nextLocale}
          </button>
        );
      })}
    </div>
  );
}
