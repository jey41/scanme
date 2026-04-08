const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 32;

export type SlugValidation =
  | { valid: true; slug: string; error: null }
  | { valid: false; slug: ""; error: "empty" | "tooShort" | "tooLong" | "format" };

export function validateSlug(value: string): SlugValidation {
  const trimmed = value.trim().toLowerCase();

  if (!trimmed) {
    return { valid: false, slug: "", error: "empty" };
  }

  if (trimmed.length < MIN_LENGTH) {
    return { valid: false, slug: "", error: "tooShort" };
  }

  if (trimmed.length > MAX_LENGTH) {
    return { valid: false, slug: "", error: "tooLong" };
  }

  if (!SLUG_PATTERN.test(trimmed)) {
    return { valid: false, slug: "", error: "format" };
  }

  return { valid: true, slug: trimmed, error: null };
}
