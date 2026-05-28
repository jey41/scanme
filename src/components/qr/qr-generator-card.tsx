"use client";

import { Download, Link2, RefreshCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveQrHistoryEntry } from "@/lib/history/client";
import { downloadPng, downloadSvg, downloadZip } from "@/lib/qr/download-qr";
import { generateQrPngDataUrl, generateQrSvgMarkup } from "@/lib/qr/generate-qr";
import { validateUrl } from "@/lib/qr/validate-url";
import { generateFilenameFromUrl } from "@/lib/qr/qr-filename-helper";

type GenerateState = {
  pngDataUrl: string;
  svgMarkup: string;
  value: string;
  filename: string;
};

export function QrGeneratorCard() {
  const t = useTranslations("Tool.generate");
  const [input, setInput] = useState("");
  const [states, setStates] = useState<GenerateState[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validationMessage = useMemo(() => {
    if (!status) {
      return null;
    }

    return t(`errors.${status}`);
  }, [status, t]);

  async function handleGenerate() {
    const lines = input
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setStates([]);
      setStatus("empty");
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const validUrls: string[] = [];
      for (const line of lines) {
        const parsed = validateUrl(line);
        if (!parsed.valid) {
          setStates([]);
          setStatus("format");
          return;
        }
        validUrls.push(parsed.normalized);
      }

      const promises = validUrls.map(async (url) => {
        const [pngDataUrl, svgMarkup] = await Promise.all([
          generateQrPngDataUrl(url),
          generateQrSvgMarkup(url),
        ]);

        void saveQrHistoryEntry({
          action: "generated",
          content: url,
          payload: { source: "tool" },
        });

        return {
          pngDataUrl,
          svgMarkup,
          value: url,
          filename: generateFilenameFromUrl(url),
        };
      });

      const newStates = await Promise.all(promises);
      setStates(newStates);
    } catch {
      setStates([]);
      setStatus("unknown");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setInput("");
    setStates([]);
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
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="https://example.com&#10;https://example.org"
            className="min-h-32 resize-y rounded-2xl border border-border bg-white p-4 text-sm outline-none ring-0 placeholder:text-foreground-muted focus:border-foreground/20"
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

      <Card className="flex flex-col p-6 sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground-muted">{t("previewLabel")}</p>
            <h3 className="mt-1 text-xl font-semibold">{t("previewTitle")}</h3>
          </div>
          {states.length > 1 && (
            <Button
              onClick={() => downloadZip(states, "scanme-qrs.zip")}
            >
              <Download className="mr-2 size-4" />
              {t("actions.downloadAllZip")}
            </Button>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-5 rounded-[24px] border border-dashed border-border bg-white/80 p-6 text-center">
          {states.length > 0 ? (
            <div className="flex w-full flex-col gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {states.map((state, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-4 rounded-xl border border-border/50 bg-background-elevated p-4"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={state.pngDataUrl} alt={t("previewAlt")} className="size-40 rounded-xl" />
                    <p
                      className="max-w-[160px] truncate text-xs leading-6 text-foreground-muted"
                      title={state.value}
                    >
                      {state.value}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button
                        variant="secondary"
                        className="h-9 px-3 text-xs"
                        onClick={() => {
                          downloadPng(state.pngDataUrl, `${state.filename}.png`);
                          void saveQrHistoryEntry({
                            action: "downloaded",
                            content: state.value,
                            payload: { format: "png" },
                          });
                        }}
                      >
                        <Download className="mr-2 size-3" />
                        PNG
                      </Button>
                      <Button
                        variant="secondary"
                        className="h-9 px-3 text-xs"
                        onClick={() => {
                          downloadSvg(state.svgMarkup, `${state.filename}.svg`);
                          void saveQrHistoryEntry({
                            action: "downloaded",
                            content: state.value,
                            payload: { format: "svg" },
                          });
                        }}
                      >
                        <Download className="mr-2 size-3" />
                        SVG
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
