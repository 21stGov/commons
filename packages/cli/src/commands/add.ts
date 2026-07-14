// SPDX-License-Identifier: MIT

import { resolve } from "node:path";
import {
  loadCommonsConfig,
  resolveCommonsPaths,
  resolveRegistry,
} from "../config.js";
import {
  EXIT,
  failure,
  failureFromError,
  success,
  type CliResult,
} from "../output.js";
import {
  DestinationCollisionError,
  IntegrityError,
  UnsafePathError,
  applyPlan,
  buildPlan,
  collectDependencies,
  type PlannedFileAction,
} from "../plan.js";
import { detectPackageManager, installCommand, type PackageManager } from "../pm.js";
import { resolveItems } from "../registry/resolve.js";

export interface AddOptions {
  cwd: string;
  names: string[];
  dryRun: boolean;
  overwrite: boolean;
}

export interface AddFileReport {
  path: string;
  action: PlannedFileAction;
  item: string;
}

export interface AddData {
  registry: string;
  /** Every resolved item in installation (topological) order. */
  items: string[];
  files: AddFileReport[];
  dependencies: string[];
  packageManager: PackageManager;
  /** Command to install npm dependencies — printed, never executed. */
  installCommand: string | null;
  dryRun: boolean;
  /** Number of files actually written (always 0 for a dry run). */
  written: number;
}

/**
 * Add registry items (and their transitive registryDependencies) to the
 * project. Pre-flights every path, hash, and conflict before writing a
 * single file: any conflict without --overwrite aborts with exit 1 and
 * zero writes.
 */
export async function runAdd(options: AddOptions): Promise<CliResult<AddData>> {
  const cwd = resolve(options.cwd);
  const names = [...new Set(options.names.filter((name) => name.length > 0))];
  if (names.length === 0) {
    return failure(EXIT.USER, "NO_ITEMS", 'No component names given. Try: "commons add button".');
  }

  let registry: string;
  let paths: ReturnType<typeof resolveCommonsPaths>;
  try {
    const resolved = loadCommonsConfig(cwd);
    registry = resolveRegistry(resolved);
    paths = resolveCommonsPaths(resolved.config, cwd);
  } catch (error) {
    return failure(
      EXIT.USER,
      "INVALID_CONFIG",
      error instanceof Error ? error.message : String(error),
    );
  }

  let items;
  try {
    items = await resolveItems(registry, names);
  } catch (error) {
    return failureFromError(error);
  }

  let plan;
  try {
    plan = buildPlan(cwd, paths, items, { overwrite: options.overwrite });
  } catch (error) {
    if (error instanceof UnsafePathError || error instanceof IntegrityError) {
      const code = error instanceof UnsafePathError ? "UNSAFE_PATH" : "INTEGRITY_MISMATCH";
      return failure(EXIT.VALIDATION, code, error.message);
    }
    if (error instanceof DestinationCollisionError) {
      return failure(EXIT.USER, "DESTINATION_COLLISION", error.message);
    }
    throw error;
  }

  const dependencies = collectDependencies(items);
  const packageManager = detectPackageManager(cwd);
  const data: AddData = {
    registry,
    items: items.map((item) => item.name),
    files: plan.map(({ path, action, item }) => ({ path, action, item })),
    dependencies,
    packageManager,
    installCommand: installCommand(packageManager, dependencies),
    dryRun: options.dryRun,
    written: 0,
  };

  if (options.dryRun) {
    return success(data); // Full plan, zero writes — conflicts stay visible.
  }

  const conflicts = plan.filter((file) => file.action === "conflict");
  if (conflicts.length > 0) {
    return failure(
      EXIT.USER,
      "CONFLICT",
      `Refusing to overwrite ${conflicts.length} existing file(s); nothing was written:\n` +
        conflicts.map((file) => `  ${file.path}`).join("\n") +
        "\nRe-run with --overwrite to replace them, or move them out of the way.",
    );
  }

  data.written = applyPlan(plan);
  return success(data);
}

/** Human-mode result for stdout. */
export function formatAdd(data: AddData): string {
  const lines: string[] = [];
  lines.push(`Registry: ${data.registry}`);
  lines.push(`Items (install order): ${data.items.join(", ")}`);
  lines.push("");

  if (data.files.length === 0) {
    lines.push("No files to write.");
  } else {
    lines.push(data.dryRun ? "Planned files (dry run — nothing written):" : "Files:");
    for (const file of data.files) {
      lines.push(`  [${file.action}] ${file.path} (${file.item})`);
    }
  }

  if (data.dependencies.length > 0) {
    lines.push("");
    lines.push(`npm dependencies: ${data.dependencies.join(", ")}`);
    lines.push(`Install them with: ${data.installCommand}`);
    lines.push("(The Commons CLI never runs installs for you.)");
  }

  if (!data.dryRun) {
    lines.push("");
    lines.push(`Wrote ${data.written} file(s).`);
  }

  return lines.join("\n");
}
