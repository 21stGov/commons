# Commons

> The public design system local government deserves.

Commons is an open-source, accessibility-first design system for U.S. local
governments. It combines a rigorous token foundation, first-class React
components, framework-agnostic CSS, and an own-your-code registry—so public
institutions can build services that work for everyone and keep the source they
depend on.

**A [21st Gov](https://21stgov.com) project, built in public.**

[Website](https://commonsui.com) ·
[Components](https://commonsui.com/docs/components) ·
[Accessibility](docs/accessibility.md) ·
[Architecture](docs/architecture.md) ·
[Platform support](docs/platform-support.md) ·
[Government adoption](docs/government-adoption.md) ·
[AI and agents](docs/ai-and-agents.md) ·
[Contributing](CONTRIBUTING.md) ·
[Releasing](RELEASING.md)

---

## Public software deserves better defaults

People should not need a new device, a particular browser, perfect vision,
precise motor control, English fluency, or deep technical confidence to use a
public service.

Commons is built around a stronger contract:

- **Accessible by default.** WCAG 2.2 AA is the enforced baseline, with selected
  AAA defaults: 44px touch targets, a dedicated high-contrast theme, visible
  focus everywhere, forced-colors support, reduced motion, text enlargement, and
  bidirectional (RTL) layouts. Every component ships a normative accessibility
  contract as data, and passes an automated axe test suite.
- **Owned by the institution.** The Commons CLI copies understandable component
  source into a government’s repository instead of hiding essential interfaces
  behind a proprietary runtime. What you install is what you own.
- **Modern without being fragile.** React components use Base UI primitives;
  the CSS and token core remains useful without React.
- **Built for public service.** Government identity, forms, long-lived systems,
  translation, plain language, and constrained municipal teams are the use case—not
  an afterthought.
- **Useful to humans and agents.** The same tested source powers visual docs,
  machine-readable component manifests, deterministic JSON CLI output, and a
  read-only MCP server — all generated from one registry. AI support is never
  required to use Commons.

## The system

| Layer  | Package                   | What it provides                                                   |
| ------ | ------------------------- | ------------------------------------------------------------------ |
| Tokens | `@21stgov/commons-tokens` | DTCG token sources compiled to CSS variables and JSON              |
| Core   | `@21stgov/commons-core`   | Framework-agnostic reset, foundations, and accessibility utilities |
| React  | `@21stgov/commons-react`  | Accessible components built on Base UI                             |
| Fonts  | `@21stgov/commons-fonts`  | Self-hosted Atkinson Hyperlegible Next + Mono variable fonts       |
| CLI    | `@21stgov/commons`        | Own-your-code registry workflow, plus a read-only MCP server       |

The consumer workflow is simple:

```sh
npx @21stgov/commons init          # write commons.json + the CSS import lines
npx @21stgov/commons add button    # copy the component source into your repo
```

`add` writes the component (and its dependencies) into your project and prints
the exact files it touched. It never runs a package manager for you — it reports
the npm dependencies to install so nothing happens to your tree without your
say-so.

## What's included

Commons ships today:

- **80+ accessible React components** — forms, overlays, navigation, data,
  government-specific patterns (gov banner, identifier, memorable date,
  language selector) — each with tests, an axe suite, a docs page, and a
  registry entry. Built on Base UI primitives.
- **DTCG tokens** for color, type, spacing, focus, motion, elevation,
  breakpoints, radii, and z-index, with light, dark, and dedicated
  high-contrast themes and automated contrast validation.
- **A framework-agnostic CSS core** — reset, base layer, and accessibility
  utilities — usable with zero React (PHP, Drupal, WordPress, .NET, or any
  server-rendered stack).
- **The CLI** (`init`, `add`, `search`, `inspect`) with a versioned `--json`
  machine interface, plus a read-only **MCP server** (`commons mcp`) so agents
  can search, inspect, and plan installs against the same registry.
- **A fully static docs site, registry, and playground** — no third-party CDN,
  font service, or model API required. Every page has a Markdown mirror and the
  whole project is mapped for agents at `/llms.txt`.

## Develop Commons

Requires Node.js 24 and pnpm 10 for development (`.nvmrc` pins the major;
published packages support Node 22 or newer). Windows, Linux, and macOS are all
first-class development platforms. Install pnpm using an
[official supported method](https://pnpm.io/installation); the repository pins
the expected version in `package.json`.

```sh
pnpm install
pnpm build
pnpm test
pnpm validate:contrast
```

Useful workspace commands:

```sh
pnpm lint
pnpm typecheck
pnpm changeset
```

## Architecture

```text
packages/tokens   DTCG source → CSS variables + resolved JSON
       ↓
packages/core     framework-agnostic foundations
       ↓
packages/react    Base UI behavior + Commons public-service patterns
       ↓
registry          portable component source + metadata
       ↓
packages/cli      source copied into the government’s repository
```

Documentation and registry assets are designed to ship at the edge on
Cloudflare. A backend is not required for the core design-system workflow.

Read the **[architecture overview](docs/architecture.md)** for system boundaries,
data flows, deployment models, and shared responsibilities. The
**[government-adoption documentation plan](docs/government-adoption.md)** maps
the technical, accessibility, security, procurement, and legal materials an
agency may need to evaluate and adopt Commons. The
**[platform-support research](docs/platform-support.md)** defines how we
keep Cloudflare-first development portable across agency infrastructure and
Windows, Linux, and macOS workstations.

## AI-native, human-first

Commons is unusually easy to understand with a browser, a terminal, or an
agent—without maintaining three conflicting versions of the truth. Clean
Markdown mirrors, structured component contracts, deterministic JSON CLI output,
and a public read-only MCP server are all generated from the same registry.

Read more in **[AI-native Commons](docs/ai-and-agents.md)**.

## Build with us

Commons is company-stewarded by 21st Gov and developed in the open. Government
teams, accessibility practitioners, designers, developers, educators, and
residents are invited to help shape it.

Start with [CONTRIBUTING.md](CONTRIBUTING.md), then review the
[component definition of done](docs/conventions/components.md) before changing public UI.
Every component contribution is expected to include its behavior,
accessibility contract, examples, tests, and documentation—not just its pixels.

## Versioning

Commons follows [semantic versioning](https://semver.org). We are **pre-1.0**:
the API is still stabilizing, every component is published as `experimental`,
and `0.x` minor releases may include breaking changes — pin an exact version if
you need stability. This is an early release; think 0.1, not 1.0.

The road to 1.0 runs through the accessibility work that is not finished yet:
manual screen-reader testing and inclusive user testing, tracked per component
in the `screenReadersTested` field of its registry contract. A component
graduates from `experimental` to `stable` when that verification lands, and
Commons reaches **1.0** when the core set is stable and the public API has
settled.

## Prior art and acknowledgments

Commons stands on a great deal of excellent work.

**Prior art.** Two ideas shape Commons directly: the
[U.S. Web Design System](https://designsystem.digital.gov)'s discipline around
accessible, contrast-checked design tokens, and
[shadcn/ui](https://ui.shadcn.com)'s own-your-code distribution model — a
registry plus CLI that copies component *source* into your repository rather
than hiding it behind a versioned black-box dependency. Commons is a fork of
neither; it is a new, government-focused system that learns from both. Some
`class-variance-authority` variant shapes are adapted from shadcn/ui (MIT), with
attribution headers in the source files that use them.

**Open source we build on.** Thank you to the maintainers of:

- [Base UI](https://base-ui.com) — the unstyled, accessible React primitives behind most interactive components
- [Tailwind CSS](https://tailwindcss.com) — the utility engine and token bridge
- [Atkinson Hyperlegible](https://www.brailleinstitute.org/freefont/), by the Braille Institute of America — typefaces designed for low-vision legibility
- [react-day-picker](https://daypicker.dev) and [Embla Carousel](https://www.embla-carousel.com) — calendar and carousel behavior
- [class-variance-authority](https://cva.style), [clsx](https://github.com/lukeed/clsx), and [tailwind-merge](https://github.com/dcastil/tailwind-merge) — variant and class utilities
- [citty](https://github.com/unjs/citty), [zod](https://zod.dev), and the [Model Context Protocol SDK](https://modelcontextprotocol.io) — the CLI and MCP server
- [Fumadocs](https://fumadocs.dev), [Next.js](https://nextjs.org), and [Orama](https://orama.com) — the documentation site and its static search
- [axe-core](https://github.com/dequelabs/axe-core), [Vitest](https://vitest.dev), and [Testing Library](https://testing-library.com) — the accessibility and test harness

**Third-party licenses.** Every dependency keeps its own license in
`node_modules` and in our lockfile. Two deserve explicit mention: the Atkinson
Hyperlegible font files in `packages/fonts` are licensed under the
[SIL Open Font License 1.1](packages/fonts/LICENSE.txt) — separate from
Commons' MIT license — and shadcn/ui-derived code carries per-file MIT
attribution. Commons itself is MIT.

## AI disclosure

**AI-assisted, human accountable.** We use tools including OpenAI Codex and
Anthropic Claude Code to assist with research, implementation, testing, and
review. People remain responsible for requirements, judgment, security,
accessibility, and approval. Automation may build, test, and deploy approved
changes; AI does not independently decide what reaches production.

## Project facts

- **Repository:** `21stgov/commons`
- **npm scope:** `@21stgov`
- **Website:** [commonsui.com](https://commonsui.com)
- **License:** [MIT](LICENSE). The Atkinson Hyperlegible font files contained
  in `packages/fonts` are licensed separately under the
  [SIL Open Font License, Version 1.1](packages/fonts/LICENSE.txt),
  regardless of the license used by the design system.
- **Steward:** [21st Gov](https://21stgov.com)

Public institutions outlast frameworks, vendors, and administrations. Commons
is being built accordingly.
