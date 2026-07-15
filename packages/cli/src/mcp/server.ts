// SPDX-License-Identifier: MIT

/**
 * The local, read-only Commons MCP server (stdio).
 *
 * Exposes the same deterministic operations as the CLI's machine
 * interface — catalog search, registry-item inspection, dry-run install
 * planning, and project setup facts — as bounded MCP tools with input
 * and output schemas. Every tool reuses the corresponding CLI command
 * implementation, so results and the error taxonomy (NOT_FOUND vs
 * NETWORK vs INVALID_SCHEMA, …) never drift from `--json` output.
 *
 * Rules (see docs/ai-and-agents.md):
 * - read-only: no tool ever writes to the filesystem;
 * - NOTHING prints to stdout except MCP protocol frames — logging goes
 *   to stderr;
 * - every result carries { schemaVersion, cli, registry };
 * - a failed fetch becomes an MCP tool error, never a process crash;
 * - no model calls inside tool implementations.
 */

import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { runAdd } from "../commands/add.js";
import { CSS_IMPORT_LINES, TSCONFIG_ALIAS } from "../commands/init.js";
import { runInspect } from "../commands/inspect.js";
import { runSearch } from "../commands/search.js";
import { loadCommonsConfig, resolveRegistry } from "../config.js";
import { type CliError } from "../output.js";
import { registryItemSchema, type RegistryIndexEntry } from "../registry/schema.js";
import { CLI_VERSION } from "../version.js";

/** Schema version stamped on every MCP tool result. */
export const MCP_RESULT_SCHEMA_VERSION = "1";

/** The exact command that installs components for real (the MCP server never does). */
const ADD_COMMAND_PREFIX = "npx @21stgov/commons add";

/** `commons init` invocation returned by get_setup and plan_install notes. */
const INIT_COMMAND = "npx @21stgov/commons init";

/** Version fields present on every successful tool result. */
const versionShape = {
  schemaVersion: z
    .literal(MCP_RESULT_SCHEMA_VERSION)
    .describe("Version of this tool-result shape"),
  cli: z.string().describe("@21stgov/commons package version that produced this result"),
  registry: z.string().describe("Registry base URL this result was resolved against"),
};

/** One catalog entry as returned by search_components. */
const searchResultSchema = z.object({
  name: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  useWhen: z.array(z.string()).optional(),
  avoidWhen: z.array(z.string()).optional(),
  framework: z.string().optional(),
});

type SearchResult = z.infer<typeof searchResultSchema>;

function optionalStringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string")
    ? (value as string[])
    : undefined;
}

/** Project the (forward-compatible, loose) catalog entry onto the result shape. */
function toSearchResult(entry: RegistryIndexEntry): SearchResult {
  return {
    name: entry.name,
    title: entry.title,
    description: entry.description,
    status: entry.status,
    useWhen: entry.useWhen,
    avoidWhen: optionalStringArray(entry["avoidWhen"]),
    framework: typeof entry["framework"] === "string" ? entry["framework"] : undefined,
  };
}

interface ToolErrorResult {
  [key: string]: unknown;
  isError: true;
  content: Array<{ type: "text"; text: string }>;
}

/**
 * Turn a CLI failure into an MCP tool error (same taxonomy and message
 * format as the CLI's stderr line). Never throws, never exits.
 */
function toolError(error: CliError): ToolErrorResult {
  return {
    isError: true,
    content: [{ type: "text", text: `error [${error.code}]: ${error.message}` }],
  };
}

interface ToolOkResult<T extends Record<string, unknown>> {
  [key: string]: unknown;
  content: Array<{ type: "text"; text: string }>;
  structuredContent: T;
}

/** Successful tool result: structured content plus a JSON text mirror. */
function toolResult<T extends Record<string, unknown>>(payload: T): ToolOkResult<T> {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
}

export interface McpServerOptions {
  /** Project directory used to resolve commons.json (like --cwd). */
  cwd: string;
}

/**
 * Build the Commons MCP server with its four read-only tools. Does not
 * connect a transport — see {@link startMcpServer} for stdio, or wire
 * an in-memory transport in tests.
 */
export function buildMcpServer(options: McpServerOptions): McpServer {
  const baseCwd = resolve(options.cwd);

  const server = new McpServer(
    { name: "commons", version: CLI_VERSION },
    {
      instructions:
        "Read-only tools over the Commons design-system registry " +
        "(accessibility-first components for U.S. local governments, https://commonsui.com). " +
        "Use search_components to discover, get_component to inspect a contract, " +
        "plan_install to preview exactly what an install would do (nothing is ever " +
        "written), and get_setup for project setup facts. Installation itself is the " +
        `job of the local CLI: "${ADD_COMMAND_PREFIX} <names>".`,
    },
  );

  server.registerTool(
    "search_components",
    {
      title: "Search Commons components",
      description:
        "Search the Commons registry catalog ({registry}/index.json) with the same " +
        "case-insensitive matching as `commons search`: the query is matched against " +
        "each entry's name, title, description, and useWhen lines. An empty result " +
        "list means no match — it is not an error.",
      inputSchema: {
        query: z
          .string()
          .min(1)
          .max(200)
          .describe("Search term, e.g. a task ('collect a date') or a component name"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .default(10)
          .describe("Maximum number of results to return (1-50, default 10)"),
      },
      outputSchema: {
        ...versionShape,
        results: z.array(searchResultSchema),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ query, limit }) => {
      const result = await runSearch({ cwd: baseCwd, term: query });
      if (!result.ok) {
        return toolError(result.error);
      }
      return toolResult({
        schemaVersion: MCP_RESULT_SCHEMA_VERSION,
        cli: CLI_VERSION,
        registry: result.data.registry,
        results: result.data.results.slice(0, limit).map(toSearchResult),
      });
    },
  );

  server.registerTool(
    "get_component",
    {
      title: "Get a Commons component contract",
      description:
        "Fetch and validate one registry item ({registry}/{name}.json), exactly like " +
        "`commons inspect`. Returns the full registry-item v1 JSON: description, " +
        "status, useWhen/avoidWhen, files (with inline content), npm and registry " +
        "dependencies, accessibility contract, compatibility, integrity hashes, and — " +
        "for the non-React path — the framework-agnostic `.cui-*` HTML markup in `html`.",
      inputSchema: {
        name: z
          .string()
          .min(1)
          .max(200)
          .describe("Component name from the registry, e.g. 'button'"),
      },
      outputSchema: {
        ...versionShape,
        item: registryItemSchema,
      },
      annotations: { readOnlyHint: true },
    },
    async ({ name }) => {
      const result = await runInspect({ cwd: baseCwd, name });
      if (!result.ok) {
        return toolError(result.error);
      }
      const registry = resolveRegistryOrDefault(baseCwd);
      return toolResult({
        schemaVersion: MCP_RESULT_SCHEMA_VERSION,
        cli: CLI_VERSION,
        registry,
        item: result.data,
      });
    },
  );

  server.registerTool(
    "plan_install",
    {
      title: "Plan a Commons install (dry run)",
      description:
        "Build the exact same dry-run plan as `commons add <names> --dry-run`: which " +
        "files would be written / conflict / be skipped, which npm dependencies the " +
        "components need, and the install command for the project's package manager. " +
        "This tool NEVER writes files — run the returned `command` with the local CLI " +
        "to actually install.",
      inputSchema: {
        names: z
          .array(z.string().min(1).max(200))
          .min(1)
          .max(20)
          .describe("Component names to plan, e.g. ['button', 'banner']"),
        cwd: z
          .string()
          .min(1)
          .max(4096)
          .optional()
          .describe(
            "Project directory to plan against (absolute, or relative to the " +
              "server's working directory). Defaults to the server's working directory.",
          ),
      },
      outputSchema: {
        ...versionShape,
        items: z
          .array(z.string())
          .describe("Every resolved item in installation (topological) order"),
        files: z.array(
          z.object({
            path: z.string(),
            action: z.enum(["write", "conflict", "skip"]),
            item: z.string(),
          }),
        ),
        dependencies: z.array(z.string()).describe("npm dependencies the items need"),
        packageManager: z.enum(["pnpm", "yarn", "npm", "bun"]),
        installCommand: z
          .string()
          .nullable()
          .describe("Dependency install command to run manually, or null if none needed"),
        command: z
          .string()
          .describe("The exact CLI command that performs this install for real"),
        note: z.string().optional(),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ names, cwd }) => {
      const planCwd = resolve(baseCwd, cwd ?? ".");
      const result = await runAdd({
        cwd: planCwd,
        names,
        dryRun: true, // never writes
        overwrite: false,
      });
      if (!result.ok) {
        return toolError(result.error);
      }
      const uniqueNames = [...new Set(names)];
      const note = existsSync(join(planCwd, "commons.json"))
        ? undefined
        : `No commons.json found in ${planCwd}; this plan uses the default paths. ` +
          `Run "${INIT_COMMAND}" in the project first.`;
      return toolResult({
        schemaVersion: MCP_RESULT_SCHEMA_VERSION,
        cli: CLI_VERSION,
        registry: result.data.registry,
        items: result.data.items,
        files: result.data.files,
        dependencies: result.data.dependencies,
        packageManager: result.data.packageManager,
        installCommand: result.data.installCommand,
        command: `${ADD_COMMAND_PREFIX} ${uniqueNames.join(" ")}`,
        note,
      });
    },
  );

  server.registerTool(
    "get_setup",
    {
      title: "Get Commons project setup facts",
      description:
        "Return the facts needed to set up Commons in a project: the resolved " +
        "registry URL, the five global-CSS import lines in their required order, the " +
        "tsconfig path alias, and the init command. Mirrors what `commons init` prints.",
      outputSchema: {
        ...versionShape,
        registryUrl: z.string(),
        cssImports: z
          .array(z.string())
          .describe("Add these lines to the project's global CSS file, in this exact order"),
        tsconfigAlias: z
          .string()
          .describe('Add under compilerOptions.paths in tsconfig.json (use ["./*"] without src)'),
        initCommand: z.string(),
      },
      annotations: { readOnlyHint: true },
    },
    async () => {
      let registryUrl: string;
      try {
        registryUrl = resolveRegistry(loadCommonsConfig(baseCwd));
      } catch (error) {
        return toolError({
          code: "INVALID_CONFIG",
          message: error instanceof Error ? error.message : String(error),
        });
      }
      return toolResult({
        schemaVersion: MCP_RESULT_SCHEMA_VERSION,
        cli: CLI_VERSION,
        registry: registryUrl,
        registryUrl,
        cssImports: [...CSS_IMPORT_LINES],
        tsconfigAlias: TSCONFIG_ALIAS,
        initCommand: INIT_COMMAND,
      });
    },
  );

  return server;
}

/**
 * Registry base URL for result metadata; config problems fall back to
 * the default rather than failing a lookup that already succeeded.
 */
function resolveRegistryOrDefault(cwd: string): string {
  try {
    return resolveRegistry(loadCommonsConfig(cwd));
  } catch {
    return resolveRegistry({ config: {}, source: "defaults" });
  }
}

/**
 * Start the stdio MCP server and keep serving until the client
 * disconnects (stdin end). All logging goes to stderr; stdout carries
 * only MCP protocol frames.
 */
export async function startMcpServer(options: McpServerOptions): Promise<void> {
  const server = buildMcpServer(options);

  // A closed stdin means the MCP client is gone: exit cleanly instead of
  // lingering as an orphaned process.
  process.stdin.on("end", () => {
    process.exit(0);
  });

  await server.connect(new StdioServerTransport());
  process.stderr.write(
    `commons mcp: read-only Commons MCP server listening on stdio (cli ${CLI_VERSION})\n`,
  );
}
