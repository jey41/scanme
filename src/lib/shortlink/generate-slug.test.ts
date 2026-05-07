import { describe, expect, it } from "vitest";

import { generateSlug } from "@/lib/shortlink/generate-slug";

describe("generateSlug", () => {
  it("returns a string with default length of 6", () => {
    const slug = generateSlug();
    expect(slug).toHaveLength(6);
  });

  it("returns a string with custom length", () => {
    expect(generateSlug(3)).toHaveLength(3);
    expect(generateSlug(10)).toHaveLength(10);
    expect(generateSlug(1)).toHaveLength(1);
  });

  it("only contains lowercase letters and digits", () => {
    // Run multiple times to increase confidence
    for (let i = 0; i < 50; i++) {
      const slug = generateSlug(12);
      expect(slug).toMatch(/^[a-z0-9]+$/);
    }
  });

  it("produces different values on consecutive calls (probabilistic)", () => {
    const results = new Set<string>();

    for (let i = 0; i < 20; i++) {
      results.add(generateSlug());
    }

    // With 36^6 ≈ 2.2 billion possibilities, 20 calls should be unique
    expect(results.size).toBe(20);
  });
});
