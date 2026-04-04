import { describe, expect, it } from "vitest";

import { validateUrl } from "@/lib/qr/validate-url";

describe("validateUrl", () => {
  it("accepts valid https links", () => {
    expect(validateUrl("https://example.com")).toEqual({
      valid: true,
      normalized: "https://example.com/",
      error: null,
    });
  });

  it("rejects non-http protocols", () => {
    expect(validateUrl("ftp://example.com")).toEqual({
      valid: false,
      normalized: "",
      error: "protocol",
    });
  });

  it("rejects malformed values", () => {
    expect(validateUrl("not a url")).toEqual({
      valid: false,
      normalized: "",
      error: "format",
    });
  });
});
