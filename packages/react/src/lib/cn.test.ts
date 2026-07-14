// SPDX-License-Identifier: MIT

import { describe, expect, it } from "vitest";

import { cn } from "./cn.js";

describe("cn", () => {
  it("joins multiple class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters out falsy values", () => {
    expect(cn("foo", false, null, undefined, 0, "", "bar")).toBe("foo bar");
  });

  it("supports conditional object and array syntax", () => {
    expect(cn("base", { active: true, disabled: false }, ["extra"])).toBe(
      "base active extra",
    );
  });

  it("resolves conflicting Tailwind utilities (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("keeps non-conflicting utilities while merging conflicts", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("merges conditional overrides passed by callers", () => {
    expect(cn("bg-red-500", { "bg-blue-500": true })).toBe("bg-blue-500");
  });
});
