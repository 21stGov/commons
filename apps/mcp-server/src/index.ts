// SPDX-License-Identifier: MIT

/**
 * The hosted Commons MCP server (Cloudflare Worker).
 *
 * A remote, read-only Model Context Protocol server over the live Commons
 * registry (commonsui.com/r). Any MCP client can connect with zero local
 * install — no CLI, no project on disk:
 *   Streamable HTTP → https://mcp.commonsui.com/mcp
 *   legacy SSE       → https://mcp.commonsui.com/sse
 *
 * It exposes the same registry operations as the local `commons mcp` server,
 * built on the shared, Workers-safe registry core (@21stgov/commons/registry),
 * so search results and the registry contract never drift between the two.
 * Tool logic lives in tools.ts; this file is only the MCP/transport wiring.
 *
 * Read-only: no tool writes anything. A failed registry fetch becomes an MCP
 * tool error, never a crash. Installing for real is the job of the local CLI
 * (`npx @21stgov/commons add <names>`).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";

import { DEFAULT_REGISTRY, registryItemSchema } from "@21stgov/commons/registry";

import {
  ADD_COMMAND_PREFIX,
  getComponent,
  getSetup,
  planInstall,
  RESULT_SCHEMA_VERSION,
  searchComponents,
} from "./tools.js";

/** This Worker's own version (kept in sync with package.json). */
const SERVER_VERSION = "0.1.0";
/** The live registry every tool resolves against — no per-project config here. */
const REGISTRY = DEFAULT_REGISTRY;

interface Env {
  MCP_OBJECT: DurableObjectNamespace;
}

// --- result helpers ---------------------------------------------------------

function ok<T extends Record<string, unknown>>(payload: T) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
}

function toolError(code: string, message: string) {
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: `error [${code}]: ${message}` }],
  };
}

/** Map any thrown value to the registry error taxonomy (NOT_FOUND, NETWORK, …). */
function errorInfo(error: unknown): { code: string; message: string } {
  if (error && typeof error === "object" && "code" in error && "message" in error) {
    return {
      code: String((error as { code: unknown }).code),
      message: String((error as { message: unknown }).message),
    };
  }
  return { code: "ERROR", message: error instanceof Error ? error.message : String(error) };
}

/** Run a tool body, mapping a thrown registry error to an MCP tool error. */
async function guard<T extends Record<string, unknown>>(body: () => Promise<T> | T) {
  try {
    return ok(await body());
  } catch (error) {
    const { code, message } = errorInfo(error);
    return toolError(code, message);
  }
}

const versionShape = {
  schemaVersion: z.literal(RESULT_SCHEMA_VERSION),
  registry: z.string(),
};

const searchResultShape = {
  name: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  useWhen: z.array(z.string()).optional(),
};

// --- the MCP agent (Durable Object) -----------------------------------------

export class CommonsMcp extends McpAgent<Env> {
  server = new McpServer(
    { name: "commons", version: SERVER_VERSION },
    {
      instructions:
        "Read-only tools over the Commons design-system registry (accessibility-first " +
        "components for U.S. local governments, https://commonsui.com). Use " +
        "search_components to discover, get_component to inspect a component's contract, " +
        "plan_install to see what an install would pull in, and get_setup for project " +
        "setup facts. This server never writes files — installing is the job of the local " +
        `CLI: "${ADD_COMMAND_PREFIX} <names>".`,
    },
  );

  async init(): Promise<void> {
    this.server.registerTool(
      "search_components",
      {
        title: "Search Commons components",
        description:
          "Search the Commons registry catalog (commonsui.com/r/index.json) with the same " +
          "case-insensitive matching as `commons search`: the query is matched against each " +
          "entry's name, title, description, and useWhen lines. An empty result list means no " +
          "match — it is not an error.",
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
        outputSchema: { ...versionShape, results: z.array(z.object(searchResultShape)) },
        annotations: { readOnlyHint: true },
      },
      ({ query, limit }) => guard(() => searchComponents(REGISTRY, query, limit)),
    );

    this.server.registerTool(
      "get_component",
      {
        title: "Get a Commons component contract",
        description:
          "Fetch and validate one registry item (commonsui.com/r/{name}.json), exactly like " +
          "`commons inspect`. Returns the full registry-item v1 JSON: description, status, " +
          "useWhen/avoidWhen, files (with inline content), npm and registry dependencies, the " +
          "accessibility contract, compatibility, and integrity hashes.",
        inputSchema: {
          name: z.string().min(1).max(200).describe("Component name from the registry, e.g. 'button'"),
        },
        outputSchema: { ...versionShape, item: registryItemSchema },
        annotations: { readOnlyHint: true },
      },
      ({ name }) => guard(() => getComponent(REGISTRY, name)),
    );

    this.server.registerTool(
      "plan_install",
      {
        title: "Plan a Commons install",
        description:
          "Resolve one or more components and their transitive registryDependencies from the " +
          "registry, in installation order, and report every file that would be created and " +
          "every npm dependency needed. This server has no project on disk, so it reports the " +
          "registry file paths and cannot detect conflicts — run the returned `command` with " +
          "the local CLI to actually write files (mapped to your commons.json paths).",
        inputSchema: {
          names: z
            .array(z.string().min(1).max(200))
            .min(1)
            .max(20)
            .describe("Component names to plan, e.g. ['button', 'gov-banner']"),
        },
        outputSchema: {
          ...versionShape,
          items: z.array(z.string()).describe("Every resolved item in installation (topological) order"),
          files: z.array(z.object({ path: z.string(), type: z.string(), item: z.string() })),
          dependencies: z.array(z.string()).describe("npm dependencies the items need"),
          command: z.string().describe("The exact CLI command that performs this install for real"),
          note: z.string(),
        },
        annotations: { readOnlyHint: true },
      },
      ({ names }) => guard(() => planInstall(REGISTRY, names)),
    );

    this.server.registerTool(
      "get_setup",
      {
        title: "Get Commons project setup facts",
        description:
          "Return the facts needed to set up Commons in a project: the registry URL, the five " +
          "global-CSS import lines in their required order, the tsconfig path alias, and the init " +
          "command. Mirrors what `commons init` prints.",
        outputSchema: {
          ...versionShape,
          registryUrl: z.string(),
          cssImports: z
            .array(z.string())
            .describe("Add these lines to the project's global CSS file, in this exact order"),
          tsconfigAlias: z.string().describe("Add under compilerOptions.paths in tsconfig.json"),
          initCommand: z.string(),
        },
        annotations: { readOnlyHint: true },
      },
      () => guard(() => getSetup(REGISTRY)),
    );
  }
}

// --- Worker entry: route MCP transports, else a human landing page ----------

const LANDING = `Commons MCP server

The hosted Model Context Protocol server for the Commons design system
(accessibility-first components for U.S. local governments).

Connect an MCP client:
  Streamable HTTP  https://mcp.commonsui.com/mcp
  legacy SSE       https://mcp.commonsui.com/sse

Tools (all read-only): search_components, get_component, plan_install, get_setup.
Docs: https://commonsui.com   Registry: https://commonsui.com/r
`;

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Response | Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/mcp") {
      return CommonsMcp.serve("/mcp").fetch(request, env, ctx);
    }
    if (pathname === "/sse" || pathname === "/sse/message") {
      return CommonsMcp.serveSSE("/sse").fetch(request, env, ctx);
    }
    if (pathname === "/" || pathname === "/health") {
      return new Response(LANDING, { headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    return new Response("Not found", { status: 404 });
  },
};
