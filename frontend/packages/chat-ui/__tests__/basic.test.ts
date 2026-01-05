/**
 * Basic Test to verify test setup
 */

import { describe, expect, it } from "bun:test";

describe("Basic Test", () => {
  it("should pass basic assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("should handle strings", () => {
    expect("hello").toBe("hello");
  });

  it("should handle arrays", () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
  });
});
