// SPDX-License-Identifier: MIT

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { z } from "zod";

/** Default public Commons registry. */
export const DEFAULT_REGISTRY = "https://commonsui.com/r";

/** `$schema` URL for commons.json. */
export const COMMONS_CONFIG_SCHEMA = "https://commonsui.com/schema/commons.json";

/** Where registry files land in the consumer's project, by file type. */
export const commonsPathsSchema = z.looseObject({
  ui: z.string().min(1),
  components: z.string().min(1),
  lib: z.string().min(1),
});

export type CommonsPaths = z.infer<typeof commonsPathsSchema>;

/**
 * Schema for the consumer-side commons.json config file.
 * Unknown fields never fail validation (forward compatibility).
 */
export const commonsConfigSchema = z.looseObject({
  $schema: z.string().optional(),
  registry: z.string().min(1).optional(),
  paths: commonsPathsSchema.optional(),
  theme: z.string().optional(),
});

export type CommonsConfig = z.infer<typeof commonsConfigSchema>;

/**
 * Default file destinations. Projects with a `src` directory get
 * `src/`-rooted paths; everything else gets project-root paths.
 */
export function defaultCommonsPaths(cwd: string): CommonsPaths {
  const hasSrc = existsSync(join(cwd, "src"));
  return hasSrc
    ? { ui: "src/components/ui", components: "src/components", lib: "src/lib" }
    : { ui: "components/ui", components: "components", lib: "lib" };
}

/** The commons.json written by `commons init --yes`. */
export function defaultCommonsConfig(cwd: string): CommonsConfig {
  return {
    $schema: COMMONS_CONFIG_SCHEMA,
    registry: DEFAULT_REGISTRY,
    paths: defaultCommonsPaths(cwd),
    theme: "light",
  };
}

export interface ResolvedConfig {
  config: CommonsConfig;
  /** Where the config came from. */
  source: "commons.json" | "defaults";
  /** Absolute path of the loaded commons.json, when source is "commons.json". */
  path?: string;
}

/**
 * Load commons.json from `cwd` if present; otherwise fall back to defaults.
 * Throws an Error with a friendly message when the file exists but is
 * unreadable, malformed JSON, or fails schema validation.
 */
export function loadCommonsConfig(cwd: string): ResolvedConfig {
  const path = join(cwd, "commons.json");

  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { config: defaultCommonsConfig(cwd), source: "defaults" };
    }
    throw new Error(
      `Could not read ${path}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(
      `${path} is not valid JSON. Fix it or delete it and re-run "commons init --yes".`,
    );
  }

  const parsed = commonsConfigSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `${path} does not match the expected commons.json shape:\n${z.prettifyError(parsed.error)}`,
    );
  }

  return { config: parsed.data, source: "commons.json", path };
}

/**
 * Effective registry base URL for a loaded config, in priority order:
 * the `registry` field of an actual commons.json file, the
 * `COMMONS_REGISTRY` environment variable, then {@link DEFAULT_REGISTRY}.
 */
export function resolveRegistry(resolved: ResolvedConfig): string {
  if (resolved.source === "commons.json") {
    const fromFile = resolved.config.registry;
    if (fromFile !== undefined && fromFile.length > 0) {
      return fromFile;
    }
  }
  const fromEnv = process.env.COMMONS_REGISTRY?.trim();
  if (fromEnv !== undefined && fromEnv.length > 0) {
    return fromEnv;
  }
  return DEFAULT_REGISTRY;
}

/** Effective paths: commons.json `paths` merged over the defaults for `cwd`. */
export function resolveCommonsPaths(config: CommonsConfig, cwd: string): CommonsPaths {
  return { ...defaultCommonsPaths(cwd), ...(config.paths ?? {}) };
}
