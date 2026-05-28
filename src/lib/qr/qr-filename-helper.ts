/**
 * Converts a URL into a clean, safe filename.
 * Example: "https://form.hisyam.com" -> "form-hisyam-com-qr"
 */
export function generateFilenameFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Combine hostname and pathname
    const base = `${parsed.hostname}${parsed.pathname}`;
    
    const clean = base
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-") // Replace non-alphanumeric with hyphen
      .replace(/-+/g, "-") // Remove consecutive hyphens
      .replace(/^-|-$/g, ""); // Trim hyphens from start/end

    // Default name if it ends up empty
    if (!clean) {
      return "scanme-qr";
    }

    return `${clean}-qr`;
  } catch {
    // Fallback if URL parsing fails (shouldn't happen since we validate first)
    return "scanme-qr";
  }
}
