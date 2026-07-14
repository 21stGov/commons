// SPDX-License-Identifier: MIT

/**
 * Workers-safe public surface of the Commons registry contract.
 *
 * Everything exported here is free of Node built-ins and free of side effects
 * at import time, so it runs in any JS runtime — the Node CLI, a Cloudflare
 * Worker (the hosted MCP server, apps/mcp-server), or the browser. This is the
 * `@21stgov/commons/registry` entry point.
 *
 * Do NOT import Node-only modules (node:fs, node:path) or anything that does
 * load-time I/O (e.g. CLI_VERSION reads package.json) into this file — that is
 * exactly what would break a Worker consumer.
 */

export * from "./client.js";
export * from "./schema.js";
export { resolveItems } from "./resolve.js";

import type { RegistryIndexEntry } from "./schema.js";

/** Default public Commons registry base URL. */
export const DEFAULT_REGISTRY = "https://commonsui.com/r";

/**
 * The five global-CSS import lines Commons requires, in their required order.
 * Home of the constant; commands/init.ts re-exports it.
 */
export const CSS_IMPORT_LINES: readonly string[] = [
  '@import "@21stgov/commons-fonts/index.css";',
  '@import "@21stgov/commons-tokens/index.css";',
  '@import "@21stgov/commons-core/index.css";',
  '@import "tailwindcss";',
  '@import "@21stgov/commons-tokens/tailwind.css";',
];

/** tsconfig path alias Commons components expect under compilerOptions.paths. */
export const TSCONFIG_ALIAS = '"@/*": ["./src/*"]';

/**
 * Case-insensitive catalog match over name, title, description, and useWhen —
 * the single matcher behind both `commons search` and the MCP search tool, so
 * the two can never diverge. An empty result is a valid "no match", not an error.
 */
export function matchesEntry(entry: RegistryIndexEntry, term: string): boolean {
  const needle = term.toLowerCase();
  const haystacks = [
    entry.name,
    entry.title ?? "",
    entry.description ?? "",
    ...(entry.useWhen ?? []),
  ];
  return haystacks.some((text) => text.toLowerCase().includes(needle));
}
