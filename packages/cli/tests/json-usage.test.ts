// SPDX-License-Identifier: MIT

/**
 * End-to-end check of the --json contract for argument/usage errors:
 * exactly one JSON envelope on stdout, diagnostics on stderr, exit 1 —
 * even when citty rejects the arguments before a command runs.
 *
 * Spawns the built CLI (turbo runs `test` after `build`) with an
 * argument array — no shell, cross-platform.
 */

import { execFile } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { CLI_OUTPUT_SCHEMA } from "../src/output.js";

const execFileAsync = promisify(execFile);
const cliEntry = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "index.js");

async function runCli(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, [cliEntry, ...args]);
    return { code: 0, stdout, stderr };
  } catch (error) {
    const failed = error as { code?: number; stdout?: string; stderr?: string };
    return { code: failed.code ?? -1, stdout: failed.stdout ?? "", stderr: failed.stderr ?? "" };
  }
}

describe("--json argument/usage errors", () => {
  it("emits a single failure envelope on stdout for a missing positional", async () => {
    const { code, stdout, stderr } = await runCli(["add", "--json"]);

    expect(code).toBe(1);
    const lines = stdout.trim().split("\n");
    expect(lines).toHaveLength(1); // exactly one JSON object, nothing else
    const envelope = JSON.parse(lines[0] ?? "") as Record<string, unknown>;
    expect(envelope).toMatchObject({
      $schema: CLI_OUTPUT_SCHEMA,
      schemaVersion: "1",
      command: "add",
      ok: false,
    });
    expect((envelope.error as Record<string, unknown>).code).toBe("USAGE");
    expect(stderr).toContain("Missing required positional argument");
    // No ANSI escapes leak into the machine channel.
    expect(stdout).not.toContain("\u001B[");
  });

  it("emits a failure envelope with command 'unknown' for an unknown subcommand", async () => {
    const { code, stdout } = await runCli(["frobnicate", "--json"]);

    expect(code).toBe(1);
    const envelope = JSON.parse(stdout.trim()) as Record<string, unknown>;
    expect(envelope.command).toBe("unknown");
    expect(envelope.ok).toBe(false);
    const error = envelope.error as Record<string, unknown>;
    expect(error.code).toBe("USAGE");
    expect(error.message).toBe("Unknown command frobnicate");
  });

  it("keeps the success envelope contract intact", async () => {
    const { code, stdout } = await runCli(["init", "--json"]);

    expect(code).toBe(0);
    const envelope = JSON.parse(stdout.trim()) as Record<string, unknown>;
    expect(envelope.command).toBe("init");
    expect(envelope.ok).toBe(true);
  });
});
