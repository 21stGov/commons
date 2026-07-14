# @21stgov/commons-tokens

Design tokens for **Commons**, the accessibility-first design system for U.S. local governments. DTCG JSON sources → Style Dictionary → CSS custom properties (`--cui-*`) + resolved JSON.

## The grade contract (the whole point)

Every color is named `{family}.{grade}` (families: gray, blue, indigo, cyan, green, gold, orange, red, violet; grades 5–90). Each grade is pinned to a fixed WCAG relative-luminance target that is **identical across families**, so grade arithmetic predicts contrast for **any** two colors, even across families:

| Grade delta | Guaranteed contrast | WCAG use |
| ----------- | ------------------- | -------- |
| ≥ 40 | ≥ 3:1 | Large text, UI components, focus indicators (AA) |
| ≥ 50 | ≥ 4.5:1 | Normal text (AA) |
| ≥ 70 | ≥ 7:1 | Normal text (AAA / high-contrast theme) |

Grade 50 additionally clears 4.5:1 against both pure white and pure black. The generator (`scripts/generate-palette.ts`) binary-searches OKLCH lightness to hit each grade's luminance target in the shipped hex values, and `pnpm validate:contrast` re-derives WCAG math independently and re-checks every pair (1,700+ checks) from the **built** output. If it exits 0, the contract holds — pick colors by arithmetic, not by eyeballing.

## Usage

```css
@import '@21stgov/commons-tokens/index.css';
```

Themes: `:root`/`[data-theme='light']` is the default; `[data-theme='dark']` and `[data-theme='high-contrast']` remap the same semantic variables (`--cui-text-default`, `--cui-bg-default`, `--cui-focus-ring`, …), with `prefers-color-scheme` / `prefers-contrast` fallbacks for visitors who never chose a theme.

## Tailwind v4

`@import '@21stgov/commons-tokens/tailwind.css';` (after `tailwindcss` and `index.css`) — an `@theme inline` bridge mapping every semantic variable to shadcn-style tokens (`bg-background`, `text-foreground`, `bg-primary`, `ring-ring`, state trios like `bg-error`/`text-error-foreground`/`border-error-border`) plus the full primitive palette, spacing, type, radius, shadow, and easing scales, all as `var(--cui-*)` references so runtime `data-theme` switching keeps working.
Tailwind's stock color palette is reset (`--color-*: initial`) so only contract-checked Commons colors exist, and the build fails if a semantic variable ever drifts out of the bridge (`pnpm validate:tailwind` compile-checks the shipped file).

## Scripts

- `pnpm generate` — regenerate `src/tokens/color.primitives.tokens.json` (deterministic; the result is committed source — run this only when the generator changes, then commit the diff)
- `pnpm build` — compile the committed token sources to `dist/`
- `pnpm validate:contrast` (= `pnpm test`) — independent WCAG audit of `dist/`
