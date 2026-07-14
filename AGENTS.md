# Commons repository guidance

## Product constraints

- Accessibility is part of the architecture. Preserve the requirements in
  `docs/accessibility.md` and the component definition of done in
  `docs/conventions/components.md`.
- Commons is Cloudflare-first, not Cloudflare-only. Keep tokens, CSS, React
  components, registry artifacts, and the CLI free of required Cloudflare
  runtime bindings. Provider-specific code belongs in deployment adapters or
  applications.
- Windows, Linux, and macOS are first-class development and CLI platforms. Do
  not use WSL as the only Windows path.

## Cross-platform implementation

- Keep primary `pnpm`, `npx`, and Commons CLI commands valid in PowerShell,
  Command Prompt, Bash, and Zsh.
- Use Node.js APIs for project automation instead of POSIX-only shell commands.
- Use `node:path`, `node:fs`, `node:os`, file URLs, and argument-array process
  spawning. Do not concatenate path separators, assume `/tmp`, or interpolate
  untrusted arguments into a shell command.
- Test paths with spaces and Unicode, CRLF and LF inputs, case collisions,
  Windows-reserved names, and attempts to escape the project root.
- Do not depend on executable bits, symbolic links, Homebrew, GNU-only flags,
  Bash, or a global package-manager install unless the requirement is explicit
  and an equivalent supported path is documented.
- When commands differ by shell, label PowerShell, Command Prompt, and Bash/Zsh
  examples separately. Use portable relative paths and `<project-root>` in
  shared documentation.

Read `docs/platform-support.md` before changing the CLI, registry,
build pipeline, release artifacts, or deployment documentation.

## Verification

Run the checks relevant to the change. For repository-wide changes, use:

```text
pnpm build
pnpm test
pnpm typecheck
pnpm lint
pnpm validate:contrast
```

Do not describe a platform or provider as tested unless automated or recorded
manual evidence exists. Use the support levels defined in
`docs/platform-support.md`.
