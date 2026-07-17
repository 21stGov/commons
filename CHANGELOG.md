# Changelog

All notable, user-facing changes to Commons are recorded here. This is the
curated changelog for the whole system; the machine-generated per-package
histories live in each package's own `CHANGELOG.md`.

Commons is **pre-1.0** — every component ships `experimental`, and `0.x` minor
releases may include breaking changes. See
[RELEASING.md](https://github.com/21stgov/commons/blob/main/RELEASING.md) for the
versioning policy. The format follows [Keep a Changelog](https://keepachangelog.com).

## 0.6.0 — 2026-07-16

### Added

- **`ThemeImage`.** A seal or logo drawn for a light page often disappears on a
  dark one — and a white mark vanishes in high contrast, which is light-based.
  `ThemeImage` takes up to three sources (`light`, `dark`, `highContrast`) and
  shows exactly the one matching the active theme: an explicit `data-theme`
  wins, with `prefers-color-scheme` / `prefers-contrast` fallbacks for the
  system setting. Omit a variant to reuse another, so a single `light` works
  everywhere. The swap is plain CSS in `@21stgov/commons-core`
  (`.cui-theme-image` rules mirroring the token themes' own selectors), so the
  identical markup works on the framework-agnostic path.

### Changed

- **`HeaderNavigationMenu` is responsive — and data-driven** (breaking,
  pre-1.0). It now takes a single `items` array (direct links or grouped
  panels) instead of composed `NavigationMenu*` parts. From `md` up it renders
  the floating mega-menu as before; below `md` it renders an inline accordion
  of native `<details>` — tapping a section expands its links in place and
  pushes the page down, instead of floating a desktop-style panel over a phone
  layout. Only one presentation is ever in the accessibility tree, and every
  part carries a `data-slot`, so the framework-agnostic path gets the same
  presentation via generated `.cui-header-navigation-menu-*` classes.
- **`Collection` media sits beside the content at every width.** A calendar
  date or thumbnail is narrow enough for a phone — stacking it on its own row
  just made every item taller. The media column hugs its content (a calendar
  date stays a snug chip) and images get a fixed thumbnail width, so a large
  photo can't blow the column out.

### Fixed

- **Header divider collision.** With the mobile menu open, the nav's top
  divider sat flush against the menu button's border; the header's wrap row
  now has a row gap.
- **Generated CSS honors core-owned classes.** `cui-*` tokens on React
  components (like `ThemeImage`'s) pass through to the framework-agnostic
  output verbatim instead of being treated as unknown Tailwind utilities.
- **Framework-agnostic navigation-menu parity.** On the HTML path, the open
  trigger's border and its chevron rotation now fire (the `commons-js`
  enhancer sets `data-popup-open`, matching React's Base UI state instead of
  only toggling `aria-expanded`), and a plain top-level bar link now shares the
  trigger's border-based styling rather than the panel link's underline (its
  own `navigation-menu-bar-link` slot — a cva that dresses more than one slot
  now emits `.cui-*` classes under each). The same fix corrects the
  pagination direction modifier.
- **Header mobile menu button on the framework-agnostic path.** `commons-js`
  now enhances the Header's disclosure — the menu button toggles the primary
  nav (via the `hidden` attribute, so the nav's own `md:block` / `md:hidden`
  still win at `md`+), flips its glyph, and closes on Escape. Previously the
  button was inert without React.
- **Vertical `Separator`.** In a horizontal toolbar the framework-agnostic
  vertical separator stretched across the whole row instead of drawing a thin
  line — the generator folds a cva's default variant (here `horizontal`, which
  is `w-full`) into the base class, and the vertical variant now resets the
  width so it can't inherit it.

## 0.5.0 — 2026-07-15

### Added

- **`commons add --install`.** When a component pulls npm dependencies — e.g. a
  Base UI–backed interactive component like `navigation-menu` needs
  `@base-ui/react` — the CLI still prints the exact install command by default,
  but `commons add <name> --install` now runs it with your detected package
  manager (pnpm/yarn/npm/bun), and on an interactive terminal the CLI offers to
  install for you. `--json` and `--dry-run` never install or prompt, so the
  machine interface is unchanged.

## 0.4.0 — 2026-07-15

### Added

- **Sticky page regions.** The gov banner, header, and site alert can each be
  made sticky — `sticky` prop in React, `data-cui-sticky` on the framework-
  agnostic path. When more than one is sticky they **stack** instead of
  overlapping: each is pinned below the cumulative height of the sticky regions
  before it (a sticky header sits under a sticky banner, a sticky emergency
  alert under both). Coordinated by the new `useStickyOffset` hook and the
  `enhanceSticky` runtime behavior in `@21stgov/commons-js`.
- **Identifier seal.** The agency identifier band takes an optional decorative
  seal/logo at its right edge — a `seal` prop in React, an `identifier-seal`
  slot in the framework-agnostic markup.
- **Header mega-menus.** A new **`HeaderNavigationMenu`** drops a full
  `NavigationMenu` (mega-menu panels, grouped links, submenus) into a `Header`
  in place of `HeaderNav`: below `md` it collapses behind the menu button and is
  `aria-controls`-wired exactly like the built-in nav; inline from `md` up. It is
  built on a new exported **`useHeaderMenu()`** hook (returns the nav id the menu
  button controls and whether the nav is collapsed), so you can also wire a
  custom navigation region into the Header's disclosure by hand.

### Fixed

- **Visited-link color leaked across the whole UI.** `a:visited` was declared
  outside `@layer base` in the core reset, so — unlayered — it beat every
  component's own text color and painted visited nav items, button-styled links,
  and identifier links on the dark band the "visited" purple. That is an
  accessibility problem on buttons (color carrying state) and on colored bands
  (contrast). It now lives inside the layer, so only content links (the `Link`
  component and prose) show a visited state.
- The site title no longer underlines on hover — it is an identity mark, not a
  body link.
- A full-bleed `SiteAlert` now aligns its content to the same width as the gov
  banner, header, and footer, instead of a narrower reading measure, so it lines
  up with the rest of the page out of the box.
- Footer links no longer show a visited state — a footer is navigation.
- **`NavigationMenu` bar items showed a doubled line.** A current or open
  top-level item painted a text underline *and* a block-end border — two faint
  parallel lines. The block-end border is now the single affordance across
  hover, current, and open (matching `HeaderNavLink`), so there is only ever one
  line. `HeaderNavLink` got the same treatment (it shared the latent bug).
- **`NavigationMenu` mega-menu panel links read as body links.** Panel links
  showed the blue link color, a persistent underline, and a purple visited tint
  — but they are navigation, not content. They now take the subtle nav-link
  treatment: inherit the panel text color, underline on hover only, no visited
  state.

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
