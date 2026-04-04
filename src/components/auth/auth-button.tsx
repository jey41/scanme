"use client";

import { LogIn, LogOut, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { Link, useRouter } from "@/i18n/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

type AuthButtonProps = {
  locale: string;
  userEmail: string | null;
  isConfigured: boolean;
};

export function AuthButton({ locale, userEmail, isConfigured }: AuthButtonProps) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError(t("errors.signOut"));
      return;
    }

    startTransition(() => {
      router.replace("/", { locale });
      router.refresh();
    });
  }

  if (!isConfigured) {
    return (
      <div className="hidden rounded-full border border-border bg-background-elevated px-4 py-2 text-xs text-foreground-muted lg:block">
        {t("setupRequired")}
      </div>
    );
  }

  if (!userEmail) {
    return (
      <Link
        href={{ pathname: "/login", query: { next: `/${locale}/tool/history` } }}
        className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background-elevated px-4 text-sm font-medium text-foreground hover:bg-white"
      >
        <LogIn className="mr-2 size-4" />
        {t("signIn")}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden items-center gap-2 rounded-full border border-border bg-background-elevated px-4 py-2 text-sm text-foreground-muted xl:inline-flex">
        <UserRound className="size-4" />
        <span className="max-w-44 truncate">{userEmail}</span>
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isPending}
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-full border border-border bg-background-elevated px-4 text-sm font-medium text-foreground hover:bg-white",
          isPending && "opacity-60",
        )}
      >
        <LogOut className="mr-2 size-4" />
        {t("signOut")}
      </button>
      {error ? <span className="hidden text-xs text-red-600 md:inline">{error}</span> : null}
    </div>
  );
}
