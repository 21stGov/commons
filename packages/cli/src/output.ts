// SPDX-License-Identifier: MIT

/**
 * The versioned machine interface for the Commons CLI.
 *
 * Every command invoked with `--json` prints EXACTLY ONE JSON envelope to
 * stdout and nothing else. Diagnostics and progress always go to stderr.
 *
 * Exit codes are stable and part of the contract:
 *   0 — success
 *   1 — user error or conflict (bad input, existing files, config problems)
 *   2 — network or registry error (unreachable, 404, HTTP failure, bad JSON)
 *   3 — validation error (schema mismatch, integrity mismatch, unsafe paths)
 */

import { RegistryError } from "./registry/client.js";

/** `$schema` URL stamped on every JSON envelope. */
export const CLI_OUTPUT_SCHEMA = "https://commonsui.com/schema/cli-output.v1.json";

/** Envelope schema version. Bump only with a new `$schema` URL. */
export const CLI_OUTPUT_SCHEMA_VERSION = "1";

/** Stable exit codes, by failure class. */
export const EXIT = {
  OK: 0,
  /** User error or conflict (bad input, existing files, config problems). */
  USER: 1,
  /** Network or registry error (unreachable, 404, HTTP 5xx, invalid JSON). */
  REGISTRY: 2,
  /** Validation error (schema mismatch, integrity mismatch, unsafe paths). */
  VALIDATION: 3,
} as const;

export type FailureExitCode = 1 | 2 | 3;

export type CommandName = "add" | "init" | "search" | "inspect" | "mcp";

/**
 * The `command` field of an envelope. `"unknown"` is only emitted for
 * argument/usage failures where no valid subcommand could be resolved.
 */
export type EnvelopeCommand = CommandName | "unknown";

export interface CliError {
  code: string;
  message: string;
}

export interface CliSuccess<T> {
  ok: true;
  exitCode: 0;
  data: T;
}

export interface CliFailure {
  ok: false;
  exitCode: FailureExitCode;
  error: CliError;
}

export type CliResult<T> = CliSuccess<T> | CliFailure;

export function success<T>(data: T): CliSuccess<T> {
  return { ok: true, exitCode: 0, data };
}

export function failure(exitCode: FailureExitCode, code: string, message: string): CliFailure {
  return { ok: false, exitCode, error: { code, message } };
}

/** Map a thrown error to a {@link CliFailure} with the right exit class. */
export function failureFromError(error: unknown): CliFailure {
  if (error instanceof RegistryError) {
    // Schema mismatches are validation failures (3); everything else the
    // registry can throw is a network/registry failure (2).
    const exitCode = error.code === "INVALID_SCHEMA" ? EXIT.VALIDATION : EXIT.REGISTRY;
    return failure(exitCode, error.code, error.message);
  }
  return failure(EXIT.USER, "ERROR", error instanceof Error ? error.message : String(error));
}

interface EnvelopeBase {
  $schema: typeof CLI_OUTPUT_SCHEMA;
  schemaVersion: typeof CLI_OUTPUT_SCHEMA_VERSION;
  /** The @21stgov/commons package version that produced this output. */
  cli: string;
  command: EnvelopeCommand;
  ok: boolean;
}

export interface SuccessEnvelope<T> extends EnvelopeBase {
  ok: true;
  data: T;
}

export interface FailureEnvelope extends EnvelopeBase {
  ok: false;
  error: CliError;
}

export type Envelope<T> = SuccessEnvelope<T> | FailureEnvelope;

/** Build the single JSON object a `--json` invocation prints to stdout. */
export function buildEnvelope<T>(
  command: EnvelopeCommand,
  cliVersion: string,
  result: CliResult<T>,
): Envelope<T> {
  const base = {
    $schema: CLI_OUTPUT_SCHEMA,
    schemaVersion: CLI_OUTPUT_SCHEMA_VERSION,
    cli: cliVersion,
    command,
  } as const;
  return result.ok
    ? { ...base, ok: true, data: result.data }
    : { ...base, ok: false, error: result.error };
}
