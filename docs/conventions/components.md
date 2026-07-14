# Component conventions

Every component in `packages/react` follows this pattern. Button
(`packages/react/src/components/button/`) is the reference implementation —
read it before writing a new component.

## File layout

```text
packages/react/src/components/<name>/
├── <name>.tsx           # implementation (ships verbatim via the registry)
├── <name>.test.tsx      # vitest + testing-library + axe tests
├── registry.frag.json   # co-located registry-item.v1 metadata fragment
└── index.ts             # public re-exports for this component
apps/playground/src/demos/<name>.demo.tsx   # live demo
```

Every source file starts with `// SPDX-License-Identifier: MIT`. Files adapted
from shadcn/ui add the 3-line attribution header (see `src/lib/cn.ts`).

## Imports: the "@/" rule

Inside `packages/react`, import package-internal modules with the `@/` alias
(`import { cn } from "@/lib/cn"`), never with relative `../..` paths. Files
ship verbatim through the registry into consumer projects, where `@/` is
remapped by their config — relative paths would break. The alias is wired in
`tsconfig.json` (paths), `tsup.config.ts` (esbuild alias), and
`vitest.config.ts` (resolve alias).

**Shipped files must use published-layout specifiers.** A file that ships
through the registry (every file listed in a `registry.frag.json`) may only
`@/`-import destinations that exist in a consumer project after
`commons add`: `@/components/ui/<file>` and `@/lib/<file>`. Source-layout
specifiers such as `@/components/field/context` resolve only inside
`packages/react` and would break verbatim in a consumer — the registry build
fails on them (`assertShippedImportsResolve` in
`apps/registry/src/registry-build.ts`). Non-shipped files (tests, the package
root `index.ts`) use the source layout. Where the two layouts differ, the
published specifier is aliased back to the source file in `tsconfig.json`,
`tsup.config.ts`, and `vitest.config.ts` (e.g. `@/components/ui/context` →
`src/components/field/context.ts`).

## Styling: cva + cn, tokens only

Variants live in a `cva()` definition; the rendered class is always
`cn(componentVariants({ variant, size }), className)` so consumers can extend.
Button excerpt:

```tsx
export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-md border",
    "text-sm font-medium transition-colors motion-reduce:transition-none",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  ],
  {
    variants: {
      variant: { primary: "border-transparent bg-primary text-primary-foreground ..." },
      size: { sm: "min-h-11 px-3 py-1 text-sm" }, // min-h-11 = 2.75rem = 44px
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);
```

Rules: theme-token utilities only (`bg-primary`, `text-foreground`,
`outline-ring` — mapped to `--cui-*` by the tokens Tailwind bridge); never raw
hex or palette classes. Keep a border on every interactive variant
(`border-transparent` on solid ones) so forced-colors mode paints a boundary.
Root element gets `data-slot="<name>"`.

## The Field contract

Form controls never wire their own label/hint/error ids. They call
`useFieldControl()` from `@/components/ui/context` — the published-layout
specifier, because control files ship through the registry and the field item
publishes `src/components/field/context.ts` as `components/ui/context.ts` in
consumer projects (see "Imports: the @/ rule" above; the registry build
rejects the source-layout `@/components/field/context` in shipped files) —
and spread the result:

```ts
function useFieldControl(): FieldControlProps;

interface FieldControlProps {
  id?: string;                    // the Field's control id
  "aria-describedby"?: string;    // hint id first, then error id — only rendered ones
  "aria-invalid"?: true;          // present only in an error state
  required?: boolean;             // present only when true
  disabled?: boolean;             // present only when true
}
```

Outside a `FieldProvider` it returns `{}`, so every control works standalone.
The visual `<Field>` renders `FieldProvider` (props: `id?`, `hasHint?`,
`hasError?`, `invalid?`, `required?`, `disabled?`); ids derive as `${id}-hint`
and `${id}-error`.

## Strings are props (i18n)

Every user-facing string is a prop with an English default — e.g. Button's
`loadingLabel = "Loading"`. Never hardcode copy inside JSX that a consumer
cannot replace. Font sizes are rem-only; direction is logical-only.

## Tests (all four required)

In `<name>.test.tsx`, using vitest + @testing-library/react +
`axeCheck`/`toHaveNoViolations` from `packages/react/test/setup.ts`:

- **a. axe-clean** — every variant, size, and state (default, loading,
  disabled, error, …).
- **b. Keyboard** — the APG/native contract via `@testing-library/user-event`
  (`user.tab()`, `user.keyboard("{Enter}")`, `" "`), including suppressed or
  conditional activation states.
- **c. Name/role/value** — `getByRole` with an accessible name; verify
  aria state attributes (`aria-busy`, `aria-invalid`, …).
- **d. RTL smoke** — render inside `<div dir="rtl">`, assert it renders and is
  axe-clean.

Tests must be cross-platform: no shelling out, no POSIX paths, no `/tmp`.

## Demo contract

`apps/playground/src/demos/<name>.demo.tsx` exports `const title: string` and
a default React component showing all variants, sizes, and states. It may
import only `@21stgov/commons-react` and `react`.

## registry.frag.json (registry-item v1)

Co-located metadata implementing `docs/ai-and-agents.md`. Full example:

```json
{
  "$schema": "https://commonsui.com/schema/registry-item.v1.json",
  "schemaVersion": "1",
  "name": "button",
  "type": "registry:ui",
  "title": "Button",
  "description": "Initiates an immediate action.",
  "status": "experimental",
  "useWhen": ["Submitting a form", "Confirming an explicit action"],
  "avoidWhen": ["Navigating to another page (use a link)"],
  "dependencies": ["class-variance-authority"],
  "registryDependencies": ["cn"],
  "compatibility": { "react": ">=19", "rtl": true, "forcedColors": true },
  "accessibility": {
    "standard": "WCAG 2.2 AA",
    "keyboard": ["Tab moves focus to the button", "Enter or Space activates"],
    "nameRequired": true,
    "targetSize": "44px project default",
    "highContrastTested": true,
    "screenReadersTested": []
  },
  "files": [{ "path": "src/components/button/button.tsx", "type": "registry:ui" }]
}
```

Libraries use `"type": "registry:lib"` (see `src/lib/registry.frag.json` for
`cn`). The registry build later assembles fragments into published items with
`version` and `integrity`.

Every published item — UI or not — must carry `useWhen`, `avoidWhen`, and
`accessibility`; the registry build fails otherwise (`assertAgentContract`).
Non-UI items (`registry:lib`, `registry:theme`) have no user-facing surface,
so they declare that explicitly instead of omitting the field:

```json
"accessibility": { "standard": "not-applicable" }
```

## index.ts append rule

`packages/react/src/index.ts` has a `// components` marker. Append exactly one
line for your component under it, alphabetized:
`export * from "@/components/<name>";` — do not reorder or touch other lines.
Your component's `index.ts` re-exports its public API only (component, its
`*Variants`, prop types). Note: the Field visual component's index must not
re-export `field/context` names — the root index already exports them.

## DO / DON'T

| DO | DON'T |
| --- | --- |
| `ms-2`, `pe-4`, `text-start`, `start-0` (logical) | `ml-2`, `pr-4`, `text-left`, `left-0` (physical) |
| Theme tokens: `bg-primary`, `text-foreground` | Raw hex, `bg-blue-600`, inline `style` colors |
| `min-h-11`+ (≥ 2.75rem / 44px targets) | Targets under 44px |
| Native elements first (`<button>`, `<dialog>`) | `<div role="button">`, ARIA re-implementations |
| Strings as props with English defaults | Hardcoded user-facing copy |
| `rem`-based text (`text-sm`, `text-base`) | `px` font sizes, arbitrary `text-[13px]` |
| `motion-reduce:` / `motion-safe:` guards | Unconditional animation |
| `node:path`, `os.tmpdir()`, argument-array spawns in tooling/tests | POSIX-only shell, `/tmp`, string-concatenated paths |
