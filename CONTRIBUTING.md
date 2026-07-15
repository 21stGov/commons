# Contributing to Commons

Thanks for helping build an accessibility-first design system for U.S. local governments.

By participating in this project, you agree to uphold our
[Code of Conduct](CODE_OF_CONDUCT.md).

## Development setup

Requires Node >= 20 and pnpm 10 (`corepack enable` recommended).

```sh
pnpm install
pnpm build
```

Other useful commands:

```sh
pnpm test               # run tests across the workspace
pnpm lint               # lint all packages
pnpm typecheck          # typecheck all packages
pnpm validate:contrast  # verify token color grades meet contrast guarantees
```

## Accessibility definition of done

Accessibility is the product, not a checklist item. Every component change must meet the
accessibility definition of done described in [docs/conventions/components.md](docs/conventions/components.md)
before it can merge — WCAG 2.2 AA baseline, keyboard operability, visible focus, forced-colors
and reduced-motion support, and zero new axe violations.

## Platform portability

Windows, Linux, and macOS are first-class Commons development and CLI
platforms. Cloudflare is the reference deployment for Commons-operated services,
but the packages, registry, and static artifacts must remain portable to agency
infrastructure.

Before contributing to the CLI, registry, build pipeline, release artifacts, or
deployment documentation, read
[docs/platform-support.md](docs/platform-support.md). In
particular:

- do not add POSIX-only commands to the primary project workflow;
- use portable Node.js path, filesystem, temporary-directory, and process APIs;
- include Windows filesystem, spaces, Unicode, and line-ending cases in relevant
  tests;
- label shell-specific examples and provide PowerShell/Command Prompt and
  Bash/Zsh equivalents; and
- do not claim a platform or provider is tested without corresponding evidence.

## Releasing changes (Changesets)

We use [Changesets](https://github.com/changesets/changesets) for versioning:

1. Make your change in a branch.
2. Run `pnpm changeset` and describe the change (patch/minor/major per package).
3. Commit the generated `.changeset/*.md` file with your PR.
4. On merge to `main`, the release workflow versions and publishes affected packages.
