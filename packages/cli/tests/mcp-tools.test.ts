// SPDX-License-Identifier: MIT

/**
 * Commons MCP server tools over an in-memory transport, with the
 * registry mocked via fetch (same fixtures as the command tests).
 */

import { readdirSync } from "node:fs";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CSS_IMPORT_LINES, TSCONFIG_ALIAS } from "../src/commands/init.js";
import { buildMcpServer, MCP_RESULT_SCHEMA_VERSION } from "../src/mcp/server.js";
import { CLI_VERSION } from "../src/version.js";
import { BASE, cleanupProjects, makeProject, stubRegistry } from "./helpers.js";

const catalog = [
  {
    name: "date-picker",
    type: "registry:ui",
    title: "Date picker",
    description: "Select a single date.",
    status: "experimental",
    useWhen: ["Collecting a known calendar date"],
    avoidWhen: ["Approximate or historical dates"],
    framework: "react",
  },
  {
    name: "button",
    type: "registry:ui",
    title: "Button",
    description: "Initiates an immediate action.",
    status: "stable",
  },
  { name: "banner", type: "registry:ui", title: "Banner", description: "An action banner." },
];

const cnItem = {
  name: "cn",
  type: "registry:lib",
  files: [{ path: "lib/cn.ts", content: "export const cn = (v: string) => v;\n", type: "registry:lib" }],
  dependencies: ["clsx", "tailwind-merge"],
};

const buttonItem = {
  name: "button",
  type: "registry:ui",
  title: "Button",
  description: "Initiates an immediate action.",
  status: "stable",
  useWhen: ["Submitting a form"],
  registryDependencies: ["cn"],
  dependencies: ["clsx"],
  files: [{ path: "ui/button.tsx", content: "export const Button = () => null;\n", type: "registry:ui" }],
};

const openClients: Client[] = [];

async function connect(cwd: string): Promise<Client> {
  const server = buildMcpServer({ cwd });
  const client = new Client({ name: "commons-test-client", version: "0.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  openClients.push(client);
  return client;
}

function structured(result: Awaited<ReturnType<Client["callTool"]>>): Record<string, unknown> {
  expect(result.isError ?? false).toBe(false);
  expect(result.structuredContent).toBeDefined();
  return result.structuredContent as Record<string, unknown>;
}

function errorText(result: Awaited<ReturnType<Client["callTool"]>>): string {
  expect(result.isError).toBe(true);
  const content = result.content as Array<{ type: string; text: string }>;
  return content.map((entry) => entry.text).join("\n");
}

/** Recursive project listing (sorted) — for "nothing was written" checks. */
function snapshot(cwd: string): string[] {
  return readdirSync(cwd, { recursive: true }).map(String).sort();
}

afterEach(async () => {
  for (const client of openClients.splice(0)) {
    await client.close();
  }
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  cleanupProjects();
});

describe("tool registration", () => {
  it("exposes exactly the four read-only tools", async () => {
    const client = await connect(makeProject());
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      "get_component",
      "get_setup",
      "plan_install",
      "search_components",
    ]);
    for (const tool of tools) {
      expect(tool.annotations?.readOnlyHint).toBe(true);
      expect(tool.outputSchema).toBeDefined();
    }
  });
});

describe("search_components", () => {
  it("returns matching entries with version fields", async () => {
    stubRegistry({}, catalog);
    const client = await connect(makeProject());

    const data = structured(
      await client.callTool({ name: "search_components", arguments: { query: "date" } }),
    );

    expect(data).toMatchObject({
      schemaVersion: MCP_RESULT_SCHEMA_VERSION,
      cli: CLI_VERSION,
      registry: BASE,
    });
    const results = data.results as Array<Record<string, unknown>>;
    expect(results.map((entry) => entry.name)).toEqual(["date-picker"]);
    // Catalog extras the CLI schema treats as loose fields are surfaced.
    expect(results[0]).toMatchObject({
      status: "experimental",
      avoidWhen: ["Approximate or historical dates"],
      framework: "react",
    });
  });

  it("matches a term that only appears in useWhen (same logic as `commons search`)", async () => {
    stubRegistry({}, catalog);
    const client = await connect(makeProject());

    const data = structured(
      await client.callTool({ name: "search_components", arguments: { query: "calendar" } }),
    );
    expect((data.results as Array<{ name: string }>).map((entry) => entry.name)).toEqual([
      "date-picker",
    ]);
  });

  it("applies the limit", async () => {
    stubRegistry({}, catalog);
    const client = await connect(makeProject());

    const data = structured(
      await client.callTool({ name: "search_components", arguments: { query: "a", limit: 2 } }),
    );
    expect(data.results as unknown[]).toHaveLength(2);
  });

  it("rejects an out-of-bounds limit", async () => {
    stubRegistry({}, catalog);
    const client = await connect(makeProject());

    const text = errorText(
      await client.callTool({
        name: "search_components",
        arguments: { query: "date", limit: 51 },
      }),
    );
    expect(text).toContain("Input validation error");
  });

  it("turns a network failure into a tool error and keeps serving", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("boom"))));
    const client = await connect(makeProject());

    const failed = await client.callTool({
      name: "search_components",
      arguments: { query: "date" },
    });
    expect(errorText(failed)).toContain("[NETWORK]");

    // The server survives the failed fetch and answers the next call.
    stubRegistry({}, catalog);
    const data = structured(
      await client.callTool({ name: "search_components", arguments: { query: "date" } }),
    );
    expect(data.results as unknown[]).toHaveLength(1);
  });
});

describe("get_component", () => {
  it("returns the full validated registry item", async () => {
    stubRegistry({ button: buttonItem });
    const client = await connect(makeProject());

    const data = structured(
      await client.callTool({ name: "get_component", arguments: { name: "button" } }),
    );

    expect(data).toMatchObject({
      schemaVersion: MCP_RESULT_SCHEMA_VERSION,
      cli: CLI_VERSION,
      registry: BASE,
    });
    expect(data.item).toEqual(buttonItem);
  });

  it("returns a NOT_FOUND tool error for a missing item", async () => {
    stubRegistry({});
    const client = await connect(makeProject());

    const text = errorText(
      await client.callTool({ name: "get_component", arguments: { name: "missing" } }),
    );
    expect(text).toContain("[NOT_FOUND]");
    expect(text).toContain("missing");
  });

  it("returns an INVALID_SCHEMA tool error for a malformed item", async () => {
    stubRegistry({ broken: { title: "no name or type" } });
    const client = await connect(makeProject());

    const text = errorText(
      await client.callTool({ name: "get_component", arguments: { name: "broken" } }),
    );
    expect(text).toContain("[INVALID_SCHEMA]");
  });
});

describe("plan_install", () => {
  it("builds the same dry-run plan as `commons add --dry-run` and writes nothing", async () => {
    stubRegistry({ button: buttonItem, cn: cnItem });
    const cwd = makeProject({ src: true });
    const before = snapshot(cwd);
    const client = await connect(cwd);

    const data = structured(
      await client.callTool({ name: "plan_install", arguments: { names: ["button"] } }),
    );

    expect(data).toMatchObject({
      schemaVersion: MCP_RESULT_SCHEMA_VERSION,
      cli: CLI_VERSION,
      registry: BASE,
      items: ["cn", "button"], // dependencies first (topological order)
      dependencies: ["clsx", "tailwind-merge"],
      packageManager: "pnpm",
      command: "npx @21stgov/commons add button",
    });
    expect(data.files).toEqual([
      { path: "src/lib/cn.ts", action: "write", item: "cn" },
      { path: "src/components/ui/button.tsx", action: "write", item: "button" },
    ]);
    expect(data.installCommand).toContain("clsx");
    expect(data.note).toBeUndefined();

    // Read-only guarantee: the project directory is untouched.
    expect(snapshot(cwd)).toEqual(before);
  });

  it("plans with defaults and a note when the project has no commons.json", async () => {
    stubRegistry({ button: buttonItem, cn: cnItem });
    vi.stubEnv("COMMONS_REGISTRY", BASE);
    const cwd = makeProject({ config: null });
    const before = snapshot(cwd);
    const client = await connect(cwd);

    const data = structured(
      await client.callTool({ name: "plan_install", arguments: { names: ["button"] } }),
    );

    expect(data.note).toContain("npx @21stgov/commons init");
    // Default (no-src) paths apply.
    expect(data.files).toEqual([
      { path: "lib/cn.ts", action: "write", item: "cn" },
      { path: "components/ui/button.tsx", action: "write", item: "button" },
    ]);
    expect(snapshot(cwd)).toEqual(before);
  });

  it("resolves a per-call cwd against the server's base directory", async () => {
    stubRegistry({ button: buttonItem, cn: cnItem });
    const serverCwd = makeProject({ config: null });
    const project = makeProject({ src: true });
    const client = await connect(serverCwd);

    const data = structured(
      await client.callTool({
        name: "plan_install",
        arguments: { names: ["button"], cwd: project },
      }),
    );
    expect(data.registry).toBe(BASE);
    expect((data.files as Array<{ path: string }>)[0]?.path).toBe("src/lib/cn.ts");
  });

  it("reports a NOT_FOUND tool error without crashing", async () => {
    stubRegistry({});
    const client = await connect(makeProject());

    const text = errorText(
      await client.callTool({ name: "plan_install", arguments: { names: ["ghost"] } }),
    );
    expect(text).toContain("[NOT_FOUND]");
  });

  it("rejects more than 20 names", async () => {
    stubRegistry({});
    const client = await connect(makeProject());
    const names = Array.from({ length: 21 }, (_, i) => `c${i}`);
    const text = errorText(await client.callTool({ name: "plan_install", arguments: { names } }));
    expect(text).toContain("Input validation error");
  });
});

describe("get_setup", () => {
  it("returns the registry URL, CSS imports, tsconfig alias, and init command", async () => {
    const client = await connect(makeProject());

    const data = structured(await client.callTool({ name: "get_setup", arguments: {} }));

    expect(data).toMatchObject({
      schemaVersion: MCP_RESULT_SCHEMA_VERSION,
      cli: CLI_VERSION,
      registry: BASE,
      registryUrl: BASE,
      tsconfigAlias: '"@/*": ["./src/*"]',
      initCommand: "npx @21stgov/commons init",
    });
    expect(data.tsconfigAlias).toBe(TSCONFIG_ALIAS);
    // The five import lines come from the init module — never copied strings.
    expect(data.cssImports).toEqual([...CSS_IMPORT_LINES]);
    expect(data.cssImports as string[]).toHaveLength(5);
  });

  it("honors COMMONS_REGISTRY when no commons.json exists", async () => {
    vi.stubEnv("COMMONS_REGISTRY", "https://agency.example/r");
    const client = await connect(makeProject({ config: null }));

    const data = structured(await client.callTool({ name: "get_setup", arguments: {} }));
    expect(data.registryUrl).toBe("https://agency.example/r");
  });

  it("returns an INVALID_CONFIG tool error for a broken commons.json", async () => {
    const cwd = makeProject({ config: null });
    const { writeFileSync } = await import("node:fs");
    writeFileSync(join(cwd, "commons.json"), "{ not json", "utf8");
    const client = await connect(cwd);

    const text = errorText(await client.callTool({ name: "get_setup", arguments: {} }));
    expect(text).toContain("[INVALID_CONFIG]");
  });
});
