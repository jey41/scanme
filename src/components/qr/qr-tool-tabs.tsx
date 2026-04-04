"use client";

import { History, QrCode, ScanLine } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { QrCameraScanCard } from "@/components/qr/qr-camera-scan-card";
import { QrGeneratorCard } from "@/components/qr/qr-generator-card";
import { QrUploadDecodeCard } from "@/components/qr/qr-upload-decode-card";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

type ToolTab = "generate" | "decode" | "camera";

export function QrToolTabs() {
  const t = useTranslations("Tool.tabs");
  const [activeTab, setActiveTab] = useState<ToolTab>("generate");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap gap-2 rounded-full border border-border bg-background-elevated p-2">
          {[
            { key: "generate" as const, icon: QrCode, label: t("generate") },
            { key: "decode" as const, icon: ScanLine, label: t("decode") },
            { key: "camera" as const, icon: ScanLine, label: t("camera") },
          ].map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium",
                activeTab === tab.key
                  ? "bg-foreground text-background"
                  : "text-foreground-muted hover:text-foreground",
              )}
            >
              <Icon className="mr-2 size-4" />
              {tab.label}
            </button>
          );
          })}
        </div>

        <Link
          href="/tool/history"
          className="inline-flex items-center rounded-full border border-border bg-background-elevated px-4 py-2 text-sm font-medium text-foreground-muted hover:text-foreground"
        >
          <History className="mr-2 size-4" />
          {t("history")}
        </Link>
      </div>

      {activeTab === "generate" ? <QrGeneratorCard /> : null}
      {activeTab === "decode" ? <QrUploadDecodeCard /> : null}
      {activeTab === "camera" ? <QrCameraScanCard /> : null}
    </div>
  );
}
