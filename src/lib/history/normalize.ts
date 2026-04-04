import { qrHistoryActions, type QrHistoryAction, type QrHistoryEntry } from "@/lib/history/types";

function isQrHistoryAction(value: unknown): value is QrHistoryAction {
  return typeof value === "string" && qrHistoryActions.includes(value as QrHistoryAction);
}

function isRecord(value: unknown): value is Record<string, string | number | boolean | null> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(
    (item) =>
      item === null ||
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean",
  );
}

export function normalizeQrHistoryEntries(rows: unknown[]): QrHistoryEntry[] {
  return rows.flatMap((row) => {
    if (!row || typeof row !== "object") {
      return [];
    }

    const candidate = row as Record<string, unknown>;

    if (
      typeof candidate.id !== "string" ||
      !isQrHistoryAction(candidate.action) ||
      typeof candidate.content !== "string" ||
      typeof candidate.created_at !== "string"
    ) {
      return [];
    }

    return [
      {
        id: candidate.id,
        action: candidate.action,
        content: candidate.content,
        payload: isRecord(candidate.payload) ? candidate.payload : null,
        createdAt: candidate.created_at,
      },
    ];
  });
}
