// SPDX-License-Identifier: MIT

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { codexSnippet, formatMcpInit, runMcpInit } from "../src/commands/mcp.js";
import { EXIT } from "../src/output.js";
import { cleanupProjects, makeProject } from "./helpers.js";

const ENTRY = { command: "npx", args: ["@21stgov/commons", "mcp"] };

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

afterEach(() => {
  cleanupProjects();
});

describe("runMcpInit file shapes", () => {
  it("claude (default flow): writes .mcp.json with mcpServers", () => {
    const cwd = makeProject({ config: null });
    const result = runMcpInit({ cwd, client: "claude", force: false });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.written).toBe(true);
    expect(result.data.path).toBe(join(cwd, ".mcp.json"));
    expect(readJson(join(cwd, ".mcp.json"))).toEqual({ mcpServers: { commons: ENTRY } });
  });

  it("cursor: writes .cursor/mcp.json with mcpServers", () => {
    const cwd = makeProject({ config: null });
    const result = runMcpInit({ cwd, client: "cursor", force: false });

    expect(result.ok).toBe(true);
    expect(readJson(join(cwd, ".cursor", "mcp.json"))).toEqual({
      mcpServers: { commons: ENTRY },
    });
  });

  it("vscode: writes .vscode/mcp.json with servers (not mcpServers)", () => {
    const cwd = makeProject({ config: null });
    const result = runMcpInit({ cwd, client: "vscode", force: false });

    expect(result.ok).toBe(true);
    expect(readJson(join(cwd, ".vscode", "mcp.json"))).toEqual({
      servers: { commons: ENTRY },
    });
  });

  it("rejects an unknown client with exit 1", () => {
    const cwd = makeProject({ config: null });
    const result = runMcpInit({ cwd, client: "zed", force: false });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.exitCode).toBe(EXIT.USER);
    expect(result.error.code).toBe("INVALID_CLIENT");
  });
});

describe("runMcpInit merge semantics", () => {
  it("deep-merges without clobbering other servers or unrelated keys", () => {
    const cwd = makeProject({ config: null });
    const path = join(cwd, ".mcp.json");
    writeFileSync(
      path,
      JSON.stringify({
        mcpServers: { other: { command: "other-server", args: ["--x"] } },
        unrelated: { keep: true },
      }),
      "utf8",
    );

    const result = runMcpInit({ cwd, client: "claude", force: false });

    expect(result.ok).toBe(true);
    expect(readJson(path)).toEqual({
      mcpServers: {
        other: { command: "other-server", args: ["--x"] },
        commons: ENTRY,
      },
      unrelated: { keep: true },
    });
  });

  it("is idempotent: an identical existing entry is success without a write", () => {
    const cwd = makeProject({ config: null });
    runMcpInit({ cwd, client: "claude", force: false });
    const before = readFileSync(join(cwd, ".mcp.json"), "utf8");

    const again = runMcpInit({ cwd, client: "claude", force: false });

    expect(again.ok).toBe(true);
    if (!again.ok) return;
    expect(again.data.written).toBe(false);
    expect(readFileSync(join(cwd, ".mcp.json"), "utf8")).toBe(before);
  });

  it("treats a key-reordered but equal entry as identical", () => {
    const cwd = makeProject({ config: null });
    const path = join(cwd, ".mcp.json");
    writeFileSync(
      path,
      JSON.stringify({ mcpServers: { commons: { args: ["@21stgov/commons", "mcp"], command: "npx" } } }),
      "utf8",
    );

    const result = runMcpInit({ cwd, client: "claude", force: false });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.written).toBe(false);
  });

  it("refuses a differing commons entry with exit 1 unless --force", () => {
    const cwd = makeProject({ config: null });
    const path = join(cwd, ".mcp.json");
    const original = JSON.stringify({
      mcpServers: { commons: { command: "docker", args: ["run", "something-else"] } },
    });
    writeFileSync(path, original, "utf8");

    const refused = runMcpInit({ cwd, client: "claude", force: false });
    expect(refused.ok).toBe(false);
    if (refused.ok) return;
    expect(refused.exitCode).toBe(EXIT.USER);
    expect(refused.error.code).toBe("CONFLICT");
    expect(readFileSync(path, "utf8")).toBe(original); // untouched

    const forced = runMcpInit({ cwd, client: "claude", force: true });
    expect(forced.ok).toBe(true);
    expect(readJson(path)).toEqual({ mcpServers: { commons: ENTRY } });
  });

  it("refuses to touch an existing file that is not valid JSON", () => {
    const cwd = makeProject({ config: null });
    const path = join(cwd, ".mcp.json");
    writeFileSync(path, "{ this is not json", "utf8");

    const result = runMcpInit({ cwd, client: "claude", force: false });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.exitCode).toBe(EXIT.USER);
    expect(result.error.code).toBe("INVALID_CONFIG");
    expect(readFileSync(path, "utf8")).toBe("{ this is not json");
  });
});

describe("codex", () => {
  it("writes nothing and returns the config.toml snippet", () => {
    const cwd = makeProject({ config: null });
    const result = runMcpInit({ cwd, client: "codex", force: false });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.written).toBe(false);
    expect(result.data.path).toBeNull();
    expect(result.data.snippet).toBe(
      ['[mcp_servers.commons]', 'command = "npx"', 'args = ["@21stgov/commons", "mcp"]'].join(
        "\n",
      ),
    );
    expect(existsSync(join(cwd, ".mcp.json"))).toBe(false);

    // Human stdout is EXACTLY the snippet, so it can be appended to
    // ~/.codex/config.toml with a shell redirect.
    expect(formatMcpInit(result.data)).toBe(codexSnippet());
  });
});
