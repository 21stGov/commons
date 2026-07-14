// SPDX-License-Identifier: MIT

/**
 * End-to-end smoke of the BUILT MCP server (dist/index.js, produced
 * before tests by turbo's test->build dependency): spawn `node dist mcp`
 * over stdio with the SDK client, against a local registry fixture
 * served by node:http. Argument-array spawns, temp dirs, no shell —
 * deterministic and cross-platform.
 */

import { execFile, spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CLI_VERSION } from "../src/version.js";

const execFileAsync = promisify(execFile);
const cliEntry = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "index.js");

const catalog = [
  {
    name: "date-picker",
    type: "registry:ui",
    title: "Date picker",
    description: "Select a single date.",
    status: "experimental",
    useWhen: ["Collecting a known calendar date"],
  },
  { name: "button", type: "registry:ui", title: "Button", description: "Immediate action." },
];

const buttonItem = {
  name: "button",
  type: "registry:ui",
  title: "Button",
  description: "Immediate action.",
  dependencies: ["clsx"],
  files: [{ path: "ui/button.tsx", content: "export const Button = () => null;\n", type: "registry:ui" }],
};

let httpServer: Server;
let registryBase: string;
let projectDir: string;

beforeAll(async () => {
  httpServer = createServer((request, response) => {
    const routes: Record<string, unknown> = {
      "/r/index.json": catalog,
      "/r/button.json": buttonItem,
    };
    const body = routes[request.url ?? ""];
    if (body === undefined) {
      response.writeHead(404, { "content-type": "text/plain" });
      response.end("not found");
      return;
    }
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(body));
  });
  await new Promise<void>((resolve) => {
    httpServer.listen(0, "127.0.0.1", resolve);
  });
  registryBase = `http://127.0.0.1:${(httpServer.address() as AddressInfo).port}/r`;

  projectDir = mkdtempSync(join(tmpdir(), "commons mcp e2é "));
  writeFileSync(
    join(projectDir, "commons.json"),
    `${JSON.stringify({ registry: registryBase }, null, 2)}\n`,
    "utf8",
  );
});

afterAll(async () => {
  await new Promise<void>((resolve) => {
    httpServer.close(() => resolve());
  });
  rmSync(projectDir, { recursive: true, force: true });
});

describe("built MCP server over stdio", () => {
  it("lists tools and answers search_components + get_component with structured results", async () => {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [cliEntry, "mcp"],
      cwd: projectDir,
      stderr: "ignore",
    });
    const client = new Client({ name: "commons-e2e", version: "0.0.0" });
    await client.connect(transport);
    try {
      const { tools } = await client.listTools();
      expect(tools.map((tool) => tool.name).sort()).toEqual([
        "get_component",
        "get_setup",
        "plan_install",
        "search_components",
      ]);
      const search = tools.find((tool) => tool.name === "search_components");
      expect(search?.inputSchema).toMatchObject({ type: "object" });
      expect(Object.keys(search?.inputSchema.properties ?? {}).sort()).toEqual([
        "limit",
        "query",
      ]);

      const searchResult = await client.callTool({
        name: "search_components",
        arguments: { query: "calendar" },
      });
      expect(searchResult.isError ?? false).toBe(false);
      const searchData = searchResult.structuredContent as Record<string, unknown>;
      expect(searchData).toMatchObject({
        schemaVersion: "1",
        cli: CLI_VERSION,
        registry: registryBase,
      });
      expect((searchData.results as Array<{ name: string }>).map((entry) => entry.name)).toEqual([
        "date-picker",
      ]);

      const componentResult = await client.callTool({
        name: "get_component",
        arguments: { name: "button" },
      });
      expect(componentResult.isError ?? false).toBe(false);
      const componentData = componentResult.structuredContent as Record<string, unknown>;
      expect(componentData).toMatchObject({
        schemaVersion: "1",
        cli: CLI_VERSION,
        registry: registryBase,
      });
      expect(componentData.item).toEqual(buttonItem);
    } finally {
      await client.close();
    }
  }, 30_000);

  it("starts and exits cleanly when stdin closes, with a silent stdout", async () => {
    const child = spawn(process.execPath, [cliEntry, "mcp"], {
      cwd: projectDir,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stdin.end(); // printf '' | commons mcp

    const code = await new Promise<number>((resolve) => {
      child.on("close", (exitCode) => resolve(exitCode ?? -1));
    });
    expect(code).toBe(0);
    // NOTHING on stdout except MCP protocol frames — and no client spoke,
    // so stdout must be completely empty.
    expect(stdout).toBe("");
  }, 30_000);
});

describe("built `commons mcp init` envelope", () => {
  it("emits a versioned --json envelope with command 'mcp' (codex snippet)", async () => {
    const { stdout } = await execFileAsync(process.execPath, [
      cliEntry,
      "mcp",
      "init",
      "--client",
      "codex",
      "--json",
      "--cwd",
      projectDir,
    ]);
    const envelope = JSON.parse(stdout.trim()) as Record<string, unknown>;
    expect(envelope).toMatchObject({
      schemaVersion: "1",
      cli: CLI_VERSION,
      command: "mcp",
      ok: true,
    });
    const data = envelope.data as Record<string, unknown>;
    expect(data.client).toBe("codex");
    expect(data.written).toBe(false);
    expect(data.snippet).toContain("[mcp_servers.commons]");
  });

  it("prints exactly the TOML snippet on stdout in human mode", async () => {
    const { stdout, stderr } = await execFileAsync(process.execPath, [
      cliEntry,
      "mcp",
      "init",
      "--client",
      "codex",
      "--cwd",
      projectDir,
    ]);
    expect(stdout).toBe(
      '[mcp_servers.commons]\ncommand = "npx"\nargs = ["@21stgov/commons", "mcp"]\n',
    );
    expect(stderr).toContain("~/.codex/config.toml");
  });
});
