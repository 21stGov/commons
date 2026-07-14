// SPDX-License-Identifier: MIT

import { existsSync } from "node:fs";
import { join } from "node:path";

export type PackageManager = "pnpm" | "yarn" | "npm" | "bun";

/**
 * Detect the project's package manager from its lockfile.
 * Checked in order: pnpm, yarn, npm, bun. Defaults to pnpm.
 */
export function detectPackageManager(cwd: string): PackageManager {
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(join(cwd, "package-lock.json"))) return "npm";
  if (existsSync(join(cwd, "bun.lock")) || existsSync(join(cwd, "bun.lockb"))) return "bun";
  return "pnpm";
}

/**
 * The install command for the given dependencies, or null when there is
 * nothing to install. The CLI prints this command — it never runs it.
 */
export function installCommand(pm: PackageManager, dependencies: string[]): string | null {
  if (dependencies.length === 0) {
    return null;
  }
  const verb = pm === "npm" ? "install" : "add";
  return `${pm} ${verb} ${dependencies.join(" ")}`;
}
