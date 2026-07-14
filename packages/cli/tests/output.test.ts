// SPDX-License-Identifier: MIT

import { describe, expect, it } from "vitest";
import {
  CLI_OUTPUT_SCHEMA,
  CLI_OUTPUT_SCHEMA_VERSION,
  EXIT,
  buildEnvelope,
  failure,
  failureFromError,
  success,
} from "../src/output.js";
import { RegistryError } from "../src/registry/client.js";

describe("exit codes", () => {
  it("uses the documented stable values", () => {
    expect(EXIT.OK).toBe(0);
    expect(EXIT.USER).toBe(1);
    expect(EXIT.REGISTRY).toBe(2);
    expect(EXIT.VALIDATION).toBe(3);
  });
});

describe("buildEnvelope", () => {
  it("wraps success data in the versioned envelope", () => {
    const envelope = buildEnvelope("search", "0.0.1", success({ results: [] }));
    expect(envelope).toEqual({
      $schema: CLI_OUTPUT_SCHEMA,
      schemaVersion: "1",
      cli: "0.0.1",
      command: "search",
      ok: true,
      data: { results: [] },
    });
    expect(CLI_OUTPUT_SCHEMA_VERSION).toBe("1");
    expect(CLI_OUTPUT_SCHEMA).toBe("https://commonsui.com/schema/cli-output.v1.json");
  });

  it("wraps failures with error code and message, no data key", () => {
    const envelope = buildEnvelope("add", "0.0.1", failure(EXIT.USER, "CONFLICT", "nope"));
    expect(envelope).toEqual({
      $schema: CLI_OUTPUT_SCHEMA,
      schemaVersion: "1",
      cli: "0.0.1",
      command: "add",
      ok: false,
      error: { code: "CONFLICT", message: "nope" },
    });
    expect("data" in envelope).toBe(false);
  });

  it("serializes to a single JSON object", () => {
    const envelope = buildEnvelope("init", "0.0.1", success({ written: true }));
    const parsed = JSON.parse(JSON.stringify(envelope)) as Record<string, unknown>;
    expect(Object.keys(parsed).sort()).toEqual(
      ["$schema", "cli", "command", "data", "ok", "schemaVersion"].sort(),
    );
  });
});

describe("failureFromError", () => {
  it("maps network/registry failures to exit 2", () => {
    for (const code of ["NETWORK", "NOT_FOUND", "HTTP", "INVALID_JSON"] as const) {
      const result = failureFromError(new RegistryError(code, "https://x", "boom"));
      expect(result.exitCode).toBe(EXIT.REGISTRY);
      expect(result.error.code).toBe(code);
    }
  });

  it("maps schema validation failures to exit 3", () => {
    const result = failureFromError(new RegistryError("INVALID_SCHEMA", "https://x", "bad"));
    expect(result.exitCode).toBe(EXIT.VALIDATION);
    expect(result.error.code).toBe("INVALID_SCHEMA");
  });

  it("maps unknown errors to exit 1", () => {
    const result = failureFromError(new Error("something"));
    expect(result.exitCode).toBe(EXIT.USER);
    expect(result.error.message).toBe("something");
  });
});
