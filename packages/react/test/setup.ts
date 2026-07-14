// SPDX-License-Identifier: MIT

// Vitest setup: registers @testing-library/jest-dom matchers and a local
// axe-core matcher (`toHaveNoViolations`). We use axe-core directly with a
// tiny matcher instead of vitest-axe, whose last stable release predates
// modern Vitest and is effectively unmaintained.

import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, expect } from "vitest";

// Vitest runs without injected globals, so @testing-library/react cannot
// register its automatic cleanup. Register it explicitly so renders never
// leak between tests.
afterEach(() => {
  cleanup();
});

/**
 * Run axe-core against a rendered container. The color-contrast rule is
 * disabled because jsdom does not compute layout or resolve real colors,
 * making that rule unreliable outside a real browser. Contrast is enforced
 * at the token level and in browser-based checks instead.
 */
export async function axeCheck(
  container: Element,
  options: axe.RunOptions = {},
): Promise<axe.AxeResults> {
  return axe.run(container, {
    rules: { "color-contrast": { enabled: false } },
    ...options,
  });
}

function formatViolations(violations: axe.Result[]): string {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `    ${node.html}\n      ${node.failureSummary ?? ""}`)
        .join("\n");
      return `  ${violation.id} (impact: ${violation.impact ?? "unknown"}): ${violation.help}\n  ${violation.helpUrl}\n${nodes}`;
    })
    .join("\n\n");
}

expect.extend({
  toHaveNoViolations(results: axe.AxeResults) {
    if (!results || !Array.isArray(results.violations)) {
      throw new TypeError(
        "toHaveNoViolations expects axe results — pass the resolved value of axeCheck(container).",
      );
    }
    const { violations } = results;
    return {
      pass: violations.length === 0,
      message: () =>
        violations.length === 0
          ? "Expected axe violations, but none were found."
          : `Expected no axe violations, found ${violations.length}:\n\n${formatViolations(violations)}`,
    };
  },
});

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Matchers<T = any> {
    toHaveNoViolations(): T;
  }
}
