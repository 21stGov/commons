---
"@21stgov/commons": minor
"@21stgov/commons-core": minor
"@21stgov/commons-css": minor
"@21stgov/commons-js": minor
"@21stgov/commons-react": minor
"@21stgov/commons-tokens": minor
"@21stgov/commons-fonts": minor
---

`commons add --install` installs the components' npm dependencies for you.

When a component pulls npm dependencies (e.g. a Base UI–backed interactive
component needs `@base-ui/react`), the CLI still prints the exact install
command by default — but now `commons add <name> --install` runs it with your
detected package manager (pnpm/yarn/npm/bun), and on an interactive terminal
the CLI offers to install them for you. `--json` and `--dry-run` never install
or prompt, so the machine interface and script use are unchanged. The package
manager's output is routed to stderr so a `--json` stdout stays a single clean
envelope.
