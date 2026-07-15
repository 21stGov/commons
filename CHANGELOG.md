# Changelog

All notable, user-facing changes to Commons are recorded here. This is the
curated changelog for the whole system; the machine-generated per-package
histories live in each package's own `CHANGELOG.md`.

Commons is **pre-1.0** — every component ships `experimental`, and `0.x` minor
releases may include breaking changes. See
[RELEASING.md](https://github.com/21stgov/commons/blob/main/RELEASING.md) for the
versioning policy. The format follows [Keep a Changelog](https://keepachangelog.com).

## 0.3.1 — 2026-07-15

### Fixed

- **Components crashed React Server Components consumers (Next.js App
  Router).** Component sources that use client-only React APIs (hooks,
  `createContext`) did not declare `'use client'`, so importing components like
  Button, Card, Header, or GovBanner into a Server Component failed the
  consumer's build with "createContext is not a function". All 54 affected
  sources now carry the directive — shipped through both the CLI
  copy-into-your-repo path and the registry — and the bundled
  `@21stgov/commons-react` build re-declares the boundary with a
  `"use client"` banner, since bundlers strip per-file directives. A test gate
  now fails the suite if a component ever uses a client-only API without
  declaring the boundary. Found dogfooding the
  [Commons Town](https://github.com/21stGov/commons-town) starter template on
  launch day.

## 0.3.0 — 2026-07-15

### Added

- **A framework-agnostic component layer** — the components now run in any
  stack (Drupal, WordPress, .NET, Rails, plain HTML) with no React and no build
  step, via two new public packages:
  - **`@21stgov/commons-css`** — `commons.css`, the full set of `.cui-*`
    component classes. It is generated from the same React components' `cva`
    configs, so the vanilla markup looks 1:1 with the React output rather than
    drifting from it.
  - **`@21stgov/commons-js`** — a small progressive-enhancement runtime.
    `enhance()` wires the interactive behaviors (dialogs, menus, tabs,
    accordions, carousels, data tables, comboboxes, and ~40 more) onto `.cui-*`
    markup; a `<script>` build (`@21stgov/commons-js/global`) auto-enhances the
    page with no code. See [Using Commons without React](https://commonsui.com/docs/without-react).
- **React ⇄ HTML documentation.** Component pages carry a global framework
  preference (beside the theme switcher) that reshapes the demo, its copyable
  code, and the Installation / Usage sections for React or framework-agnostic
  HTML — the same component, both ways, from one source.
- **A first-party CDN.** The framework-agnostic assets are served from
  `cdn.commonsui.com` at immutable, versioned paths, so the HTML path needs no
  npm install and no build step: link `commons.css` and `commons.js` (plus an
  optional self-contained `fonts.css`) and go. See
  [Installation](https://commonsui.com/docs/installation).
- **Drupal and WordPress integration guides.** Copy-paste wiring for the way
  each platform loads assets — a Drupal `libraries.yml` + `attach_library`, a
  WordPress `wp_enqueue` must-use plugin — plus downloadable starter files. See
  [Using Commons without React](https://commonsui.com/docs/without-react).

### Fixed

- The framework-agnostic spinner rendered a doubled, wobbling animation: the
  icon's size/spin `cva` collided on name with its wrapper's `data-slot` in the
  `.cui-*` CSS generator, so both elements spun and the icon lost its square
  box. The generator now emits the icon styles under `.cui-spinner-icon`.

## 0.2.0 — 2026-07-14

### Added

- **`@21stgov/commons/registry` subpath export** — the Workers-safe registry
  core (fetch client, schemas, transitive-dependency resolver, and search
  matcher), so the registry contract can be consumed outside the Node CLI.
- **A hosted MCP server** built on that registry core, letting AI assistants
  query Commons — components, public APIs, and accessibility contracts —
  directly. See [MCP server](https://commonsui.com/docs/mcp).

## 0.1.0 — 2026-07-13

The first public pre-release. All five packages
(`@21stgov/commons-tokens`, `-core`, `-react`, `-fonts`, and the CLI
`@21stgov/commons`) ship together at `0.1.0`.

### Added

- **~85 accessible React components** on [Base UI](https://base-ui.com)
  primitives — full parity with Base UI's primitive surface plus
  government-specific and utility components. By area:
  - **Forms & inputs** — field, input, textarea, select, custom select, combo
    box, checkbox, checkbox group, radio group, switch, toggle, toggle group,
    slider, number field, input OTP, input group, input mask, date picker, date
    range picker, time picker, memorable date, character count, file input,
    form, validation, language selector.
  - **Actions & feedback** — button, button group, alert, alert dialog, dialog,
    drawer, toast, tooltip, progress, meter, spinner, skeleton, empty state,
    badge, site alert.
  - **Overlays & disclosure** — popover, hover card, accordion, collapsible,
    dropdown menu, context menu, menubar, command palette, scroll area,
    resizable panels.
  - **Navigation** — navigation menu, sidebar, in-page navigation, breadcrumb,
    pagination, tabs, link, step indicator, process list, toolbar, kbd.
  - **Data & layout** — data table, table, card, collection, list, item, icon,
    icon list, avatar, aspect ratio, carousel, calendar, separator, prose.
  - **Civic identity** — gov banner, identifier, header, footer.

  Each component ships tests, an [axe](https://github.com/dequelabs/axe-core)
  suite, a docs page, and a machine-readable registry contract.

- **Design tokens** (`@21stgov/commons-tokens`) — DTCG sources compiled to
  `--cui-*` CSS custom properties for color, type, spacing, focus, motion,
  elevation, breakpoints, radii, and z-index, with **light, dark, and dedicated
  high-contrast themes** and automated contrast validation (1,755 checks).

- **Framework-agnostic CSS core** (`@21stgov/commons-core`) — a modern
  accessible reset, base element styles, a skip link, screen-reader utilities,
  global focus rings, forced-colors hardening, and 44px targets. Works with zero
  React (PHP, Drupal, WordPress, .NET, Java, or any server-rendered stack) — see
  [Using Commons without React](https://commonsui.com/docs/without-react).

- **Self-hosted fonts** (`@21stgov/commons-fonts`) — Atkinson Hyperlegible Next
  and Mono variable fonts, no font CDN.

- **The CLI** (`@21stgov/commons`) — `init`, `add`, `search`, and `inspect`,
  with a versioned `--json` machine interface and stable exit codes, plus a
  read-only **Model Context Protocol server** (`commons mcp`) so agents can
  search, inspect, and plan installs against the same registry. `add` copies
  component source into your project and never runs a package manager for you.

- **A fully static docs site, registry, and playground** — no third-party CDN,
  font service, or model API required. Every page has a Markdown mirror and the
  whole project is mapped for agents at `/llms.txt`.

### Accessibility

- WCAG 2.2 AA is the enforced baseline, with selected AAA defaults: 44px touch
  targets, visible focus everywhere, forced-colors support, reduced motion, text
  enlargement, and bidirectional (RTL) layouts.
- **Not verified yet:** no component has completed manual screen-reader testing
  or inclusive user testing. This is tracked per component in the
  `screenReadersTested` field of its registry contract and is the gate for
  graduating a component from `experimental` to `stable`.
