// SPDX-License-Identifier: MIT

/**
 * `commons mcp init` — write (or merge into) an MCP client's project
 * configuration so it launches the local Commons MCP server via
 * `npx @21stgov/commons mcp`.
 *
 * Merge semantics: an existing valid JSON config keeps every other
 * server and unrelated key; an existing `commons` entry with different
 * content is a conflict (exit 1) unless --force. Codex uses a global
 * config file, so we print the TOML snippet instead of writing.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { EXIT, failure, success, type CliResult } from "../output.js";

/** MCP clients `commons mcp init` knows how to configure. */
export const MCP_CLIENTS = ["claude", "cursor", "vscode", "codex"] as const;

export type McpClientName = (typeof MCP_CLIENTS)[number];

/** How every client launches the server. Args as an array — never a shell string. */
const SERVER_ENTRY = {
  command: "npx",
  args: ["@21stgov/commons", "mcp"],
} as const;

/** Key under which the server is registered in client config files. */
const SERVER_KEY = "commons";

/** Per-client config file location (path segments) and top-level key. */
const FILE_TARGETS: Record<
  Exclude<McpClientName, "codex">,
  { segments: string[]; rootKey: string }
> = {
  claude: { segments: [".mcp.json"], rootKey: "mcpServers" },
  cursor: { segments: [".cursor", "mcp.json"], rootKey: "mcpServers" },
  vscode: { segments: [".vscode", "mcp.json"], rootKey: "servers" },
};

/** The ~/.codex/config.toml snippet for Codex (global file — never written by us). */
export function codexSnippet(): string {
  return [
    `[mcp_servers.${SERVER_KEY}]`,
    `command = "${SERVER_ENTRY.command}"`,
    `args = [${SERVER_ENTRY.args.map((arg) => `"${arg}"`).join(", ")}]`,
  ].join("\n");
}

export interface McpInitOptions {
  cwd: string;
  client: string;
  force: boolean;
}

export interface McpInitData {
  client: McpClientName;
  /** Absolute path of the written config file; null for codex (snippet only). */
  path: string | null;
  /** False when nothing was written (codex, or already configured). */
  written: boolean;
  /** Codex only: the config.toml snippet to add manually. */
  snippet?: string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Structural equality for JSON-ish values (key order does not matter). */
function jsonEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((entry, i) => jsonEqual(entry, b[i]));
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    return (
      keysA.length === keysB.length && keysA.every((key) => key in b && jsonEqual(a[key], b[key]))
    );
  }
  return false;
}

/**
 * Configure an MCP client in `cwd`. Merges into an existing config file
 * without clobbering other servers; refuses (exit 1) when our entry
 * exists with different content and --force was not passed.
 */
export function runMcpInit(options: McpInitOptions): CliResult<McpInitData> {
  const client = options.client.trim().toLowerCase();
  if (!(MCP_CLIENTS as readonly string[]).includes(client)) {
    return failure(
      EXIT.USER,
      "INVALID_CLIENT",
      `Unknown MCP client ${JSON.stringify(options.client)}. ` +
        `Supported clients: ${MCP_CLIENTS.join(", ")}.`,
    );
  }

  if (client === "codex") {
    // Codex reads a GLOBAL config (~/.codex/config.toml); we never write
    // outside the project, so we print the snippet instead.
    return success({ client: "codex", path: null, written: false, snippet: codexSnippet() });
  }

  const target = FILE_TARGETS[client as Exclude<McpClientName, "codex">];
  const filePath = join(resolve(options.cwd), ...target.segments);

  let existing: Record<string, unknown> = {};
  if (existsSync(filePath)) {
    let raw: string;
    try {
      raw = readFileSync(filePath, "utf8");
    } catch (error) {
      return failure(
        EXIT.USER,
        "INVALID_CONFIG",
        `Could not read ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return failure(
        EXIT.USER,
        "INVALID_CONFIG",
        `${filePath} exists but is not valid JSON. Fix it (or remove it) and re-run ` +
          `"commons mcp init --client ${client}". Nothing was written.`,
      );
    }
    if (!isPlainObject(parsed)) {
      return failure(
        EXIT.USER,
        "INVALID_CONFIG",
        `${filePath} exists but is not a JSON object. Fix it (or remove it) and re-run ` +
          `"commons mcp init --client ${client}". Nothing was written.`,
      );
    }
    existing = parsed;
  }

  const serversValue = existing[target.rootKey];
  if (serversValue !== undefined && !isPlainObject(serversValue)) {
    return failure(
      EXIT.USER,
      "INVALID_CONFIG",
      `${filePath} has a ${JSON.stringify(target.rootKey)} field that is not an object. ` +
        `Fix it and re-run. Nothing was written.`,
    );
  }
  const servers: Record<string, unknown> = isPlainObject(serversValue) ? serversValue : {};

  const current = servers[SERVER_KEY];
  const desired = { command: SERVER_ENTRY.command, args: [...SERVER_ENTRY.args] };
  if (current !== undefined) {
    if (jsonEqual(current, desired)) {
      // Already configured exactly as we would write it — idempotent success.
      return success({ client: client as McpClientName, path: filePath, written: false });
    }
    if (!options.force) {
      return failure(
        EXIT.USER,
        "CONFLICT",
        `${filePath} already has a ${JSON.stringify(SERVER_KEY)} server entry with ` +
          `different content. Re-run with --force to replace it. Nothing was written.`,
      );
    }
  }

  const merged: Record<string, unknown> = {
    ...existing,
    [target.rootKey]: { ...servers, [SERVER_KEY]: desired },
  };

  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  return success({ client: client as McpClientName, path: filePath, written: true });
}

/**
 * Human-mode result for stdout. For codex this is EXACTLY the TOML
 * snippet (guidance goes to stderr), so
 * `commons mcp init --client codex >> ~/.codex/config.toml` works.
 */
export function formatMcpInit(data: McpInitData): string {
  if (data.client === "codex") {
    return data.snippet ?? codexSnippet();
  }
  if (!data.written) {
    return `${data.path} already configures the "${SERVER_KEY}" MCP server — nothing to do.`;
  }
  return `Wrote ${data.path}`;
}

/** Human-mode guidance for stderr after a codex run. */
export function codexGuidance(): string {
  return [
    "Codex reads MCP servers from the GLOBAL ~/.codex/config.toml, so nothing was",
    "written to this project. Append the snippet above to that file, e.g.:",
    "  commons mcp init --client codex >> ~/.codex/config.toml",
  ].join("\n");
}
