// SPDX-License-Identifier: MIT

/**
 * Publishable JSON Schema documents for the Commons registry contract.
 *
 * These are the resolvable documents behind the `$schema` URLs that registry
 * items, the catalog, the CLI's `--json` output, and consumer `commons.json`
 * files declare. They are GENERATED from the same zod schemas the CLI uses to
 * validate at runtime, so the published schema can never drift from the code.
 *
 * The docs site writes the output of {@link buildJsonSchemas} to
 * `public/schema/<file>` (see apps/docs/scripts/generate.ts), served from
 * `https://commonsui.com/schema/`.
 */

import { z } from "zod";

import { COMMONS_CONFIG_SCHEMA, commonsConfigSchema } from "./config.js";
import { REGISTRY_ITEM_SCHEMA, registryIndexSchema, registryItemSchema } from "./registry/schema.js";

/** `$schema` URL for the CLI `--json` output envelope (see output.ts). */
const CLI_OUTPUT_SCHEMA = "https://commonsui.com/schema/cli-output.v1.json";
/** `$schema` URL for the searchable registry catalog (registry-build.ts CATALOG_SCHEMA). */
const CATALOG_SCHEMA = "https://commonsui.com/schema/catalog.v1.json";

/** JSON Schema dialect every emitted document declares. */
const DIALECT = "https://json-schema.org/draft/2020-12/schema";

/** Convert a zod schema to a JSON Schema document with published metadata. */
function fromZod(
  schema: z.ZodType,
  meta: { id: string; title: string; description: string },
): Record<string, unknown> {
  const doc = z.toJSONSchema(schema, { target: "draft-2020-12" }) as Record<string, unknown>;
  // Front-load identity fields; `$schema` from zod already equals DIALECT.
  return { $schema: DIALECT, $id: meta.id, title: meta.title, description: meta.description, ...doc };
}

/**
 * The CLI `--json` envelope. Hand-authored (the envelope is a TypeScript type,
 * not a zod schema) but kept in lockstep with output.ts by shape and by test.
 */
function cliOutputSchema(): Record<string, unknown> {
  return {
    $schema: DIALECT,
    $id: CLI_OUTPUT_SCHEMA,
    title: "Commons CLI output envelope (v1)",
    description:
      "The single JSON object a @21stgov/commons command prints to stdout when invoked with --json.",
    type: "object",
    required: ["$schema", "schemaVersion", "cli", "command", "ok"],
    properties: {
      $schema: { const: CLI_OUTPUT_SCHEMA },
      schemaVersion: { const: "1" },
      cli: {
        type: "string",
        description: "The @21stgov/commons package version that produced this output.",
      },
      command: { enum: ["add", "init", "search", "inspect", "mcp", "unknown"] },
      ok: { type: "boolean" },
      data: { description: "Command-specific success payload; present when ok is true." },
      error: {
        type: "object",
        required: ["code", "message"],
        properties: { code: { type: "string" }, message: { type: "string" } },
        additionalProperties: false,
        description: "Failure detail; present when ok is false.",
      },
    },
    // Discriminated on `ok`: success carries `data`, failure carries `error`.
    oneOf: [
      { properties: { ok: { const: true } }, required: ["data"] },
      { properties: { ok: { const: false } }, required: ["error"] },
    ],
    // Forward-compatible: unknown top-level fields are tolerated.
    additionalProperties: true,
  };
}

/**
 * Every publishable schema, keyed by its filename under `/schema/`. The keys
 * match the trailing path of each `$schema` URL the contract declares.
 */
export function buildJsonSchemas(): Record<string, Record<string, unknown>> {
  return {
    "registry-item.v1.json": fromZod(registryItemSchema, {
      id: REGISTRY_ITEM_SCHEMA,
      title: "Commons registry item (v1)",
      description:
        "A single registry item — the payload served at {registry}/{name}.json and consumed by `commons add`.",
    }),
    "catalog.v1.json": fromZod(registryIndexSchema, {
      id: CATALOG_SCHEMA,
      title: "Commons registry catalog (v1)",
      description:
        "The compact searchable catalog served at {registry}/index.json and consumed by `commons search`.",
    }),
    "commons.json": fromZod(commonsConfigSchema, {
      id: COMMONS_CONFIG_SCHEMA,
      title: "Commons project config (commons.json)",
      description: "The consumer-side commons.json configuration for the Commons CLI.",
    }),
    "cli-output.v1.json": cliOutputSchema(),
  };
}
