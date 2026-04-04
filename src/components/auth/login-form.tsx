"use client";

import { Mail, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type LoginFormProps = {
  locale: string;
  nextPath: string;
  isConfigured: boolean;
};

function sanitizeNextPath(locale: string, nextPath: string) {
  if (nextPath.startsWith("/") && !nextPath.startsWith("//")) {
    return nextPath;
  }

  return `/${locale}/tool/history`;
}

export function LoginForm({ locale, nextPath, isConfigured }: LoginFormProps) {
  const t = useTranslations("Login");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitting, setSubmitting] = useState(false);

  const redirectPath = useMemo(() => sanitizeNextPath(locale, nextPath), [locale, nextPath]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = createSupabaseBrowserClient();

    if (!supabase || !email.trim()) {
      setStatus("error");
      return;
    }

    setSubmitting(true);
    setStatus("idle");

    try {
      const emailRedirectTo = `${window.location.origin}/auth/confirm?next=${encodeURIComponent(redirectPath)}`;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo,
        },
      });

      if (error) {
        setStatus("error");
        return;
      }

      setStatus("success");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="max-w-xl p-6 sm:p-7">
      <div className="mb-6 space-y-2">
        <p className="text-sm font-medium text-foreground-muted">{t("eyebrow")}</p>
        <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
        <p className="text-sm leading-7 text-foreground-muted">{t("description")}</p>
      </div>

      {!isConfigured ? (
        <p className="text-sm leading-7 text-foreground-muted">{t("setupRequired")}</p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-foreground">{t("label")}</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-12 w-full rounded-2xl border border-border bg-white pl-11 pr-4 text-sm outline-none focus:border-foreground/20"
            />
          </div>
          <Button type="submit" disabled={submitting}>
            <Send className="mr-2 size-4" />
            {submitting ? t("sending") : t("submit")}
          </Button>
          {status === "success" ? <p className="text-sm text-emerald-700">{t("success")}</p> : null}
          {status === "error" ? <p className="text-sm text-red-600">{t("error")}</p> : null}
        </form>
      )}
    </Card>
  );
}
