# @21stgov/commons-fonts

## 0.5.0

### Minor Changes

- f723733: `commons add --install` installs the components' npm dependencies for you.

  When a component pulls npm dependencies (e.g. a Base UI–backed interactive
  component needs `@base-ui/react`), the CLI still prints the exact install
  command by default — but now `commons add <name> --install` runs it with your
  detected package manager (pnpm/yarn/npm/bun), and on an interactive terminal
  the CLI offers to install them for you. `--json` and `--dry-run` never install
  or prompt, so the machine interface and script use are unchanged. The package
  manager's output is routed to stderr so a `--json` stdout stays a single clean
  envelope.

## 0.4.0

### Minor Changes

- Banner/header/alert polish and a sticky-region API.

  Fixed:

  - The visited-link color leaked onto everything. `a:visited` was declared
    outside `@layer base` in the core reset, so — unlayered — it beat every
    component's own text color and painted visited nav items, button-styled
    links, and on-emphasis (identifier) links the "visited" purple: an
    accessibility problem on buttons and colored bands. Moved inside the layer, so
    only opted-in content links (Link, prose) show the visited state.
  - The site title no longer underlines on hover (it is an identity mark, not a
    body link).
  - `SiteAlert` now aligns its content to the same width as the gov banner,
    header, and footer (`max-w-5xl`) instead of a narrower reading measure, so a
    full-bleed alert lines up with the rest of the page out of the box.
  - Footer links no longer show a visited state — a footer is navigation, not
    content.

  Added:

  - **Sticky page regions.** `GovBanner`, `Header`, and `SiteAlert` take a
    `sticky` prop; the framework-agnostic path uses `data-cui-sticky` +
    `commons.css`. When more than one is sticky they _stack_ rather than overlap —
    each pinned below the cumulative height of the sticky regions before it —
    coordinated by the new `useStickyOffset` hook (React) and `enhanceSticky`
    behavior (`@21stgov/commons-js`).
  - **Identifier seal.** `Identifier` takes an optional `seal` prop (React) /
    `identifier-seal` slot (HTML) for a decorative logo at the right of the band.

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
