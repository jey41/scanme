"use client";

import { ChevronRight, Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Link as NavLink } from "@/i18n/navigation";

export function ToolBreadcrumb() {
  const t = useTranslations("Tool.tabs");
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("generate");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["generate", "decode", "camera", "shortlink"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <nav className="flex items-center space-x-2 text-sm font-medium text-foreground-muted">
      <NavLink
        href="/"
        className="flex items-center transition-colors hover:text-foreground"
      >
        <Home className="mr-1.5 size-4" />
        Home
      </NavLink>
      <ChevronRight className="size-4 opacity-50" />
      <span className="flex items-center text-foreground">
        Tool
      </span>
      <ChevronRight className="size-4 opacity-50" />
      <span className="flex items-center text-foreground">
        {t(activeTab as any)}
      </span>
    </nav>
  );
}
