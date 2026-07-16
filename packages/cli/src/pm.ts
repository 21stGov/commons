// SPDX-License-Identifier: MIT

import { spawnSync } from "node:child_process";
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
 * nothing to install. This is the command the CLI prints; `runInstall`
 * executes the same thing when the user opts in with `--install`.
 */
export function installCommand(pm: PackageManager, dependencies: string[]): string | null {
  if (dependencies.length === 0) {
    return null;
  }
  const verb = pm === "npm" ? "install" : "add";
  return `${pm} ${verb} ${dependencies.join(" ")}`;
}

/**
 * Run the package manager to install `dependencies` in `cwd`. Opt-in only
 * (`commons add --install`, or the interactive prompt) — the default path
 * still just prints {@link installCommand}. Returns true on success.
 *
 * The manager's own stdout and stderr are routed to our stderr: they are
 * progress diagnostics, so a `--json` invocation's stdout stays a single
 * clean envelope. On Windows, `pnpm`/`npm` resolve to `.cmd` shims that only
 * run through a shell.
 */
export function runInstall(
  pm: PackageManager,
  dependencies: string[],
  cwd: string,
): boolean {
  if (dependencies.length === 0) {
    return true;
  }
  const verb = pm === "npm" ? "install" : "add";
  const result = spawnSync(pm, [verb, ...dependencies], {
    cwd,
    stdio: ["inherit", 2, 2],
    shell: process.platform === "win32",
  });
  return result.status === 0;
}
