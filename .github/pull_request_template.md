## Summary

<!-- What changed, why it changed, and who benefits? Link the issue with "Closes #123" when applicable. -->

## Verification

<!-- List the automated checks and recorded manual tests performed. Do not describe a platform, browser, or assistive technology as tested without evidence. -->

```text
pnpm build
pnpm test
pnpm typecheck
pnpm lint
pnpm validate:contrast
```

## Accessibility

<!-- Explain what was tested or why the change has no user-facing accessibility effect. Component changes must satisfy docs/conventions/components.md. -->

- [ ] Keyboard behavior and visible focus are correct, or not applicable.
- [ ] Accessible name, role, value, states, and relationships are correct, or not applicable.
- [ ] Automated accessibility tests cover affected variants and states, or not applicable.
- [ ] Forced-colors, reduced-motion, zoom/reflow, RTL, and target-size impacts were considered.
- [ ] Important visual evidence includes an equivalent text description.

## Portability and distribution

- [ ] The change keeps Windows, Linux, and macOS support intact, or the impact is documented.
- [ ] Primary commands remain usable from PowerShell, Command Prompt, Bash, and Zsh, or are not affected.
- [ ] Framework-agnostic packages and artifacts do not require Cloudflare runtime bindings.
- [ ] Registry fragments, generated artifacts, schemas, examples, and documentation are synchronized where relevant.

## Release

- [ ] A Changeset is included for publishable package changes, or no Changeset is needed.
- [ ] Breaking behavior, migration guidance, and deprecations are documented where relevant.

## Contributor confirmation

- [ ] I reviewed and understand every submitted change, including AI-assisted work.
- [ ] I did not include secrets, personal information, resident data, or other sensitive material.
