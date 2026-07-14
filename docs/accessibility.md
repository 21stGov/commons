# Accessibility North Star

This is the standard every component and every page must meet. It is deliberately stricter than USWDS.

## The bar

- **Legal floor for our users:** WCAG 2.1 AA (2024 ADA Title II rule for state/local government). Deadlines were extended in 2026: **Apr 26, 2027** for populations ≥50,000; **Apr 26, 2028** for <50,000 and special districts. The rule covers web pages, mobile apps, online forms, electronic documents, and multimedia.
- **Our enforced baseline:** **WCAG 2.2 AA** — every one of the 9 new 2.2 success criteria is built into components.
- **Our AAA defaults (differentiators):** 44px touch targets (2.5.5), 7:1 high-contrast theme (1.4.6), enhanced focus appearance (2.4.13), passkey-first accessible auth (3.3.9).
- **Harmonization:** designing to 2.2 AA also positions us for **Section 508** and **EN 301 549 v4** (EU, WCAG 2.2).
- **WCAG 3.0:** still a Working Draft (2026). Watch it; do **not** gate on it.

## WCAG 2.2's new AA criteria (all built-in)
| SC | Requirement |
|---|---|
| 2.4.11 Focus Not Obscured | Focused element never fully hidden by sticky headers/cookie bars (use `scroll-margin`). |
| 2.5.7 Dragging Movements | Every drag has a single-pointer (click/tap) alternative. |
| 2.5.8 Target Size (Min) | Pointer targets ≥ 24×24px (we default to 44px). |
| 3.2.6 Consistent Help | Help mechanisms in consistent relative order across pages. |
| 3.3.7 Redundant Entry | Don't force re-entering info already provided in a flow. |
| 3.3.8 Accessible Authentication | No cognitive-function test to log in; allow paste; support password managers/passkeys. |

## Handled by default (not opt-in) — this is how we beat USWDS
- **Forced colors** (`forced-colors: active`): use CSS System Colors, always give interactive elements a border (transparent borders show in forced colors), inline SVG with `currentColor` (background-image icons vanish). Every component tested in Windows High Contrast Mode.
- **`prefers-contrast: more`**: a distinct enhanced-contrast token set.
- **`prefers-reduced-motion`**: decorative animation neutralized in base styles.
- **`prefers-reduced-transparency`**: reduce backdrop blur / translucency.
- **Reflow**: usable at 320px width / 400% zoom, no 2D scrolling. Fluid, single-column-capable layouts.
- **Resize text**: `rem`/`em` only — never `px` for font size; respect the user's root font-size.
- **Text spacing**: no clipping when users override line-height/letter/word spacing.
- **Touch targets**: 44px default hit area on mobile.

## Keyboard & ARIA (APG-conformant)
- Native HTML first (`<button>`, `<a>`, `<dialog>`, `<details>`); ARIA only to fill gaps. Browsers give ARIA widgets **no** keyboard behavior — we implement it.
- `Tab` moves between widgets; **arrow keys move within** composite widgets (roving tabindex or `aria-activedescendant`).
- Every interactive widget follows its [APG pattern](https://www.w3.org/WAI/ARIA/apg/patterns/) keyboard contract (tabs, combobox, dialog, menu, slider, accordion, grid, tree, etc.).
- **Name / Role / Value** (WCAG 4.1.2) correct for every control — verified in the accessibility tree, not just the DOM.
- **Focus management**: `:focus-visible` rings (≥2px, ≥3:1 contrast), skip link as first focusable element, landmark regions, single `<h1>` + no skipped heading levels, focus moved to new view on SPA route change and returned to trigger on dialog close.
- **Live regions**: `aria-live`/`role=status`/`role=alert` for validation errors, toasts, async results; container present in DOM before content is injected.

## Color & contrast
- Text 4.5:1 (3:1 large); UI components & focus indicators 3:1 (1.4.11).
- Never convey meaning by color alone (1.4.1) — pair with text/icon/underline. **Links in body text are underlined.**
- Color grades encode contrast (USWDS-style "magic number": grade delta predicts WCAG pass). We may use **APCA internally** to pick better colors, but ship only colors that also pass WCAG 2 — APCA is **not** a standard and must not be labeled "WCAG 3."

## Cognitive accessibility & plain language (vital for all-citizen audiences)
- Follow W3C COGA "Making Content Usable" — clear structure, familiar patterns, help users avoid/fix errors, support memory, minimize distraction.
- Target **6th–8th grade reading level**; provide content guidance and ideally readability linting.
- Consistent navigation/placement, predictable behavior, clear error identification + suggestions, generous timeouts, autosave/undo.

## Internationalization
- **Logical properties only** (`margin-inline-start`, `inset-inline-end`, `text-align: start`) — lint against physical sides. One codebase serves LTR + RTL.
- Mirror directional icons (arrows/chevrons) in RTL; never mirror logos/media controls/numerals.
- All strings translation-keyed (ICU MessageFormat for plurals/gender); budget +30–100% text expansion; pseudolocalization in CI.
- `Intl` APIs for all date/number/currency/list formatting.
- `lang` on any element whose language differs from the page.

## Testing pyramid (enforced in CI)
1. **Static:** `eslint-plugin-jsx-a11y` on every commit.
2. **Component:** `vitest-axe` + Storybook a11y addon on every component **and every variant/state** (incl. RTL + forced-colors).
3. **E2E:** Playwright + `@axe-core/playwright` on page templates and full flows.
4. **Manual + AT:** keyboard-only walkthroughs; **NVDA+Firefox, JAWS+Chrome, VoiceOver+Safari (macOS + iOS), TalkBack+Chrome**; forced-colors + 400% zoom + text-spacing passes. Adopt the **Section 508 ICT Testing Baseline / DHS Trusted Tester** scripts as acceptance criteria.
5. **Inclusive user testing:** real users with disabilities on key flows.
6. **Per-component VPAT (2.5, 508 edition)**, continuously updated — beating USWDS by keeping it per-component and current.

> Automated tools catch only ~57% of issues. Automation gates the build; manual AT testing is non-negotiable before any component is "done."

## Key references
- WCAG 2.2: https://www.w3.org/TR/WCAG22/ · Understanding: https://www.w3.org/WAI/WCAG22/Understanding/
- ARIA APG: https://www.w3.org/WAI/ARIA/apg/
- ADA Title II + 2026 extension: https://www.ada.gov/resources/small-entity-compliance-guide/ · https://www.federalregister.gov/documents/2026/04/20/2026-07663/
- Section 508 ICT Baseline: https://ictbaseline.access-board.gov/web-baselines/
- COGA: https://www.w3.org/TR/coga-usable/ · Plain language: https://www.plainlanguage.gov/
- USWDS accessibility (benchmark): https://designsystem.digital.gov/documentation/accessibility/
