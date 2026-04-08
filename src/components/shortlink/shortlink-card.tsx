"use client";

import { Check, Copy, ExternalLink, Link2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ShortlinkResult = {
  slug: string;
  shortUrl: string;
};

export function ShortlinkCard() {
  const t = useTranslations("Tool.shortlink");
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [result, setResult] = useState<ShortlinkResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    if (!url.trim()) {
      setError(t("errors.empty"));
      return;
    }

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/short-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          slug: customSlug.trim() || undefined,
        }),
      });

      if (response.status === 401) {
        setError(t("errors.authRequired"));
        return;
      }

      if (response.status === 409) {
        setError(t("errors.slugTaken"));
        return;
      }

      if (response.status === 503) {
        setError(t("errors.setupRequired"));
        return;
      }

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        setError(data.error ?? t("errors.unknown"));
        return;
      }

      const data = await response.json() as ShortlinkResult;
      setResult(data);
    } catch {
      setError(t("errors.unknown"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopy() {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(t("errors.copy"));
    }
  }

  function handleReset() {
    setUrl("");
    setCustomSlug("");
    setResult(null);
    setError(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="p-6 sm:p-7">
        <div className="mb-6 space-y-2">
          <p className="text-sm font-medium text-foreground-muted">{t("eyebrow")}</p>
          <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
          <p className="max-w-xl text-sm leading-7 text-foreground-muted">{t("description")}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">{t("labelUrl")}</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very/long/path"
              className="h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm outline-none ring-0 placeholder:text-foreground-muted focus:border-foreground/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t("labelSlug")}
              <span className="ml-1 font-normal text-foreground-muted">{t("slugOptional")}</span>
            </label>
            <div className="flex items-center gap-0">
              <span className="flex h-12 items-center rounded-l-2xl border border-r-0 border-border bg-background-elevated px-3 text-sm text-foreground-muted">
                /s/
              </span>
              <input
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="my-custom-link"
                className="h-12 flex-1 rounded-r-2xl border border-border bg-white px-4 text-sm outline-none ring-0 placeholder:text-foreground-muted focus:border-foreground/20"
              />
            </div>
            <p className="mt-1 text-xs text-foreground-muted">{t("slugHint")}</p>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={handleCreate} disabled={submitting}>
            <span className="inline-flex items-center">
              {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Link2 className="mr-2 size-4" />}
              {submitting ? t("creating") : t("actions.create")}
            </span>
          </Button>
          <Button variant="secondary" onClick={handleReset}>
            {t("actions.reset")}
          </Button>
        </div>
      </Card>

      <Card className="p-6 sm:p-7">
        <div className="mb-6">
          <p className="text-sm font-medium text-foreground-muted">{t("resultLabel")}</p>
          <h3 className="mt-1 text-xl font-semibold">{t("resultTitle")}</h3>
        </div>

        <div className="flex min-h-80 flex-col items-center justify-center gap-5 rounded-[24px] border border-dashed border-border bg-white/80 p-6 text-center">
          {result ? (
            <div className="flex flex-col items-center gap-5">
              <div className="flex size-16 items-center justify-center rounded-full bg-green-50 text-green-600">
                <Check className="size-6" />
              </div>
              <div className="space-y-3 text-center">
                <p className="text-base font-medium">{t("resultSuccess")}</p>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background-elevated px-4 py-3">
                  <span className="text-sm font-medium break-all">{result.shortUrl}</span>
                </div>
                <p className="max-w-sm break-all text-xs leading-5 text-foreground-muted">
                  → {url}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={handleCopy}>
                  <span className="inline-flex items-center">
                    {copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
                    {copied ? t("actions.copied") : t("actions.copy")}
                  </span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.open(result.shortUrl, "_blank")}
                >
                  <ExternalLink className="mr-2 size-4" />
                  {t("actions.open")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5">
              <div className="flex size-16 items-center justify-center rounded-full bg-black/5 text-foreground-muted">
                <Link2 className="size-6" />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-base font-medium">{t("emptyTitle")}</p>
                <p className="text-sm leading-6 text-foreground-muted">{t("emptyDescription")}</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
