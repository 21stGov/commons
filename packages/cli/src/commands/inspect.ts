// SPDX-License-Identifier: MIT

import { resolve } from "node:path";
import { loadCommonsConfig, resolveRegistry } from "../config.js";
import { EXIT, failure, failureFromError, success, type CliResult } from "../output.js";
import { fetchRegistryItem } from "../registry/client.js";
import type { RegistryItem } from "../registry/schema.js";

export interface InspectOptions {
  cwd: string;
  name: string;
}

/**
 * Fetch and validate a single registry item. In `--json` mode the data is
 * the full validated item (including forward-compatible unknown fields).
 */
export async function runInspect(options: InspectOptions): Promise<CliResult<RegistryItem>> {
  const name = options.name.trim();
  if (name.length === 0) {
    return failure(EXIT.USER, "NO_NAME", 'No component name given. Try: "commons inspect button".');
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
    return success(await fetchRegistryItem(registry, name));
  } catch (error) {
    return failureFromError(error);
  }
}

/** Human-mode result for stdout. */
export function formatInspect(item: RegistryItem): string {
  const lines: string[] = [];
  const title = item.title ? `${item.title} (${item.name})` : item.name;
  lines.push(`${title} [${item.type}]`);
  if (item.status || item.version) {
    const meta = [
      item.status ? `status: ${item.status}` : null,
      item.version ? `version: ${item.version}` : null,
    ].filter((part) => part !== null);
    lines.push(`  ${meta.join(" · ")}`);
  }
  if (item.description) {
    lines.push(`  ${item.description}`);
  }

  if (item.useWhen && item.useWhen.length > 0) {
    lines.push("  use when:");
    for (const line of item.useWhen) lines.push(`    - ${line}`);
  }
  if (item.avoidWhen && item.avoidWhen.length > 0) {
    lines.push("  avoid when:");
    for (const line of item.avoidWhen) lines.push(`    - ${line}`);
  }

  const a11y = item.accessibility;
  if (a11y) {
    lines.push("  accessibility:");
    if (a11y.standard) lines.push(`    standard: ${a11y.standard}`);
    if (a11y.targetSize) lines.push(`    target size: ${a11y.targetSize}`);
    if (a11y.nameRequired !== undefined) {
      lines.push(`    accessible name required: ${a11y.nameRequired ? "yes" : "no"}`);
    }
    if (a11y.highContrastTested !== undefined) {
      lines.push(`    high contrast tested: ${a11y.highContrastTested ? "yes" : "no"}`);
    }
    for (const line of a11y.keyboard ?? []) lines.push(`    keyboard: ${line}`);
  }

  const files = item.files ?? [];
  if (files.length > 0) {
    lines.push("  files:");
    for (const file of files) lines.push(`    ${file.path} (${file.type})`);
  }
  if (item.dependencies && item.dependencies.length > 0) {
    lines.push(`  npm dependencies: ${item.dependencies.join(", ")}`);
  }
  if (item.registryDependencies && item.registryDependencies.length > 0) {
    lines.push(`  registry dependencies: ${item.registryDependencies.join(", ")}`);
  }
  if (item.docs) {
    lines.push(`  docs: ${item.docs}`);
  }
  return lines.join("\n");
}
