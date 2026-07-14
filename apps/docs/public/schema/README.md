# Commons JSON schemas

The JSON Schema documents behind the `$schema` URLs that registry items, the
catalog, CLI `--json` output, and consumer `commons.json` files declare:

- `https://commonsui.com/schema/registry-item.v1.json`
- `https://commonsui.com/schema/catalog.v1.json`
- `https://commonsui.com/schema/cli-output.v1.json`
- `https://commonsui.com/schema/commons.json`

**These `.json` files are generated at build time** (`apps/docs/scripts/generate.ts`
→ `packages/cli/src/schemas.ts`) from the CLI's own zod schemas, so the published
contract can never drift from the code that validates it. Do not hand-edit them;
they are git-ignored. Only this README is tracked.

The `v1` documents are treated as versioned and stable: a breaking change to the
contract ships under a new `v2` URL rather than mutating these in place.
