// SPDX-License-Identifier: MIT

import { describe, expect, it } from "vitest";

import { COMMONS_CONFIG_SCHEMA } from "../src/config.js";
import { buildEnvelope, CLI_OUTPUT_SCHEMA, failure, success } from "../src/output.js";
import { REGISTRY_ITEM_SCHEMA } from "../src/registry/schema.js";
import { buildJsonSchemas } from "../src/schemas.js";

const DIALECT = "https://json-schema.org/draft/2020-12/schema";

describe("buildJsonSchemas", () => {
  const schemas = buildJsonSchemas();

  it("emits exactly the four published documents", () => {
    expect(Object.keys(schemas).sort()).toEqual([
      "catalog.v1.json",
      "cli-output.v1.json",
      "commons.json",
      "registry-item.v1.json",
    ]);
  });

  it("stamps the JSON Schema dialect and the contract's own $id on each", () => {
    for (const doc of Object.values(schemas)) {
      expect(doc.$schema).toBe(DIALECT);
      expect(typeof doc.$id).toBe("string");
    }
    // $id must match the URL the CLI actually declares for each contract.
    expect(schemas["registry-item.v1.json"].$id).toBe(REGISTRY_ITEM_SCHEMA);
    expect(schemas["commons.json"].$id).toBe(COMMONS_CONFIG_SCHEMA);
    expect(schemas["cli-output.v1.json"].$id).toBe(CLI_OUTPUT_SCHEMA);
  });

  it("derives the registry-item schema from the zod source (object with known props)", () => {
    const doc = schemas["registry-item.v1.json"];
    expect(doc.type).toBe("object");
    const props = Object.keys(doc.properties as Record<string, unknown>);
    expect(props).toEqual(expect.arrayContaining(["name", "type", "files", "accessibility"]));
  });
});

describe("cli-output.v1.json stays in lockstep with the envelope", () => {
  const schema = buildJsonSchemas()["cli-output.v1.json"];
  const props = schema.properties as Record<string, { const?: unknown; enum?: string[] }>;
  const required = schema.required as string[];

  it("requires every base envelope field", () => {
    expect(required).toEqual(
      expect.arrayContaining(["$schema", "schemaVersion", "cli", "command", "ok"]),
    );
  });

  it("pins $schema/schemaVersion to the values buildEnvelope emits", () => {
    const env = buildEnvelope("add", "9.9.9", success({ any: "payload" }));
    expect(props.$schema.const).toBe(env.$schema);
    expect(props.schemaVersion.const).toBe(env.schemaVersion);
  });

  it("lists every command buildEnvelope can stamp", () => {
    for (const command of ["add", "init", "search", "inspect", "mcp", "unknown"] as const) {
      const env = buildEnvelope(command, "9.9.9", failure(1, "ERR", "x"));
      expect(props.command.enum).toContain(env.command);
    }
  });
});
