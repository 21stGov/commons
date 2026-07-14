// SPDX-License-Identifier: MIT

/**
 * Planning and applying `commons add` writes.
 *
 * Security model: registry items are untrusted input. File paths from an
 * item may never escape the project root — absolute paths, `..` segments,
 * Windows drive letters, UNC paths, Windows-reserved device names, and
 * segments with trailing dots or spaces are all rejected before any write,
 * and only the basename of an item file path is ever used on disk.
 * Destinations are re-checked against the realpath of their existing
 * ancestor directory (symlinks cannot smuggle a write outside the root),
 * and case-insensitive destination collisions abort the whole plan.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import type { CommonsPaths } from "./config.js";
import type { RegistryItem, RegistryItemType } from "./registry/schema.js";

/** What `commons add` will do for one destination file. */
export type PlannedFileAction = "write" | "conflict" | "skip";

export interface PlannedFile {
  /** Project-root-relative destination, always with forward slashes. */
  path: string;
  /** Absolute destination on this machine. */
  absolutePath: string;
  action: PlannedFileAction;
  /** Exact file content (bytes preserved, CRLF included) to write. */
  content: string;
  /** The registry item this file came from. */
  item: string;
}

export class UnsafePathError extends Error {
  constructor(itemName: string, filePath: string, reason: string) {
    super(
      `Registry item "${itemName}" has an unsafe file path ${JSON.stringify(filePath)}: ${reason}. ` +
        `Refusing to write anything from this item.`,
    );
    this.name = "UnsafePathError";
  }
}

export class IntegrityError extends Error {
  constructor(itemName: string, detail: string) {
    super(
      `Integrity check failed for registry item "${itemName}": ${detail}. ` +
        `Refusing to write anything from this item.`,
    );
    this.name = "IntegrityError";
  }
}

export class DestinationCollisionError extends Error {
  constructor(collisions: Array<{ destination: string; sources: string[] }>) {
    super(
      `Multiple registry files resolve to the same destination ` +
        `(compared case-insensitively, since Windows and macOS filesystems collide on case). ` +
        `Nothing was written:\n` +
        collisions
          .map(
            (collision) =>
              `  ${collision.destination}\n` +
              collision.sources.map((source) => `    <- ${source}`).join("\n"),
          )
          .join("\n"),
    );
    this.name = "DestinationCollisionError";
  }
}

/**
 * Windows-reserved device names (CON, PRN, AUX, NUL, COM0-9, LPT0-9),
 * case-insensitive, with or without an extension — `nul.txt` still refers
 * to the NUL device on Windows.
 */
const WINDOWS_RESERVED_NAME = /^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\..*)?$/i;

/**
 * Reject registry file paths that could escape the project root.
 * Returns the reason the path is unsafe, or null when it is acceptable.
 */
export function unsafePathReason(filePath: string): string | null {
  if (filePath.trim().length === 0) {
    return "path is empty";
  }
  if (/^[A-Za-z]:/.test(filePath)) {
    return "drive letters are not allowed";
  }
  if (filePath.startsWith("\\\\") || filePath.startsWith("//")) {
    return "UNC paths are not allowed";
  }
  if (filePath.startsWith("/") || filePath.startsWith("\\") || isAbsolute(filePath)) {
    return "absolute paths are not allowed";
  }
  const segments = filePath.split(/[\\/]/);
  if (segments.some((segment) => segment === "..")) {
    return '".." segments are not allowed';
  }
  for (const segment of segments) {
    if (segment === "." || segment.length === 0) {
      continue;
    }
    if (WINDOWS_RESERVED_NAME.test(segment)) {
      return `${JSON.stringify(segment)} is a Windows-reserved device name`;
    }
    if (segment.endsWith(".") || segment.endsWith(" ")) {
      return `${JSON.stringify(segment)} ends with a dot or space, which Windows cannot store`;
    }
  }
  return null;
}

/** Last non-empty segment of a registry file path (either separator). */
export function registryFileBasename(filePath: string): string {
  const segments = filePath.split(/[\\/]/).filter((segment) => segment.length > 0);
  return segments[segments.length - 1] ?? "";
}

/** Map a registry file type to its destination directory from commons.json. */
export function targetDirFor(type: RegistryItemType, paths: CommonsPaths): string {
  switch (type) {
    case "registry:ui":
      return paths.ui;
    case "registry:lib":
      return paths.lib;
    default:
      return paths.components;
  }
}

/** Lowercase hex sha256 of a UTF-8 string. */
export function sha256Hex(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

function normalizeDigest(value: string): string {
  return value.replace(/^sha256[:-]/i, "").toLowerCase();
}

/**
 * Verify an item's sha256 integrity metadata when present.
 *
 * A per-file map is keyed by `files[].path`; a per-item string is the
 * sha256 of every file's content concatenated in `files` order.
 *
 * When an item carries an integrity map, EVERY file must have a matching
 * entry — a missing entry is a validation failure, otherwise a partial
 * (or empty) map would silently vouch for unverified files. Items with no
 * integrity field at all are still accepted (registries may predate
 * hashes). Throws {@link IntegrityError} on any mismatch or gap.
 */
export function verifyItemIntegrity(item: RegistryItem): void {
  const integrity = item.integrity;
  if (integrity === undefined) {
    return;
  }
  const files = item.files ?? [];

  if (typeof integrity === "string") {
    const combined = sha256Hex(files.map((file) => file.content).join(""));
    if (combined !== normalizeDigest(integrity)) {
      throw new IntegrityError(
        item.name,
        `expected combined sha256 ${normalizeDigest(integrity)} but computed ${combined}`,
      );
    }
    return;
  }

  for (const file of files) {
    const expected = integrity[file.path];
    if (expected === undefined) {
      throw new IntegrityError(
        item.name,
        `"${file.path}" has no entry in the item's integrity map ` +
          `(when integrity is present, every file must have a verified hash)`,
      );
    }
    const actual = sha256Hex(file.content);
    if (actual !== normalizeDigest(expected)) {
      throw new IntegrityError(
        item.name,
        `"${file.path}" expected sha256 ${normalizeDigest(expected)} but computed ${actual}`,
      );
    }
  }
}

/**
 * Deepest ancestor directory of `absolutePath` that already exists on
 * disk (the directory a write would actually create children under).
 */
function deepestExistingDir(absolutePath: string): string {
  let dir = dirname(absolutePath);
  while (!existsSync(dir)) {
    const parent = dirname(dir);
    if (parent === dir) {
      break; // Filesystem root.
    }
    dir = parent;
  }
  return dir;
}

/**
 * Build the full, pre-flighted write plan for the resolved items.
 *
 * Validates every path and every integrity hash before reporting a single
 * action, so a caller can guarantee "zero writes on any conflict or
 * validation failure". Throws {@link UnsafePathError},
 * {@link IntegrityError}, or {@link DestinationCollisionError}; conflicts
 * are reported, not thrown.
 */
export function buildPlan(
  cwd: string,
  paths: CommonsPaths,
  items: RegistryItem[],
  options: { overwrite: boolean },
): PlannedFile[] {
  const root = resolve(cwd);
  // Realpath the root once so symlinked project directories (e.g. macOS
  // /tmp -> /private/tmp) compare correctly below.
  const realRoot = realpathSync(root);
  const planned: PlannedFile[] = [];
  // Case-folded destination -> every "item (registry path)" contributing
  // to it. More than one source is a hard error: on the case-insensitive
  // filesystems that are the default on Windows and macOS the writes
  // would silently clobber each other.
  const destinationSources = new Map<string, { destination: string; sources: string[] }>();

  for (const item of items) {
    verifyItemIntegrity(item);

    for (const file of item.files ?? []) {
      const reason = unsafePathReason(file.path);
      if (reason !== null) {
        throw new UnsafePathError(item.name, file.path, reason);
      }

      const basename = registryFileBasename(file.path);
      const absolutePath = resolve(root, targetDirFor(file.type, paths), basename);

      // Containment check: the resolved destination (including any
      // commons.json-configured directory) must stay inside the project.
      const relativePath = relative(root, absolutePath);
      if (relativePath.length === 0 || relativePath.startsWith("..") || isAbsolute(relativePath)) {
        throw new UnsafePathError(item.name, file.path, "resolves outside the project root");
      }

      // Symlink check: writes follow symlinks, so re-verify containment on
      // the realpath of the deepest ancestor directory that exists today.
      const realDir = realpathSync(deepestExistingDir(absolutePath));
      const realRelative = relative(realRoot, realDir);
      if (realRelative.startsWith("..") || isAbsolute(realRelative)) {
        throw new UnsafePathError(
          item.name,
          file.path,
          "resolves outside the project root after following symlinks",
        );
      }

      const collisionKey = absolutePath.toLowerCase();
      const existing = destinationSources.get(collisionKey);
      const source = `${item.name} (${file.path})`;
      if (existing !== undefined) {
        existing.sources.push(source);
        continue; // Recorded; the collision aborts the plan below.
      }
      destinationSources.set(collisionKey, {
        destination: relativePath.split(sep).join("/"),
        sources: [source],
      });

      let action: PlannedFileAction = "write";
      if (existsSync(absolutePath)) {
        const existing = readFileSync(absolutePath, "utf8");
        if (existing === file.content) {
          action = "skip";
        } else {
          action = options.overwrite ? "write" : "conflict";
        }
      }

      planned.push({
        path: relativePath.split(sep).join("/"),
        absolutePath,
        action,
        content: file.content,
        item: item.name,
      });
    }
  }

  const collisions = [...destinationSources.values()].filter(
    (entry) => entry.sources.length > 1,
  );
  if (collisions.length > 0) {
    throw new DestinationCollisionError(collisions);
  }

  return planned;
}

/** Write every `action: "write"` file in the plan. UTF-8, bytes preserved. */
export function applyPlan(files: PlannedFile[]): number {
  let written = 0;
  for (const file of files) {
    if (file.action !== "write") {
      continue;
    }
    mkdirSync(dirname(file.absolutePath), { recursive: true });
    writeFileSync(file.absolutePath, file.content, "utf8");
    written += 1;
  }
  return written;
}

/** Collect and dedupe npm dependencies across items, preserving order. */
export function collectDependencies(items: RegistryItem[]): string[] {
  const dependencies: string[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    for (const dependency of item.dependencies ?? []) {
      if (!seen.has(dependency)) {
        seen.add(dependency);
        dependencies.push(dependency);
      }
    }
  }
  return dependencies;
}
