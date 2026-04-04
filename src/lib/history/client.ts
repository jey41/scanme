import type { QrHistoryEntryInput } from "@/lib/history/types";

export async function saveQrHistoryEntry(entry: QrHistoryEntryInput) {
  try {
    const response = await fetch("/api/qr-history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });

    if (!response.ok && response.status !== 401 && response.status !== 503) {
      throw new Error(`History request failed with ${response.status}`);
    }
  } catch {
    return;
  }
}
