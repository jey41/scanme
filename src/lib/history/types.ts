export const qrHistoryActions = ["generated", "decoded", "scanned", "downloaded"] as const;

export type QrHistoryAction = (typeof qrHistoryActions)[number];

export type QrHistoryEntryInput = {
  action: QrHistoryAction;
  content: string;
  payload?: Record<string, string | number | boolean | null>;
};

export type QrHistoryEntry = {
  id: string;
  action: QrHistoryAction;
  content: string;
  payload: Record<string, string | number | boolean | null> | null;
  createdAt: string;
};
