"use client";

import { Copy, ExternalLink, ImageUp, LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveQrHistoryEntry } from "@/lib/history/client";
import { decodeQrFromFile } from "@/lib/qr/decode-upload";
import { validateUrl } from "@/lib/qr/validate-url";

export function QrUploadDecodeCard() {
  const t = useTranslations("Tool.decode");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File | null) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setResult(null);
      setError(t("errors.fileType"));
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const text = await decodeQrFromFile(file);
      setResult(text);
      void saveQrHistoryEntry({
        action: "decoded",
        content: text,
        payload: { source: "upload" },
      });
    } catch {
      setResult(null);
      setError(t("errors.unreadable"));
    } finally {
      setLoading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function handleCopy() {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result);
    } catch {
      setError(t("errors.copy"));
    }
  }

  const parsed = result ? validateUrl(result) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Card className="p-6 sm:p-7">
        <div className="mb-6 space-y-2">
          <p className="text-sm font-medium text-foreground-muted">{t("eyebrow")}</p>
          <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
          <p className="max-w-xl text-sm leading-7 text-foreground-muted">{t("description")}</p>
        </div>

        <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-[28px] border border-dashed border-border bg-white/80 p-8 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-black/5 text-foreground-muted">
            {loading ? <LoaderCircle className="size-6 animate-spin" /> : <ImageUp className="size-6" />}
          </span>
          <div className="space-y-2">
            <p className="text-base font-medium">{loading ? t("loading") : t("uploadTitle")}</p>
            <p className="text-sm leading-6 text-foreground-muted">{t("uploadDescription")}</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          />
        </label>
      </Card>

      <Card className="p-6 sm:p-7">
        <div className="mb-6 space-y-1">
          <p className="text-sm font-medium text-foreground-muted">{t("resultLabel")}</p>
          <h3 className="text-xl font-semibold">{t("resultTitle")}</h3>
        </div>

        <div className="flex min-h-64 flex-col justify-center rounded-[24px] border border-border bg-white/80 p-6">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          {result ? (
            <div className="space-y-5">
              <p className="break-all text-sm leading-7 text-foreground">{result}</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={handleCopy}>
                  <Copy className="mr-2 size-4" />
                  {t("actions.copy")}
                </Button>
                <Button
                  onClick={() => window.open(result, "_blank", "noopener,noreferrer")}
                  disabled={!parsed?.valid}
                >
                  <ExternalLink className="mr-2 size-4" />
                  {t("actions.open")}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-7 text-foreground-muted">{t("empty")}</p>
          )}
        </div>
      </Card>
    </div>
  );
}
