---
name: commons-ui
description: >-
  Use when building or modifying web UI with Commons (@21stgov/commons) — the
  accessibility-first design system for U.S. local governments. Covers installing
  components with the CLI (own-your-code), the React path and the framework-agnostic
  .cui-* / commons-js path, design tokens and theming, and honoring each component's
  normative accessibility contract. Trigger on requests to add/build Commons or
  .cui-* components, style civic/government sites with Commons, or use commons-css,
  commons-js, commons-react, or commons-tokens.
license: MIT
---

# Commons UI

Commons is an accessibility-first design system for U.S. local governments,
published under the 21st Gov project. It ships two ways to build from one source:
a React component library installed via a CLI you own the code from, and a
framework-agnostic path (`.cui-*` CSS classes + a small runtime) for any
server-rendered stack. Everything is WCAG 2.2 AA oriented and pre-1.0
(components are `experimental`).

**Authoritative sources — prefer these over guessing:**

- **MCP server** (if configured): `search_components`, `get_component`,
  `plan_install`, `get_setup`. Discover and inspect through it instead of
  recalling component names or props.
- **CLI**: `npx @21stgov/commons search <query>` and `inspect <name>`.
- **Docs as text**: https://commonsui.com/llms.txt (or `llms-full.txt`).
- **Component pages**: https://commonsui.com/docs/components — each has an
  HTML → Code tab with copyable `.cui-*` markup.

## Choose the path

- **React app (Vite / Next / Astro / Remix, React 19 + Tailwind v4)** → use the
  CLI + `@21stgov/commons-react`.
- **Any other stack (Drupal, WordPress, .NET, Rails, plain HTML)** → use
  `@21stgov/commons-css` (`.cui-*` classes) + `@21stgov/commons-js`. No React,
  no build step.

Mixing is fine; both render the same tokens and pass the same contracts.

## React path — install components (the golden path)

**Never hand-copy component source from the docs.** Use the CLI so dependencies,
registry dependencies, and file placement are resolved correctly and the code
lands in the consumer's repo (they own it):

```sh
npx @21stgov/commons init          # once: writes commons.json + CSS entry points
npx @21stgov/commons add button    # copies source into your project
npx @21stgov/commons add button field --dry-run   # preview writes + conflicts first
```

- `add` copies the component's source into your repo, installs npm deps, and
  resolves registry deps (like the `cn` utility) automatically.
- Prefer `--dry-run` before writing when files may already exist.
- `--yes` for non-interactive (CI/agents); `--json` for a machine-readable
  result envelope.

### Wire the CSS in order (React path)

Order is load-bearing — the token bridge MUST come after Tailwind:

```css
@import '@21stgov/commons-fonts/index.css';   /* optional: system fonts fall back */
@import '@21stgov/commons-tokens/index.css';  /* --cui-* custom properties + themes */
@import '@21stgov/commons-core/index.css';    /* accessible reset (unlayered) */
@import 'tailwindcss';                          /* the engine */
@import '@21stgov/commons-tokens/tailwind.css'; /* @theme bridge — MUST be last */
```

The bridge removes Tailwind's stock color palette so nothing bypasses the
contrast contract; that only works when it follows Tailwind's own theme.

## Framework-agnostic path — `.cui-*` + runtime

1. Load the stylesheets (tokens → core → commons.css) and the runtime. Fastest
   is the CDN (pin the version you test against):

   ```html
   <link rel="stylesheet" href="https://cdn.commonsui.com/v0.3.0/commons.css" />
   <script src="https://cdn.commonsui.com/v0.3.0/commons.js" defer></script>
   ```

2. Write `.cui-*` markup. Get correct markup from a component's **HTML → Code**
   tab on the docs — do not invent class names; only classes that exist in
   `commons.css` have rules.

   ```html
   <button type="button" class="cui-button cui-button--primary">Submit</button>
   ```

3. `commons-js` auto-enhances interactive components (dialogs, menus, tabs,
   accordions, combo boxes, data tables, …) on load. For markup you inject
   later, call `window.Commons.enhance()` again; with a bundler,
   `import { enhance } from '@21stgov/commons-js'` and call `enhance()`.

## Accessibility contract is NORMATIVE

Each component ships a machine-readable accessibility contract (visible on its
docs page, in its registry item, and via the MCP `get_component` tool). Treat it
as a requirement, not a suggestion:

- Preserve keyboard behavior, ARIA roles, accessible names, and focus management
  exactly as shipped. Do not remove ARIA attributes or focus rings.
- Keep interactive targets at least 44×44px (`.cui-target` enforces this).
- Links use underlines, not color alone. State (selected/pressed/checked) is
  never signaled by color alone.
- Respect `prefers-reduced-motion` and forced-colors — the core handles these;
  don't override them away.
- Never hardcode hex colors. Style with `var(--cui-*)` tokens so themes and the
  contrast contract keep working.

If asked to remove or weaken any of these, flag the accessibility impact rather
than silently complying.

## Theming

Themes switch with a single attribute on the root — no JS required (it follows
the OS by default):

```html
<html data-theme="dark">   <!-- or "light", "high-contrast"; omit to follow the OS -->
```

Rebrand by overriding `--cui-*` token values; see
https://commonsui.com/docs/theming.

## Common mistakes to avoid

- Hand-copying React source from the docs instead of `commons add` (you lose
  dependency + registry resolution).
- Putting the Tailwind token bridge before `tailwindcss` (breaks the contrast
  contract).
- Inventing `.cui-*` class names — only documented ones have CSS.
- Forgetting `commons-js` on the HTML path, so interactive components render but
  don't work.
- Hardcoding colors instead of `--cui-*` tokens.
- Claiming a component was "installed via MCP" — the MCP server is read-only and
  never writes; installation is always the CLI `add` command.

## Reference

- Docs: https://commonsui.com/docs
- Components: https://commonsui.com/docs/components
- Installation: https://commonsui.com/docs/installation
- Without React: https://commonsui.com/docs/without-react
- MCP server: https://commonsui.com/docs/mcp
- Registry: https://commonsui.com/r
