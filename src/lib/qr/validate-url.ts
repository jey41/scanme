export function validateUrl(value: string) {
  if (!value.trim()) {
    return { valid: false, normalized: "", error: "empty" as const };
  }

  try {
    const url = new URL(value.trim());
    const validProtocol = url.protocol === "http:" || url.protocol === "https:";

    if (!validProtocol) {
      return { valid: false, normalized: "", error: "protocol" as const };
    }

    return { valid: true, normalized: url.toString(), error: null };
  } catch {
    return { valid: false, normalized: "", error: "format" as const };
  }
}
