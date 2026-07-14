// SPDX-License-Identifier: MIT

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { vi } from "vitest";

/** Registry base URL used by test fixtures. */
export const BASE = "https://registry.test/r";

const createdDirs: string[] = [];

/**
 * Create a temp project directory whose name contains a space and
 * Unicode characters (cross-platform path handling is part of the
 * contract under test).
 */
export function makeProject(options?: { config?: unknown; src?: boolean }): string {
  const dir = mkdtempSync(join(tmpdir(), "commons tëst "));
  createdDirs.push(dir);
  if (options?.src) {
    mkdirSync(join(dir, "src"), { recursive: true });
  }
  const config =
    options?.config === undefined
      ? {
          $schema: "https://commonsui.com/schema/commons.json",
          registry: BASE,
          paths: { ui: "src/components/ui", components: "src/components", lib: "src/lib" },
          theme: "light",
        }
      : options.config;
  if (config !== null) {
    writeFileSync(join(dir, "commons.json"), `${JSON.stringify(config, null, 2)}\n`, "utf8");
  }
  return dir;
}

/** Remove every directory created by {@link makeProject}. */
export function cleanupProjects(): void {
  for (const dir of createdDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/**
 * Stub global fetch with a static registry: items served at
 * `{BASE}/{name}.json` and an optional catalog at `{BASE}/index.json`.
 * Unknown URLs return 404.
 */
export function stubRegistry(items: Record<string, unknown>, index?: unknown): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn((input: string | URL | Request) => {
    const url = String(input);
    if (url === `${BASE}/index.json`) {
      return Promise.resolve(
        index === undefined ? new Response("not found", { status: 404 }) : jsonResponse(index),
      );
    }
    const match = url.startsWith(`${BASE}/`) && url.endsWith(".json");
    if (match) {
      const name = decodeURIComponent(url.slice(`${BASE}/`.length, -".json".length));
      const item = items[name];
      return Promise.resolve(
        item === undefined ? new Response("not found", { status: 404 }) : jsonResponse(item),
      );
    }
    return Promise.resolve(new Response("not found", { status: 404 }));
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
