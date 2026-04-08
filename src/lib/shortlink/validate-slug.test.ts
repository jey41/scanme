import { describe, expect, it } from "vitest";

import { validateSlug } from "@/lib/shortlink/validate-slug";

describe("validateSlug", () => {
  it("accepts valid slugs", () => {
    expect(validateSlug("my-link")).toEqual({
      valid: true,
      slug: "my-link",
      error: null,
    });
  });

  it("accepts numeric slugs", () => {
    expect(validateSlug("abc123")).toEqual({
      valid: true,
      slug: "abc123",
      error: null,
    });
  });

  it("normalises to lowercase", () => {
    expect(validateSlug("My-Link")).toEqual({
      valid: true,
      slug: "my-link",
      error: null,
    });
  });

  it("rejects empty input", () => {
    expect(validateSlug("")).toEqual({
      valid: false,
      slug: "",
      error: "empty",
    });
  });

  it("rejects slugs shorter than 3 characters", () => {
    expect(validateSlug("ab")).toEqual({
      valid: false,
      slug: "",
      error: "tooShort",
    });
  });

  it("rejects slugs longer than 32 characters", () => {
    expect(validateSlug("a".repeat(33))).toEqual({
      valid: false,
      slug: "",
      error: "tooLong",
    });
  });

  it("rejects slugs with special characters", () => {
    expect(validateSlug("my_link!")).toEqual({
      valid: false,
      slug: "",
      error: "format",
    });
  });

  it("rejects slugs starting with hyphen", () => {
    expect(validateSlug("-my-link")).toEqual({
      valid: false,
      slug: "",
      error: "format",
    });
  });
});
