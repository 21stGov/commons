// SPDX-License-Identifier: MIT

/**
 * Registry builder.
 *
 * Scans `packages/react/src/**` for co-located `registry.frag.json`
 * fragments, reads every referenced source file verbatim, and emits the
 * static JSON registry (`dist/r/{name}.json` + `dist/r/index.json` +
 * `dist/r/theme.json`) — the portable artifact contract from
 * `docs/platform-support.md`: plain static files, stable paths,
 * mirrorable by any ordinary HTTP server.
 *
 * Every emitted item is validated against the CLI's zod registry-item
 * schema at build time so the published registry can never drift from what
 * the `commons` CLI accepts.
 */

import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";

import {
  REGISTRY_ITEM_SCHEMA,
  registryIndexSchema,
  registryItemSchema,
} from "@21stgov/commons/src/registry/schema.ts";

/** `$schema` URL for the v1 registry catalog (`index.json`). */
export const CATALOG_SCHEMA = "https://commonsui.com/schema/catalog.v1.json";

/** Public homepage; also the base for per-item docs URLs. */
export const HOMEPAGE = "https://commonsui.com";

/**
 * The four CSS import lines a consumer adds to their global stylesheet,
 * in the required order (verified in apps/playground/src/index.css):
 * tokens, core, the tailwindcss engine, then the tokens tailwind.css
 * bridge — the bridge only clears Tailwind's stock palette when it comes
 * after `tailwindcss`. Must stay in sync with the CLI's `commons init`
 * next steps.
 */
export const THEME_CSS_IMPORTS = [
  '@import "@21stgov/commons-fonts/index.css";',
  '@import "@21stgov/commons-tokens/index.css";',
  '@import "@21stgov/commons-core/index.css";',
  '@import "tailwindcss";',
  '@import "@21stgov/commons-tokens/tailwind.css";',
] as const;

export interface BuildOptions {
  /** Absolute path of `packages/react` (fragment + source scan root). */
  reactDir: string;
  /** Absolute output directory (the `r/` directory, e.g. `dist/r`). Recreated on every build. */
  outDir: string;
  /** Version stamped on every emitted item (the react package version). */
  version: string;
  /** Catalog `generated` timestamp; defaults to now (injectable for tests). */
  generated?: string;
}

export interface BuildResult {
  outDir: string;
  /** Emitted item summaries (fragment items + theme), sorted by name. */
  items: Array<{ name: string; type: string }>;
  /** Root-relative-to-outDir names of every file written. */
  files: string[];
}

/** Lowercase hex sha256 of a UTF-8 string. Mirrors the CLI's hashing. */
export function sha256Hex(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

/** Last non-empty segment of a registry file path (either separator). */
export function registryFileBasename(filePath: string): string {
  const segments = filePath.split(/[\\/]/).filter((segment) => segment.length > 0);
  return segments[segments.length - 1] ?? "";
}

/**
 * Destination path published in `files[].path`, by registry file type.
 * These are the stable consumer-facing paths the CLI maps via commons.json.
 */
export function destinationPath(type: string, sourcePath: string): string {
  const base = registryFileBasename(sourcePath);
  if (base.length === 0) {
    throw new Error(`Registry file path ${JSON.stringify(sourcePath)} has no basename.`);
  }
  switch (type) {
    case "registry:ui":
      return `components/ui/${base}`;
    case "registry:lib":
      return `lib/${base}`;
    default:
      throw new Error(
        `Unsupported registry file type ${JSON.stringify(type)} for ${JSON.stringify(sourcePath)}. ` +
          `The builder maps "registry:ui" and "registry:lib" only — extend destinationPath() deliberately.`,
      );
  }
}

/**
 * Fail when two emitted paths differ only by case (or are exact
 * duplicates): they would collide on the case-insensitive filesystems that
 * are the default on Windows and macOS.
 */
export function assertNoCaseCollisions(paths: readonly string[], context: string): void {
  const seen = new Map<string, string>();
  for (const path of paths) {
    const key = path.toLowerCase();
    const existing = seen.get(key);
    if (existing !== undefined) {
      throw new Error(
        `Case collision in ${context}: ${JSON.stringify(existing)} and ${JSON.stringify(path)} ` +
          `resolve to the same file on case-insensitive filesystems.`,
      );
    }
    seen.set(key, path);
  }
}

/** Match `from "@/…"` and `import("@/…")` specifiers in shipped source. */
const ALIAS_IMPORT_RE = /\bfrom\s+["'](@\/[^"']+)["']|\bimport\(\s*["'](@\/[^"']+)["']\s*\)/g;

/** Every `@/`-alias import specifier appearing in a source string. */
export function extractAliasImports(content: string): string[] {
  const specifiers: string[] = [];
  for (const match of content.matchAll(ALIAS_IMPORT_RE)) {
    const specifier = match[1] ?? match[2];
    if (specifier !== undefined) {
      specifiers.push(specifier);
    }
  }
  return specifiers;
}

interface ImportCheckItem {
  name: string;
  registryDependencies?: string[];
  files?: Array<{ path: string; content?: string }>;
}

/**
 * Fail when a shipped file imports an `@/` specifier that does not resolve
 * inside the consumer project. Files ship verbatim, so every alias import
 * must land on a destination published by the item itself or by its
 * transitive registryDependencies (this is exactly what a consumer gets
 * from `commons add <item>`). Catches source-layout specifiers such as
 * `@/components/field/context` that only resolve inside packages/react.
 */
export function assertShippedImportsResolve(items: ReadonlyArray<ImportCheckItem>): void {
  const byName = new Map(items.map((item) => [item.name, item]));

  for (const item of items) {
    const closure = new Set<string>();
    const stack = [item.name];
    while (stack.length > 0) {
      const name = stack.pop() as string;
      if (closure.has(name)) {
        continue;
      }
      closure.add(name);
      for (const dependency of byName.get(name)?.registryDependencies ?? []) {
        stack.push(dependency);
      }
    }

    const destinations = new Set<string>();
    for (const name of closure) {
      for (const file of byName.get(name)?.files ?? []) {
        destinations.add(file.path);
      }
    }

    for (const file of item.files ?? []) {
      for (const specifier of extractAliasImports(file.content ?? "")) {
        const relative = specifier.slice(2); // strip "@/"
        const resolves =
          destinations.has(relative) ||
          destinations.has(`${relative}.ts`) ||
          destinations.has(`${relative}.tsx`);
        if (!resolves) {
          throw new Error(
            `Registry item "${item.name}" ships ${JSON.stringify(file.path)} importing ` +
              `${JSON.stringify(specifier)}, which does not resolve to any file published by ` +
              `"${item.name}" or its registryDependencies (${[...closure].sort().join(", ")}). ` +
              `Shipped imports must use published-layout specifiers (e.g. "@/components/ui/<file>", ` +
              `"@/lib/<file>") and the providing item must be a registryDependency.`,
          );
        }
      }
    }
  }
}

/**
 * Fail when an emitted item is missing the agent-facing contract fields.
 *
 * Every published item must carry `useWhen`, `avoidWhen`, and
 * `accessibility` so `commons search` and agents never hit gaps. Non-UI
 * items (registry:lib, registry:theme) satisfy the accessibility contract
 * with the explicit `{ standard: "not-applicable" }` marker instead of
 * omitting the field (see docs/conventions/components.md).
 */
export function assertAgentContract(
  items: ReadonlyArray<Record<string, unknown>>,
): void {
  for (const item of items) {
    const missing = ["useWhen", "avoidWhen", "accessibility"].filter(
      (field) => item[field] === undefined,
    );
    if (missing.length > 0) {
      throw new Error(
        `Registry item "${String(item.name)}" is missing required contract field(s): ` +
          `${missing.join(", ")}. Non-UI items use accessibility: { standard: "not-applicable" }.`,
      );
    }
  }
}

/** All `registry.frag.json` files under `<reactDir>/src`, sorted for determinism. */
export function findFragmentPaths(reactDir: string): string[] {
  const srcDir = join(reactDir, "src");
  const entries = readdirSync(srcDir, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name === "registry.frag.json")
    .map((entry) => join(entry.parentPath, entry.name))
    .sort();
}

interface FragmentFile {
  path: string;
  type: string;
  target?: string;
}

interface Fragment {
  name: string;
  type: string;
  files: FragmentFile[];
  [key: string]: unknown;
}

function readFragment(fragmentPath: string): Fragment {
  const raw = readFileSync(fragmentPath, "utf8");
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `${fragmentPath} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error(`${fragmentPath} must contain a JSON object.`);
  }
  const fragment = data as Fragment;
  if (typeof fragment.name !== "string" || fragment.name.length === 0) {
    throw new Error(`${fragmentPath} is missing a non-empty "name".`);
  }
  if (!Array.isArray(fragment.files) || fragment.files.length === 0) {
    throw new Error(`${fragmentPath} ("${fragment.name}") must list at least one file.`);
  }
  return fragment;
}

/**
 * Read a fragment-referenced source file verbatim (bytes preserved,
 * including CRLF), refusing paths that escape `reactDir`.
 */
function readSourceFile(reactDir: string, itemName: string, sourcePath: string): string {
  const absolute = resolve(reactDir, sourcePath);
  const contained = relative(reactDir, absolute);
  if (contained.length === 0 || contained.startsWith("..") || isAbsolute(contained)) {
    throw new Error(
      `Registry item "${itemName}" references ${JSON.stringify(sourcePath)}, ` +
        `which resolves outside ${reactDir}. Refusing to read it.`,
    );
  }
  return readFileSync(absolute, "utf8");
}

/**
 * Assemble one publishable registry item from a fragment: fragment fields
 * + verbatim file contents + per-file sha256 integrity map + provenance
 * fields ($schema, schemaVersion, version, docs URL, license).
 */
export function buildItem(
  fragmentPath: string,
  reactDir: string,
  version: string,
): Record<string, unknown> {
  const fragment = readFragment(fragmentPath);

  const files: Array<Record<string, unknown>> = [];
  const integrity: Record<string, string> = {};
  for (const file of fragment.files) {
    const content = readSourceFile(reactDir, fragment.name, file.path);
    const destination = destinationPath(file.type, file.path);
    files.push({
      path: destination,
      type: file.type,
      ...(file.target !== undefined ? { target: file.target } : {}),
      content,
    });
    integrity[destination] = `sha256-${sha256Hex(content)}`;
  }

  const item: Record<string, unknown> = {
    ...fragment,
    $schema: REGISTRY_ITEM_SCHEMA,
    schemaVersion: "1",
    version,
    files,
    integrity,
    docs: `${HOMEPAGE}/components/${fragment.name}`,
    license: "MIT",
  };

  validateItem(item, fragmentPath);
  return item;
}

/** The `theme` registry item: no files; `docs` carries the CSS import lines. */
export function buildThemeItem(version: string): Record<string, unknown> {
  const item: Record<string, unknown> = {
    $schema: REGISTRY_ITEM_SCHEMA,
    schemaVersion: "1",
    name: "theme",
    type: "registry:theme",
    title: "Commons theme",
    description:
      "Theme setup for Commons: Tailwind v4, the --cui-* design tokens (light, dark, and high-contrast), and the accessible base styles. Add the four CSS import lines from the docs field, in order, to your global stylesheet.",
    status: "experimental",
    version,
    useWhen: [
      "Setting up Commons in a project for the first time",
      "Wiring the Commons tokens and base styles into a Tailwind v4 stylesheet",
    ],
    avoidWhen: ["The project already imports the Commons theme CSS"],
    dependencies: ["tailwindcss", "@21stgov/commons-fonts", "@21stgov/commons-tokens", "@21stgov/commons-core"],
    compatibility: { rtl: true, forcedColors: true },
    // Non-UI item: the accessibility contract applies to components, not
    // to the stylesheet wiring itself (see docs/conventions/components.md).
    accessibility: { standard: "not-applicable" },
    docs: THEME_CSS_IMPORTS.join("\n"),
    license: "MIT",
  };
  validateItem(item, "theme.json");
  return item;
}

/** Validate an emitted item against the CLI's zod schema; fail the build on mismatch. */
function validateItem(item: Record<string, unknown>, source: string): void {
  const parsed = registryItemSchema.safeParse(item);
  if (!parsed.success) {
    throw new Error(
      `Emitted registry item from ${source} does not match the CLI registry-item schema:\n` +
        parsed.error.message,
    );
  }
}

/** The compact searchable catalog (`index.json`) for agents and `commons search`. */
export function buildCatalog(
  items: ReadonlyArray<Record<string, unknown>>,
  generated: string,
): Record<string, unknown> {
  const catalog = {
    $schema: CATALOG_SCHEMA,
    schemaVersion: "1",
    name: "commons",
    homepage: HOMEPAGE,
    generated,
    items: items.map((item) => ({
      name: item.name,
      type: item.type,
      title: item.title,
      description: item.description,
      status: item.status,
      // `commons search` matches on useWhen, so the catalog must carry it
      // (and avoidWhen, so agents can rule items out without a second fetch).
      ...(item.useWhen !== undefined ? { useWhen: item.useWhen } : {}),
      ...(item.avoidWhen !== undefined ? { avoidWhen: item.avoidWhen } : {}),
      ...(item.categories !== undefined ? { categories: item.categories } : {}),
      framework: item.type === "registry:ui" ? "react" : "css",
    })),
  };

  const parsed = registryIndexSchema.safeParse(catalog);
  if (!parsed.success) {
    throw new Error(
      `Emitted catalog does not match the CLI registry index schema:\n${parsed.error.message}`,
    );
  }
  return catalog;
}

function writeJson(outDir: string, fileName: string, value: unknown): void {
  writeFileSync(join(outDir, fileName), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

/** Build the full static registry into `options.outDir`. */
export function buildRegistry(options: BuildOptions): BuildResult {
  const generated = options.generated ?? new Date().toISOString();

  const items = findFragmentPaths(options.reactDir).map((fragmentPath) =>
    buildItem(fragmentPath, options.reactDir, options.version),
  );
  items.push(buildThemeItem(options.version));
  items.sort((a, b) => String(a.name).localeCompare(String(b.name), "en"));

  const names = items.map((item) => String(item.name));
  const artifactNames = [...names.map((name) => `${name}.json`), "index.json"];
  assertNoCaseCollisions(artifactNames, "registry output files");

  const consumerPaths = items.flatMap((item) =>
    ((item.files as Array<{ path: string }> | undefined) ?? []).map((file) => file.path),
  );
  assertNoCaseCollisions(consumerPaths, "registry item file destinations");

  assertShippedImportsResolve(items as unknown as ImportCheckItem[]);
  assertAgentContract(items);

  const catalog = buildCatalog(items, generated);

  rmSync(options.outDir, { recursive: true, force: true });
  mkdirSync(options.outDir, { recursive: true });
  const files: string[] = [];
  for (const item of items) {
    const fileName = `${item.name}.json`;
    writeJson(options.outDir, fileName, item);
    files.push(fileName);
  }
  writeJson(options.outDir, "index.json", catalog);
  files.push("index.json");

  return {
    outDir: options.outDir,
    items: items.map((item) => ({ name: String(item.name), type: String(item.type) })),
    files,
  };
}
