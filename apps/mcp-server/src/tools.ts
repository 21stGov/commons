// SPDX-License-Identifier: MIT

/**
 * Business logic for the hosted MCP tools, as pure async functions over the
 * shared registry core. Kept separate from the MCP/transport wiring in
 * index.ts so it is unit-testable in plain Node (no Workers runtime, no
 * Durable Object) — see test/tools.test.ts.
 *
 * Each function fetches from the given registry base URL and returns the tool
 * result payload, or throws (the caller maps thrown registry errors to the
 * MCP error taxonomy). No function writes anything.
 */

import {
  CSS_IMPORT_LINES,
  fetchRegistryIndex,
  fetchRegistryItem,
  matchesEntry,
  resolveItems,
  TSCONFIG_ALIAS,
  type RegistryIndexEntry,
  type RegistryItem,
} from "@21stgov/commons/registry";

/** Version stamped on every successful tool result. */
export const RESULT_SCHEMA_VERSION = "1";

export const ADD_COMMAND_PREFIX = "npx @21stgov/commons add";
export const INIT_COMMAND = "npx @21stgov/commons init";

/** Project a (loose, forward-compatible) catalog entry onto the search shape. */
function toSearchResult(entry: RegistryIndexEntry) {
  return {
    name: entry.name,
    title: entry.title,
    description: entry.description,
    status: entry.status,
    useWhen: entry.useWhen,
  };
}

export async function searchComponents(registry: string, query: string, limit: number) {
  const entries = await fetchRegistryIndex(registry);
  const results = entries
    .filter((entry) => matchesEntry(entry, query))
    .slice(0, limit)
    .map(toSearchResult);
  return { schemaVersion: RESULT_SCHEMA_VERSION, registry, results };
}

export async function getComponent(registry: string, name: string) {
  const item = await fetchRegistryItem(registry, name);
  return { schemaVersion: RESULT_SCHEMA_VERSION, registry, item };
}

export async function planInstall(registry: string, names: string[]) {
  const items: RegistryItem[] = await resolveItems(registry, names);
  const files = items.flatMap((item) =>
    (item.files ?? []).map((file) => ({ path: file.path, type: file.type, item: item.name })),
  );
  const dependencies = [...new Set(items.flatMap((item) => item.dependencies ?? []))].sort();
  const requested = [...new Set(names)];
  return {
    schemaVersion: RESULT_SCHEMA_VERSION,
    registry,
    items: items.map((item) => item.name),
    files,
    dependencies,
    command: `${ADD_COMMAND_PREFIX} ${requested.join(" ")}`,
    note:
      "Final file locations depend on the project's commons.json path mapping. Run the command " +
      `above with the local CLI to write files; run "${INIT_COMMAND}" first if the project has no ` +
      "commons.json.",
  };
}

export function getSetup(registry: string) {
  return {
    schemaVersion: RESULT_SCHEMA_VERSION,
    registry,
    registryUrl: registry,
    cssImports: [...CSS_IMPORT_LINES],
    tsconfigAlias: TSCONFIG_ALIAS,
    initCommand: INIT_COMMAND,
  };
}
