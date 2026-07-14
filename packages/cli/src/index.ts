// SPDX-License-Identifier: MIT

import process from "node:process";
import { defineCommand, runCommand, runMain } from "citty";
import { formatAdd, runAdd } from "./commands/add.js";
import { formatInit, initNextSteps, runInit } from "./commands/init.js";
import { formatInspect, runInspect } from "./commands/inspect.js";
import { codexGuidance, formatMcpInit, runMcpInit } from "./commands/mcp.js";
import { formatSearch, runSearch } from "./commands/search.js";
import { startMcpServer } from "./mcp/server.js";
import {
  EXIT,
  buildEnvelope,
  failure,
  type CliResult,
  type CommandName,
  type EnvelopeCommand,
} from "./output.js";
import { CLI_VERSION } from "./version.js";

const pkg = { version: CLI_VERSION };

/**
 * Print a command result and set the process exit code.
 *
 * `--json` mode prints exactly one JSON envelope to stdout; human mode
 * prints the formatted result to stdout and errors to stderr. Either way
 * the stable exit codes apply: 0 ok, 1 user/conflict, 2 network/registry,
 * 3 validation.
 */
function emit<T>(
  command: CommandName,
  result: CliResult<T>,
  json: boolean,
  format: (data: T) => string,
): void {
  if (json) {
    process.stdout.write(`${JSON.stringify(buildEnvelope(command, pkg.version, result))}\n`);
  } else if (result.ok) {
    console.log(format(result.data));
  } else {
    console.error(`error [${result.error.code}]: ${result.error.message}`);
  }
  process.exitCode = result.exitCode;
}

const sharedArgs = {
  cwd: {
    type: "string",
    description: "Project directory to operate in (default: current directory)",
  },
  json: {
    type: "boolean",
    description: "Print a single versioned JSON envelope to stdout (diagnostics go to stderr)",
    default: false,
  },
} as const;

function resolveCwd(cwd: string | undefined): string {
  return cwd !== undefined && cwd.length > 0 ? cwd : process.cwd();
}

const init = defineCommand({
  meta: {
    name: "init",
    description: "Set up Commons in this project (creates commons.json)",
  },
  args: {
    ...sharedArgs,
    yes: {
      type: "boolean",
      alias: "y",
      description: "Write commons.json with the defaults, without prompting",
      default: false,
    },
    force: {
      type: "boolean",
      description: "Overwrite an existing commons.json",
      default: false,
    },
  },
  run({ args }) {
    const result = runInit({
      cwd: resolveCwd(args.cwd),
      yes: args.yes,
      force: args.force,
    });
    emit("init", result, args.json, formatInit);
    if (!args.json && result.ok && result.data.written) {
      console.error(initNextSteps());
    }
  },
});

const add = defineCommand({
  meta: {
    name: "add",
    description: "Add component(s) from the Commons registry to your project",
  },
  args: {
    ...sharedArgs,
    component: {
      type: "positional",
      description: "One or more component names from the registry (e.g. button)",
      valueHint: "component...",
      required: true,
    },
    "dry-run": {
      type: "boolean",
      description: "Resolve and print the full plan without writing anything",
      default: false,
    },
    overwrite: {
      type: "boolean",
      description: "Replace existing files that differ from the registry version",
      default: false,
    },
  },
  async run({ args }) {
    const result = await runAdd({
      cwd: resolveCwd(args.cwd),
      names: args._,
      dryRun: args["dry-run"],
      overwrite: args.overwrite,
    });
    emit("add", result, args.json, formatAdd);
  },
});

const search = defineCommand({
  meta: {
    name: "search",
    description: "Search the Commons registry catalog",
  },
  args: {
    ...sharedArgs,
    term: {
      type: "positional",
      description: "Search term (matched against name, title, description, useWhen)",
      required: true,
    },
  },
  async run({ args }) {
    const result = await runSearch({
      cwd: resolveCwd(args.cwd),
      term: args.term,
    });
    emit("search", result, args.json, formatSearch);
  },
});

const inspect = defineCommand({
  meta: {
    name: "inspect",
    description: "Fetch and validate one registry item, and show its contract",
  },
  args: {
    ...sharedArgs,
    name: {
      type: "positional",
      description: "Component name from the registry (e.g. button)",
      required: true,
    },
  },
  async run({ args }) {
    const result = await runInspect({
      cwd: resolveCwd(args.cwd),
      name: args.name,
    });
    emit("inspect", result, args.json, formatInspect);
  },
});

const mcpInit = defineCommand({
  meta: {
    name: "init",
    description: "Configure an MCP client to launch the Commons MCP server",
  },
  args: {
    ...sharedArgs,
    client: {
      type: "string",
      description: "MCP client to configure: claude, cursor, vscode, or codex",
      default: "claude",
    },
    force: {
      type: "boolean",
      description: 'Replace an existing "commons" server entry that differs',
      default: false,
    },
  },
  run({ args }) {
    const result = runMcpInit({
      cwd: resolveCwd(args.cwd),
      client: args.client,
      force: args.force,
    });
    emit("mcp", result, args.json, formatMcpInit);
    if (!args.json && result.ok && result.data.client === "codex") {
      console.error(codexGuidance());
    }
  },
});

const mcp = defineCommand({
  meta: {
    name: "mcp",
    description: "Run the local read-only Commons MCP server over stdio",
  },
  args: {
    // Declared so citty knows --cwd takes a value (its value must not be
    // mistaken for a subcommand name).
    cwd: sharedArgs.cwd,
  },
  subCommands: { init: mcpInit },
  async run({ args }) {
    // citty invokes the parent `run` even after dispatching a subcommand;
    // only start the server when `commons mcp` was called bare.
    if (args._.length > 0) {
      return;
    }
    await startMcpServer({ cwd: resolveCwd(args.cwd) });
  },
});

const main = defineCommand({
  meta: {
    name: "commons",
    version: pkg.version,
    description:
      "Commons — an accessibility-first design system for U.S. local governments (https://commonsui.com)",
  },
  subCommands: { init, add, search, inspect, mcp },
});

const SUBCOMMAND_NAMES: readonly CommandName[] = ["init", "add", "search", "inspect", "mcp"];

/** Best-effort subcommand for the envelope of a usage-error failure. */
function envelopeCommandFromArgv(argv: string[]): EnvelopeCommand {
  const first = argv.find((arg) => !arg.startsWith("-"));
  return SUBCOMMAND_NAMES.find((name) => name === first) ?? "unknown";
}

/** Strip ANSI escape sequences (citty colorizes parse-error messages). */
function stripAnsi(text: string): string {
  return text.replace(/\u001B\[[0-9;]*m/g, "");
}

const argv = process.argv.slice(2);
if (argv.includes("-v") || argv.includes("--version")) {
  console.log(pkg.version);
  process.exit(0);
}

if (argv.includes("--json")) {
  // The --json stdout contract must hold even for argument/usage errors,
  // which citty's runMain would otherwise print as ANSI help on stdout.
  try {
    await runCommand(main, { rawArgs: argv });
  } catch (error) {
    const message = stripAnsi(error instanceof Error ? error.message : String(error));
    const result = failure(EXIT.USER, "USAGE", message);
    console.error(`error [USAGE]: ${message}`);
    process.stdout.write(
      `${JSON.stringify(buildEnvelope(envelopeCommandFromArgv(argv), pkg.version, result))}\n`,
    );
    process.exitCode = result.exitCode;
  }
} else {
  await runMain(main);
}
