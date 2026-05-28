"use client";

import { Clipboard, Copy, ExternalLink, ImageUp, LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveQrHistoryEntry } from "@/lib/history/client";
import { decodeQrFromFile } from "@/lib/qr/decode-upload";
import { validateUrl } from "@/lib/qr/validate-url";

/** Extract the first image File from a DataTransfer, or null. */
function extractImageFile(dt: DataTransfer): File | null {
  // Pasted screenshots appear in dt.items (not dt.files) on most browsers.
  if (dt.items) {
    for (const item of Array.from(dt.items)) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        return item.getAsFile();
      }
    }
  }
  // Fallback: drag-and-drop populates dt.files directly.
  for (const file of Array.from(dt.files)) {
    if (file.type.startsWith("image/")) return file;
  }
  return null;
}

export function QrUploadDecodeCard() {
  const t = useTranslations("Tool.decode");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Counter ref prevents flicker caused by dragenter/dragleave firing on
  // child elements inside the drop zone.
  const dragCounter = useRef(0);

  const handleFile = useCallback(
    async (file: File | null) => {
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
    },
    [t],
  );

  // ---------------------------------------------------------------------------
  // Global paste listener — Ctrl+V / Cmd+V with an image in the clipboard
  // ---------------------------------------------------------------------------
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      if (!e.clipboardData) return;
      const file = extractImageFile(e.clipboardData);
      if (file) {
        e.preventDefault();
        void handleFile(file);
      }
    }

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile]);

  // ---------------------------------------------------------------------------
  // Drag & drop handlers
  // ---------------------------------------------------------------------------
  function onDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (dragCounter.current === 1) setIsDragging(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragging(false);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault(); // required to allow drop
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);

    const file = extractImageFile(e.dataTransfer);
    if (file) {
      void handleFile(file);
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

        {/* Drop zone — also acts as the file-input label */}
        <label
          className={[
            "flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4",
            "rounded-[28px] border-2 border-dashed p-8 text-center",
            "transition-all duration-200 ease-out",
            isDragging
              ? "scale-[1.02] border-primary bg-primary/5 shadow-lg"
              : "border-border bg-white/80",
          ].join(" ")}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-black/5 text-foreground-muted">
            {loading ? <LoaderCircle className="size-6 animate-spin" /> : <ImageUp className="size-6" />}
          </span>
          <div className="pointer-events-none space-y-2">
            <p className="text-base font-medium">{loading ? t("loading") : t("uploadTitle")}</p>
            <p className="text-sm leading-6 text-foreground-muted">{t("uploadDescription")}</p>
          </div>
          {/* Paste hint */}
          <span className="pointer-events-none mt-1 inline-flex items-center gap-1.5 text-xs text-foreground-muted/70">
            <Clipboard className="size-3.5" />
            {t("pasteHint")}
          </span>
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
