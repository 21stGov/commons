// SPDX-License-Identifier: MIT

/**
 * React Server Components compatibility gate.
 *
 * Component files ship verbatim through the registry into consumer projects —
 * most commonly Next.js App Router, where every module is a Server Component
 * unless it declares `'use client'`. A component that references client-only
 * React APIs (hooks, createContext) without the directive crashes the
 * consumer's build at import time ("createContext is not a function"). This
 * gate fails the suite if any component source uses a client-only API without
 * declaring the boundary, so the bug class can't ship again.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

// import.meta.dirname resolves to packages/react/test regardless of cwd.
const componentsDir = join(import.meta.dirname, "..", "src", "components");

/**
 * APIs that are unavailable (or throw) when a module is evaluated as a React
 * Server Component. `useId` is technically RSC-safe but always appears here
 * alongside interactivity, so including it only errs toward the safe side.
 */
const CLIENT_ONLY_API =
  /\bcreateContext\s*\(|\buse(State|Effect|LayoutEffect|Ref|Reducer|Context|Callback|Memo|Id|SyncExternalStore|Transition|ImperativeHandle|DeferredValue)\s*\(/;

/** A `'use client'` (or `"use client"`) directive before any statement. */
function declaresUseClient(source: string): boolean {
  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("//")) continue;
    return trimmed === "'use client'" || trimmed === '"use client"';
  }
  return false;
}

function componentSources(): string[] {
  const files: string[] = [];
  for (const dir of readdirSync(componentsDir)) {
    const dirPath = join(componentsDir, dir);
    if (!statSync(dirPath).isDirectory()) continue;
    for (const file of readdirSync(dirPath)) {
      if (!/\.tsx?$/.test(file) || /\.test\.tsx?$/.test(file)) continue;
      files.push(join(dirPath, file));
    }
  }
  return files.sort();
}

describe("use client coverage", () => {
  it("every component source using client-only React APIs declares 'use client'", () => {
    const missing: string[] = [];
    for (const file of componentSources()) {
      const source = readFileSync(file, "utf8");
      if (CLIENT_ONLY_API.test(source) && !declaresUseClient(source)) {
        missing.push(file.slice(file.indexOf("components")));
      }
    }
    expect(
      missing,
      `These component sources use client-only React APIs but do not declare 'use client', ` +
        `so they crash React Server Components consumers (Next.js App Router) at import time. ` +
        `Add the directive after the license header:\n  ${missing.join("\n  ")}`,
    ).toEqual([]);
  });
});
