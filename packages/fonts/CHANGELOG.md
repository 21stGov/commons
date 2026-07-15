# @21stgov/commons-fonts

## 0.3.1

### Patch Changes

- Declare the `'use client'` boundary so components work in React Server
  Components consumers (Next.js App Router). Every component source that uses
  client-only React APIs (hooks, `createContext`) now carries the directive —
  54 files — so both the CLI copy-into-your-repo path and the registry ship
  RSC-safe source, and the bundled `@21stgov/commons-react` build re-declares
  the boundary with a `"use client"` banner (esbuild strips per-file directives
  when bundling). Previously, importing components like Button, Card, Header, or
  GovBanner into a Server Component crashed the consumer's build with
  "createContext is not a function". A new test gate fails the suite if a
  component ever uses a client-only API without declaring the directive.

## 0.2.0

### Minor Changes

- 386b478: Add the `@21stgov/commons/registry` subpath export — the Workers-safe registry
  core (fetch client, schemas, transitive-dependency resolver, and search
  matcher), so the registry contract can be consumed outside the Node CLI. This
  powers the new hosted MCP server (mcp.commonsui.com), which reuses the exact
  same code path as `commons search` / `commons mcp` so results never drift.
- a7b4f47: Add automated keyboard-verification evidence to the accessibility contract. Each
  registry item's `accessibility` block gains a `keyboardVerified` flag, backed by
  a coverage gate that refuses to let a component claim it without a passing
  keyboard test. 80 of 81 components are keyboard-verified at this release (only
  scroll-area remains — its focusable-viewport behavior needs a real browser to
  verify), and the docs surface the status per component.

## 0.1.0

### Minor Changes

- First public pre-release (0.1.0). Everything ships `experimental` on the road to
  1.0. Includes ~80 accessible React components with full Base UI parity, DTCG
  tokens with light/dark/high-contrast themes and validated contrast, a
  framework-agnostic CSS core, self-hosted Atkinson Hyperlegible fonts, and the
  own-your-code CLI with a read-only MCP server.
