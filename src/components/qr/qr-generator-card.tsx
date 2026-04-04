"use client";

import { Download, Link2, RefreshCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { downloadPng, downloadSvg } from "@/lib/qr/download-qr";
import { generateQrPngDataUrl, generateQrSvgMarkup } from "@/lib/qr/generate-qr";
import { validateUrl } from "@/lib/qr/validate-url";

type GenerateState = {
  pngDataUrl: string;
  svgMarkup: string;
  value: string;
};

export function QrGeneratorCard() {
  const t = useTranslations("Tool.generate");
  const [input, setInput] = useState("");
  const [state, setState] = useState<GenerateState | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validationMessage = useMemo(() => {
    if (!status) {
      return null;
    }

    return t(`errors.${status}`);
  }, [status, t]);

  async function handleGenerate() {
    const parsed = validateUrl(input);

    if (!parsed.valid) {
      setState(null);
      setStatus(parsed.error);
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const [pngDataUrl, svgMarkup] = await Promise.all([
        generateQrPngDataUrl(parsed.normalized),
        generateQrSvgMarkup(parsed.normalized),
      ]);

      setState({ pngDataUrl, svgMarkup, value: parsed.normalized });
    } catch {
      setState(null);
      setStatus("unknown");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setInput("");
    setState(null);
    setStatus(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="p-6 sm:p-7">
        <div className="mb-6 space-y-2">
          <p className="text-sm font-medium text-foreground-muted">{t("eyebrow")}</p>
          <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
          <p className="max-w-xl text-sm leading-7 text-foreground-muted">{t("description")}</p>
        </div>

        <label className="mb-3 block text-sm font-medium text-foreground">{t("label")}</label>
        <div className="flex flex-col gap-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="https://example.com"
            className="h-12 rounded-2xl border border-border bg-white px-4 text-sm outline-none ring-0 placeholder:text-foreground-muted focus:border-foreground/20"
          />
          {validationMessage ? <p className="text-sm text-red-600">{validationMessage}</p> : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={handleGenerate} disabled={submitting}>
            <Link2 className="mr-2 size-4" />
            {submitting ? t("generating") : t("actions.generate")}
          </Button>
          <Button variant="secondary" onClick={handleReset}>
            <RefreshCcw className="mr-2 size-4" />
            {t("actions.reset")}
          </Button>
        </div>
      </Card>

      <Card className="p-6 sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground-muted">{t("previewLabel")}</p>
            <h3 className="mt-1 text-xl font-semibold">{t("previewTitle")}</h3>
          </div>
        </div>

        <div className="flex min-h-80 flex-col items-center justify-center gap-5 rounded-[24px] border border-dashed border-border bg-white/80 p-6 text-center">
          {state ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={state.pngDataUrl} alt={t("previewAlt")} className="size-52 rounded-2xl" />
              <p className="max-w-sm break-all text-sm leading-6 text-foreground-muted">{state.value}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={() => downloadPng(state.pngDataUrl, "scanme-qr.png")}>
                  <Download className="mr-2 size-4" />
                  {t("actions.downloadPng")}
                </Button>
                <Button variant="secondary" onClick={() => downloadSvg(state.svgMarkup, "scanme-qr.svg")}>
                  <Download className="mr-2 size-4" />
                  {t("actions.downloadSvg")}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex size-16 items-center justify-center rounded-full bg-black/5 text-foreground-muted">
                <Link2 className="size-6" />
              </div>
              <div className="space-y-2">
                <p className="text-base font-medium">{t("emptyTitle")}</p>
                <p className="text-sm leading-6 text-foreground-muted">{t("emptyDescription")}</p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
