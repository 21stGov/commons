---
"@21stgov/commons": minor
"@21stgov/commons-tokens": minor
"@21stgov/commons-core": minor
"@21stgov/commons-react": minor
"@21stgov/commons-fonts": minor
---

Add the `@21stgov/commons/registry` subpath export — the Workers-safe registry
core (fetch client, schemas, transitive-dependency resolver, and search
matcher), so the registry contract can be consumed outside the Node CLI. This
powers the new hosted MCP server (mcp.commonsui.com), which reuses the exact
same code path as `commons search` / `commons mcp` so results never drift.
