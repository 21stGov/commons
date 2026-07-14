// SPDX-License-Identifier: MIT

import { resolve } from "node:path";
import { loadCommonsConfig, resolveRegistry } from "../config.js";
import { EXIT, failure, failureFromError, success, type CliResult } from "../output.js";
import { fetchRegistryIndex } from "../registry/client.js";
import type { RegistryIndexEntry } from "../registry/schema.js";

export interface SearchOptions {
  cwd: string;
  term: string;
}

export interface SearchData {
  registry: string;
  term: string;
  results: RegistryIndexEntry[];
}

/** Does the entry match the term across name/title/description/useWhen? */
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

/**
 * Search the registry catalog ({registry}/index.json) with a
 * case-insensitive match over name, title, description, and useWhen.
 * An empty result list is still a success (exit 0).
 */
export async function runSearch(options: SearchOptions): Promise<CliResult<SearchData>> {
  const term = options.term.trim();
  if (term.length === 0) {
    return failure(EXIT.USER, "NO_TERM", 'No search term given. Try: "commons search date".');
  }

  let registry: string;
  try {
    registry = resolveRegistry(loadCommonsConfig(resolve(options.cwd)));
  } catch (error) {
    return failure(
      EXIT.USER,
      "INVALID_CONFIG",
      error instanceof Error ? error.message : String(error),
    );
  }

  try {
    const entries = await fetchRegistryIndex(registry);
    const results = entries.filter((entry) => matchesEntry(entry, term));
    return success({ registry, term, results });
  } catch (error) {
    return failureFromError(error);
  }
}

/** Human-mode result for stdout: a simple aligned table. */
export function formatSearch(data: SearchData): string {
  if (data.results.length === 0) {
    return `No components matching "${data.term}" in ${data.registry}.`;
  }

  const rows = data.results.map((entry) => ({
    name: entry.name,
    status: entry.status ?? "-",
    description: entry.description ?? entry.title ?? "",
  }));
  const nameWidth = Math.max("NAME".length, ...rows.map((row) => row.name.length));
  const statusWidth = Math.max("STATUS".length, ...rows.map((row) => row.status.length));

  const lines = [
    `${"NAME".padEnd(nameWidth)}  ${"STATUS".padEnd(statusWidth)}  DESCRIPTION`,
    ...rows.map(
      (row) => `${row.name.padEnd(nameWidth)}  ${row.status.padEnd(statusWidth)}  ${row.description}`,
    ),
  ];
  return lines.join("\n");
}
