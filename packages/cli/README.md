# @21stgov/commons

The Commons CLI. Adds accessible, government-ready components from the
[Commons](https://commonsui.com) design system registry to your project —
the same way you would with shadcn, but tuned for U.S. local government
needs (WCAG 2.2 AA baseline, high-contrast theme layer, gov patterns).

## Usage

```sh
# Set up Commons in your project (creates commons.json)
npx @21stgov/commons init --yes

# Search the registry catalog
npx @21stgov/commons search date

# Inspect one component's contract before installing
npx @21stgov/commons inspect button

# Preview exactly what add would do, without writing anything
npx @21stgov/commons add button --dry-run

# Add a component (and its registry dependencies) to your project
npx @21stgov/commons add button

# Add several at once; replace locally changed files explicitly
npx @21stgov/commons add button alert banner --overwrite
```

Every command accepts `--cwd <dir>` to operate on another project
directory, and `--json` for the machine interface described below.

## Machine interface (`--json`)

Built for scripts, CI, and AI agents. With `--json`, every command prints
**exactly one** JSON envelope to stdout; diagnostics go to stderr:

```json
{
  "$schema": "https://commonsui.com/schema/cli-output.v1.json",
  "schemaVersion": "1",
  "cli": "0.1.0",
  "command": "add",
  "ok": true,
  "data": {
    "registry": "https://commonsui.com/r",
    "items": ["cn", "button"],
    "files": [{ "path": "src/lib/cn.ts", "action": "write", "item": "cn" }],
    "dependencies": ["clsx", "tailwind-merge"],
    "packageManager": "pnpm",
    "installCommand": "pnpm add clsx tailwind-merge",
    "dryRun": false,
    "written": 2
  }
}
```

On failure the envelope carries `"ok": false` and
`"error": { "code": "...", "message": "..." }` instead of `data`. This
holds even for argument/usage errors (missing arguments, unknown
subcommands): stdout gets the envelope (`"command": "unknown"` when no
valid subcommand could be resolved), help text and diagnostics go to
stderr, exit code 1.

Stable exit codes:

| Code | Meaning                                                             |
| ---- | ------------------------------------------------------------------- |
| 0    | Success                                                              |
| 1    | User error or conflict (bad input, existing files, config problems)  |
| 2    | Network or registry error (unreachable, 404, HTTP failure, bad JSON) |
| 3    | Validation error (schema mismatch, integrity mismatch, unsafe paths) |

## How `add` works

1. Loads `commons.json` from `--cwd` (defaults to the current directory).
2. Fetches each item from `{registry}/{name}.json` and resolves
   `registryDependencies` recursively (cycle-safe, deduplicated,
   dependencies installed first).
3. Verifies sha256 `integrity` hashes when the item carries them
   (mismatch, or a file missing from the integrity map → exit 3, nothing
   written).
4. Rejects unsafe file paths — absolute paths, `..` segments, drive
   letters, UNC paths, Windows-reserved device names (`CON`, `NUL`,
   `COM1`, …), segments with trailing dots or spaces, or anything
   resolving outside the project root, including through symlinks
   (exit 3, nothing written).
5. Pre-flights every destination **before writing a single file**:
   files that already match are skipped; files that differ are conflicts.
   Any conflict without `--overwrite` aborts with exit 1 and zero writes,
   as does any pair of files whose destinations collide case-insensitively.
6. Writes files by type: `registry:ui` → `paths.ui`, `registry:lib` →
   `paths.lib`, everything else → `paths.components` (basename only).
7. Prints the dependency install command for your package manager
   (detected from the lockfile; default pnpm). Pass `--install` to run it
   for you (or accept the prompt the CLI offers on an interactive terminal).

`--dry-run` performs steps 1–5 and reports the full plan without writing.

## Configuration

`commons init --yes` writes a `commons.json` in your project root:

```json
{
  "$schema": "https://commonsui.com/schema/commons.json",
  "registry": "https://commonsui.com/r",
  "paths": {
    "ui": "src/components/ui",
    "components": "src/components",
    "lib": "src/lib"
  },
  "theme": "light"
}
```

- `registry` — base URL the CLI fetches `{name}.json` registry items and
  the `index.json` catalog from. Point this at a private or
  agency-specific registry if you run one.
- `paths` — where component files land, by registry file type. Projects
  without a `src` directory get `components/ui`, `components`, and `lib`.
- `theme` — default theme layer (`light`, `dark`, or `high-contrast`).

`init` refuses to overwrite an existing `commons.json` unless you pass
`--force`.

## MCP server (`commons mcp`)

`commons mcp` runs a **local, read-only** MCP server over stdio, exposing
the registry to MCP clients (Claude Code, Cursor, VS Code, Codex):

- `search_components` — search the catalog (same matching as `commons search`)
- `get_component` — one component's full registry-item v1 JSON
- `plan_install` — the exact `commons add --dry-run` plan; never writes
- `get_setup` — registry URL, CSS import lines, tsconfig alias, init command

Every result carries `schemaVersion`, the CLI package version, and the
registry URL it was resolved against. The registry comes from
`commons.json` in `--cwd` (default: the current directory), then the
`COMMONS_REGISTRY` environment variable, then the public default.
Installing is still the local CLI's job — the server returns the exact
`npx @21stgov/commons add <names>` command instead of writing files.

Configure a client with:

```sh
npx @21stgov/commons mcp init                    # Claude Code -> .mcp.json
npx @21stgov/commons mcp init --client cursor    # -> .cursor/mcp.json
npx @21stgov/commons mcp init --client vscode    # -> .vscode/mcp.json
npx @21stgov/commons mcp init --client codex     # prints ~/.codex/config.toml snippet
```

Existing config files are merged, never clobbered; a differing `commons`
entry is refused unless you pass `--force`.

## Registry format

Items are served as static JSON at `{registry}/{name}.json` and the
searchable catalog at `{registry}/index.json`. The item schema follows
the open shadcn registry format (MIT) — see `src/registry/schema.ts` —
with Commons additions: required inline `files[].content`, a first-class
`high-contrast` group in `cssVars`, and optional `status`, `useWhen`,
`avoidWhen`, `compatibility`, `accessibility`, `integrity`, and `version`
metadata. Unknown fields never fail validation (forward compatibility).

## Development

```sh
pnpm build      # tsup -> dist/index.js (ESM, shebang)
pnpm test       # vitest run
pnpm typecheck  # tsc --noEmit
```

## License

MIT © 21st Gov
