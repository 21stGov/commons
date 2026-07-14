// SPDX-License-Identifier: MIT
// Schema shape follows the open shadcn registry format (MIT) — https://ui.shadcn.com/docs/registry

import { z } from "zod";

/** `$schema` URL for v1 registry items. */
export const REGISTRY_ITEM_SCHEMA = "https://commonsui.com/schema/registry-item.v1.json";

/**
 * Registry item types supported by the Commons registry.
 * These mirror the open shadcn registry format so items remain
 * interoperable with other tooling that speaks the same schema.
 */
export const registryItemTypeSchema = z.enum([
  "registry:ui",
  "registry:component",
  "registry:block",
  "registry:lib",
  "registry:hook",
  "registry:style",
  "registry:theme",
]);

export type RegistryItemType = z.infer<typeof registryItemTypeSchema>;

/**
 * A single file shipped by a registry item.
 *
 * v1 requires `content` inline: the CLI writes files from the validated
 * payload and never fetches source out-of-band. `path` is the file's
 * location in the registry source; only its basename is used when placing
 * the file in the consumer's project (mapped by `type` via commons.json
 * paths). Unknown extra fields are preserved for forward compatibility.
 */
export const registryItemFileSchema = z.looseObject({
  path: z.string().min(1, "file path must not be empty"),
  content: z.string(),
  type: registryItemTypeSchema,
  target: z.string().optional(),
});

export type RegistryItemFile = z.infer<typeof registryItemFileSchema>;

/**
 * CSS custom properties contributed by a registry item, grouped by theme
 * layer. Commons adds a first-class `high-contrast` layer on top of the
 * shadcn format's `theme`/`light`/`dark` groups.
 */
export const registryItemCssVarsSchema = z.looseObject({
  theme: z.record(z.string(), z.string()).optional(),
  light: z.record(z.string(), z.string()).optional(),
  dark: z.record(z.string(), z.string()).optional(),
  "high-contrast": z.record(z.string(), z.string()).optional(),
});

export type RegistryItemCssVars = z.infer<typeof registryItemCssVarsSchema>;

/**
 * Structured accessibility contract carried by a registry item.
 * All fields optional and passthrough-tolerant so the contract can grow
 * without breaking older CLIs.
 */
export const registryItemAccessibilitySchema = z.looseObject({
  standard: z.string().optional(),
  keyboard: z.array(z.string()).optional(),
  /**
   * Whether the `keyboard` interactions above are proven by automated tests.
   * A claim the keyboard-coverage test refuses to let ship without a backing
   * test (packages/react/test/keyboard-coverage.test.ts). Absent means "not
   * yet verified", which the docs surface honestly.
   */
  keyboardVerified: z.boolean().optional(),
  nameRequired: z.boolean().optional(),
  targetSize: z.string().optional(),
  highContrastTested: z.boolean().optional(),
  screenReadersTested: z.array(z.string()).optional(),
});

export type RegistryItemAccessibility = z.infer<typeof registryItemAccessibilitySchema>;

/** Compatibility claims (react range, RTL, forced colors, …). */
export const registryItemCompatibilitySchema = z.looseObject({
  react: z.string().optional(),
  rtl: z.boolean().optional(),
  forcedColors: z.boolean().optional(),
});

export type RegistryItemCompatibility = z.infer<typeof registryItemCompatibilitySchema>;

/**
 * Content hashes for the files the CLI copies.
 *
 * Either a per-file map of `files[].path` → sha256 (hex, optionally
 * prefixed `sha256-` or `sha256:`), or a single per-item string — the
 * sha256 of every file's content concatenated in `files` order.
 */
export const registryItemIntegritySchema = z.union([
  z.string(),
  z.record(z.string(), z.string()),
]);

export type RegistryItemIntegrity = z.infer<typeof registryItemIntegritySchema>;

/**
 * A registry item — the payload served at `{registry}/{name}.json`.
 *
 * Unknown fields never fail validation (forward compatibility): the schema
 * validates what the CLI relies on and passes the rest through.
 */
export const registryItemSchema = z.looseObject({
  $schema: z.string().optional(),
  schemaVersion: z.string().optional(),
  name: z.string().min(1, "name must not be empty"),
  type: registryItemTypeSchema,
  title: z.string().optional(),
  description: z.string().optional(),
  version: z.string().optional(),
  /** Known values: experimental | stable | deprecated | removed. Open for forward compat. */
  status: z.string().optional(),
  useWhen: z.array(z.string()).optional(),
  avoidWhen: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(registryItemFileSchema).optional(),
  cssVars: registryItemCssVarsSchema.optional(),
  compatibility: registryItemCompatibilitySchema.optional(),
  accessibility: registryItemAccessibilitySchema.optional(),
  integrity: registryItemIntegritySchema.optional(),
  docs: z.string().optional(),
});

export type RegistryItem = z.infer<typeof registryItemSchema>;

/**
 * The registry index — the payload served at `{registry}/registry.json`.
 */
export const registrySchema = z.looseObject({
  $schema: z.string().optional(),
  name: z.string().min(1, "name must not be empty"),
  homepage: z.string().optional(),
  items: z.array(registryItemSchema),
});

export type Registry = z.infer<typeof registrySchema>;

/**
 * One entry of the searchable catalog served at `{registry}/index.json`.
 * Deliberately small: agents should not need every item to answer
 * "what date inputs exist?".
 */
export const registryIndexEntrySchema = z.looseObject({
  name: z.string().min(1, "name must not be empty"),
  type: registryItemTypeSchema.optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  useWhen: z.array(z.string()).optional(),
});

export type RegistryIndexEntry = z.infer<typeof registryIndexEntrySchema>;

/**
 * The catalog served at `{registry}/index.json` — either a bare array of
 * entries or an object with an `items` array.
 */
export const registryIndexSchema = z.union([
  z.array(registryIndexEntrySchema),
  z.looseObject({
    $schema: z.string().optional(),
    items: z.array(registryIndexEntrySchema),
  }),
]);

export type RegistryIndex = z.infer<typeof registryIndexSchema>;
