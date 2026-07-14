// SPDX-License-Identifier: MIT

import { existsSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { defaultCommonsConfig, type CommonsConfig } from "../config.js";
import { EXIT, failure, success, type CliResult } from "../output.js";

export interface InitOptions {
  cwd: string;
  yes: boolean;
  force: boolean;
}

export interface InitData {
  /** Whether commons.json was written (false: preview only). */
  written: boolean;
  /** Absolute path of commons.json. */
  path: string;
  config: CommonsConfig;
}

/**
 * Set up Commons in a project by writing commons.json.
 *
 * Without `--yes` this is a preview: nothing is written. With `--yes` it
 * writes commons.json, refusing to overwrite an existing file unless
 * `--force` is passed (exit 1).
 */
export function runInit(options: InitOptions): CliResult<InitData> {
  const cwd = resolve(options.cwd);
  const path = join(cwd, "commons.json");
  const config = defaultCommonsConfig(cwd);

  if (!options.yes) {
    return success({ written: false, path, config });
  }

  if (existsSync(path) && !options.force) {
    return failure(
      EXIT.USER,
      "CONFLICT",
      `commons.json already exists at ${path}. Re-run with --force to overwrite it.`,
    );
  }

  writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  return success({ written: true, path, config });
}

/** Human-mode result for stdout. */
export function formatInit(data: InitData): string {
  if (!data.written) {
    return [
      "commons init — set up Commons in this project.",
      "",
      "Run again with --yes to write commons.json with these defaults:",
      "",
      JSON.stringify(data.config, null, 2),
    ].join("\n");
  }
  return `Wrote ${data.path}`;
}

// The CSS import lines and tsconfig alias live in the Workers-safe registry
// lib (matches apps/playground/src/index.css) so `commons init`, the local MCP
// server, and the hosted MCP server all read one source of truth.
import { CSS_IMPORT_LINES, TSCONFIG_ALIAS } from "../registry/lib.js";

export { CSS_IMPORT_LINES, TSCONFIG_ALIAS };

/** Human-mode next steps for stderr (guidance, not data). */
export function initNextSteps(): string {
  return [
    "",
    "Next steps:",
    '  1. Add the "@/*" import alias to tsconfig.json so component imports resolve:',
    `       "compilerOptions": { "paths": { ${TSCONFIG_ALIAS} } }`,
    '     (use ["./*"] instead when your project has no src directory;',
    '      paths resolve relative to tsconfig.json — TypeScript 7 removed "baseUrl")',
    "  2. Add these five lines, in this exact order, to your global CSS file:",
    ...CSS_IMPORT_LINES.map((line) => `       ${line}`),
    "     (the tailwind.css bridge must come after tailwindcss: it maps the",
    "      utilities to the Commons tokens and clears Tailwind's stock palette)",
  ].join("\n");
}
