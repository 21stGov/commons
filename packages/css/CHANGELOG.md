# @21stgov/commons-css

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
