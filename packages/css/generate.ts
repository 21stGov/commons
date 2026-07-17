// SPDX-License-Identifier: MIT

/**
 * Generate framework-agnostic component CSS from the React components' own
 * `cva()` variant definitions — no drift, no per-component refactor.
 *
 * Pipeline:
 *   1. capture: esbuild-bundle each component with `class-variance-authority`
 *      aliased to a shim that records every cva(base, config) on the returned
 *      function. Read those off the module's `*Variants` exports.
 *   2. emit: turn each captured config into `.cui-*` rules whose bodies are the
 *      component's exact utility strings, via Tailwind `@apply`.
 *   3. compile: run the @apply source through Tailwind (no preflight) into a
 *      self-contained, token-based dist/commons.css.
 */

import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import esbuild from 'esbuild'

import { extractInlineSlots, extractSlotAliases } from './inline.ts'

const require = createRequire(import.meta.url)
/** Absolute path to @21stgov/commons-tokens dist (the @theme bridge lives here). */
const tokensDist = join(dirname(require.resolve('@21stgov/commons-tokens/index.css')), '')

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const reactDir = join(repoRoot, 'packages', 'react')
const componentsDir = join(reactDir, 'src', 'components')
const tmpDir = join(reactDir, '.cui-capture-tmp')

/** The cva shim: capture (base, config); return a dummy — we never call it. */
const CVA_SHIM = `
export function cva(base, config) {
  const f = () => '';
  f.__cvaConfig = { base, config: config ?? {} };
  return f;
}
export const cx = (...a) => a.filter(Boolean).join(' ');
export default { cva, cx };
`

/** A captured variant definition from one exported cva. */
export interface CapturedVariant {
  /** e.g. "buttonVariants" -> component "button"; "accordionTriggerVariants" -> "accordion-trigger". */
  exportName: string
  base: string[]
  variants: Record<string, Record<string, string[]>>
  defaultVariants: Record<string, string | number | boolean>
}

/** Normalize cva's class value (string | string[] | nested arrays) to a flat token list. */
export function toClasses(value: unknown): string[] {
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean)
  if (Array.isArray(value)) return value.flatMap(toClasses)
  return []
}

/** Capture every `*Variants` cva export from one component module. */
export async function captureComponent(entry: string): Promise<CapturedVariant[]> {
  const outfile = join(tmpDir, `${Math.random().toString(36).slice(2)}.mjs`)
  await esbuild.build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    logLevel: 'silent',
    // node_modules stay external (resolved at eval from packages/react); only
    // our own source and cva (the shim) are bundled. The react tsconfig maps
    // the `@/*` and registry-style `@/components/ui/*` path aliases.
    packages: 'external',
    tsconfig: join(reactDir, 'tsconfig.json'),
    plugins: [
      {
        name: 'capture-cva',
        setup(build) {
          // Runs before default resolution, so cva is bundled as the shim even
          // though `packages: 'external'` would otherwise externalize it.
          build.onResolve({ filter: /^class-variance-authority$/ }, () => ({
            path: 'cva',
            namespace: 'cva-shim',
          }))
          build.onLoad({ filter: /.*/, namespace: 'cva-shim' }, () => ({
            contents: CVA_SHIM,
            loader: 'js',
          }))
        },
      },
    ],
  })

  const mod = (await import(pathToFileURL(outfile).href)) as Record<string, unknown>
  const captured: CapturedVariant[] = []
  for (const [exportName, value] of Object.entries(mod)) {
    const cfg = (value as { __cvaConfig?: { base: unknown; config: Record<string, unknown> } })
      ?.__cvaConfig
    if (!cfg) continue
    const variantsSrc = (cfg.config.variants ?? {}) as Record<string, Record<string, unknown>>
    const variants: CapturedVariant['variants'] = {}
    for (const [group, values] of Object.entries(variantsSrc)) {
      variants[group] = {}
      for (const [key, cls] of Object.entries(values)) variants[group][key] = toClasses(cls)
    }
    captured.push({
      exportName,
      base: toClasses(cfg.base),
      variants,
      defaultVariants: (cfg.config.defaultVariants ?? {}) as CapturedVariant['defaultVariants'],
    })
  }
  return captured
}

// --- emit: captured config -> `.cui-*` @apply rules -------------------------

export const camelToKebab = (s: string): string =>
  s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/_/g, '-').toLowerCase()

/** `buttonVariants` -> `button`; `accordionTriggerVariants` -> `accordion-trigger`. */
export const classBase = (exportName: string): string =>
  camelToKebab(exportName.replace(/Variants$/, ''))

/**
 * Split a utility list into ones that apply to the element and ones that target
 * a descendant via an arbitrary variant (`[&_svg]`, `[&>svg]`) — those can't be
 * `@apply`'d to the element, so they become nested selectors. Every other
 * variant (`hover:`, `disabled:`, `data-[…]:`, …) is left for `@apply`.
 */
export function splitUtilities(classes: string[]): { self: string[]; descendants: Map<string, string[]> } {
  const self: string[] = []
  const descendants = new Map<string, string[]>()
  for (const cls of classes) {
    const m = cls.match(/^\[&([_>])([^\]]+)\]:(.+)$/)
    if (m) {
      const inner = (m[1] === '>' ? ' > ' : ' ') + m[2]
      const list = descendants.get(inner) ?? []
      list.push(m[3]!)
      descendants.set(inner, list)
    } else {
      self.push(cls)
    }
  }
  return { self, descendants }
}

/**
 * Marker classes with no styles of their own — they enable `group-` and
 * `peer-` variants on other elements and can't be @apply'd (that child
 * targeting is a Level-2 concern). Dropping them keeps the element's own styles.
 */
export const isMarker = (cls: string): boolean =>
  cls === 'group' || cls === 'peer' || /^(group|peer)\//.test(cls)

/** A CSS rule before rendering: a selector and the utility classes to @apply. */
export interface RawRule {
  selector: string
  utilities: string[]
}

/**
 * Turn a class list into raw rules: the element's own `@apply` plus one nested
 * rule per arbitrary descendant variant (`[&_svg]`). Marker classes are
 * dropped, and so are `cui-*` tokens — those are already framework-agnostic
 * classes (owned by commons-core, e.g. `cui-theme-image--dark`), not Tailwind
 * utilities to compile.
 */
export function rulesForClasses(selector: string, rawClasses: string[]): RawRule[] {
  const classes = rawClasses.filter((c) => !isMarker(c) && !c.startsWith('cui-'))
  const { self, descendants } = splitUtilities(classes)
  const rules: RawRule[] = []
  if (self.length > 0) rules.push({ selector, utilities: self })
  for (const [inner, utils] of descendants) {
    rules.push({ selector: `${selector}${inner}`, utilities: utils })
  }
  return rules
}

/**
 * A variant modifier's fingerprint: the `.cui-*--x` class it produces, the cva
 * group it belongs to, and the raw utility classes that identify it. Used to
 * recover a rendered element's variant when the component exposes it only via
 * classes (not a `data-*` attribute) — e.g. Button.
 */
export interface VariantSignature {
  /** The modifier class, no leading dot, e.g. `cui-button--primary`. */
  modifier: string
  /** The cva group, e.g. `variant` or `size` (so one match wins per group). */
  group: string
  /** The raw cva utility classes for this value. */
  classes: string[]
}

/**
 * One component export -> its `.cui-*` raw rules and signatures. `name`
 * overrides the slot (defaults to the export-name kebab) for cvas whose call
 * styles a differently-named slot (input-otp-cell).
 */
export function emitVariant(
  cap: CapturedVariant,
  name: string = classBase(cap.exportName),
): {
  rules: RawRule[]
  signatures: VariantSignature[]
} {
  const sel = `.cui-${name}`
  const baseClasses = [...cap.base]
  const modifiers: Array<{
    sel: string
    classes: string[]
    label: string
    group: string
    isDefault?: boolean
  }> = []

  // A group's default value folds into the base so a bare `.cui-x` renders the
  // default — but scoped `.cui-x:where(:not(<siblings>))` so choosing any other
  // value in the same group suppresses it, exactly as cva drops the default's
  // classes once another value is set. Without this, a sibling that omits a
  // property the default sets (e.g. an `orientation` where `vertical` sets a
  // width `horizontal` never resets) would inherit the folded default and
  // diverge from React. `:where()` adds no specificity, so the scoped rule keeps
  // the old bare-base weight and is a no-op for the (majority) groups whose
  // siblings already override every property the default sets.
  const scopedDefaults: Array<{ selector: string; classes: string[] }> = []
  const scopeFor = (siblingSelectors: string[]): string =>
    siblingSelectors.length ? `${sel}:where(:not(${siblingSelectors.join(', ')}))` : sel

  for (const [group, values] of Object.entries(cap.variants)) {
    const isBoolean = Object.keys(values).every((k) => k === 'true' || k === 'false')
    const def = cap.defaultVariants[group]
    for (const [key, classes] of Object.entries(values)) {
      if (isBoolean) {
        if (key === 'true') {
          modifiers.push({ sel: `${sel}--${camelToKebab(group)}`, classes, label: camelToKebab(group), group })
        } else if (String(def) === 'false') {
          // Default off-state folds into the base, yielding to the on-state.
          if (classes.length > 0)
            scopedDefaults.push({ selector: scopeFor([`${sel}--${camelToKebab(group)}`]), classes })
        } else {
          modifiers.push({
            sel: `${sel}--${camelToKebab(group)}-false`,
            classes,
            label: `${camelToKebab(group)}-false`,
            group,
          })
        }
      } else {
        // Enum variant (size, tone, …). Emit the `--<value>` modifier for
        // explicit use; and for the DEFAULT value also fold its classes into the
        // base (scoped against its siblings), so a bare `.cui-x` (what a
        // hand-writing consumer types, and what the rewrite leaves on a
        // default-variant element) renders the default instead of nothing. The
        // default is excluded from the signatures below — otherwise every
        // element would carry the folded default's classes and the rewrite would
        // tag them all as the default.
        const isDefault = def !== undefined && String(def) === key
        modifiers.push({ sel: `${sel}--${camelToKebab(key)}`, classes, label: camelToKebab(key), group, isDefault })
        if (isDefault && classes.length > 0) {
          const siblings = Object.keys(values)
            .filter((k) => k !== key)
            .map((k) => `${sel}--${camelToKebab(k)}`)
          scopedDefaults.push({ selector: scopeFor(siblings), classes })
        }
      }
    }
  }

  const rules = rulesForClasses(sel, baseClasses)
  for (const d of scopedDefaults) rules.push(...rulesForClasses(d.selector, d.classes))
  for (const m of modifiers) rules.push(...rulesForClasses(m.sel, m.classes))

  const signatures: VariantSignature[] = modifiers
    .filter((m) => m.classes.length > 0 && !m.isDefault)
    .map((m) => ({ modifier: m.sel.slice(1), group: m.group, classes: m.classes }))
  return { rules, signatures }
}

/**
 * The class list for a component rendered under a renamed slot (an alias):
 * the base plus, for each variant group, the classes for the prop value given
 * on the tag or, failing that, the component's own default.
 */
export function aliasClasses(cap: CapturedVariant, props: Record<string, string>): string[] {
  const classes = [...cap.base]
  for (const [group, values] of Object.entries(cap.variants)) {
    const chosen = props[group] ?? cap.defaultVariants[group]
    if (chosen == null) continue
    const picked = values[String(chosen)]
    if (picked) classes.push(...picked)
  }
  return classes
}

// --- buildCss: capture all components, emit, compile ------------------------

export interface BuildResult {
  captured: string[]
  skipped: string[]
  distDir: string
  /** Utility classes @apply couldn't resolve, dropped so the build succeeds. */
  dropped: string[]
  /**
   * Every `.cui-*` class token emitted (sans leading dot), e.g. `cui-badge`,
   * `cui-badge--success`. The SSR demo rewrite validates candidate classes
   * against this so it only applies classes that actually have rules.
   */
  classNames: string[]
  /**
   * Variant fingerprints per base slot (e.g. `button` -> [primary, sm, …]),
   * so the rewrite can recover a rendered element's variant from its original
   * classes when the component doesn't expose it via a `data-*` attribute.
   */
  signatures: Record<string, VariantSignature[]>
}

/** Pull the `.cui-*` class tokens (no leading dot) out of a rule selector. */
export function selectorClassNames(selector: string): string[] {
  return (selector.match(/\.cui-[a-zA-Z0-9_-]+/g) ?? []).map((c) => c.slice(1))
}

const SRC_HEADER = `/* SPDX-License-Identifier: MIT */\n/* GENERATED by packages/css/generate.ts from the components' cva() + inline classes. Do not edit. */\n`

/** Render the @apply source, omitting any utilities in `dropped`. */
function renderSrc(comps: Array<{ name: string; rules: RawRule[] }>, dropped: Set<string>): string {
  const blocks = comps
    .map((c) => {
      const ruleText = c.rules
        .map((r) => {
          const utils = r.utilities.filter((u) => !dropped.has(u))
          return utils.length > 0 ? `  ${r.selector} {\n    @apply ${utils.join(' ')};\n  }` : ''
        })
        .filter(Boolean)
        .join('\n')
      return ruleText ? `  /* ==== ${c.name} ==== */\n${ruleText}` : ''
    })
    .filter(Boolean)
  return `${SRC_HEADER}\n@layer components {\n${blocks.join('\n\n')}\n}\n`
}

/** The distributable CSS this consumer links. */
export const distDir = join(here, 'dist')

export async function buildCss(): Promise<BuildResult> {
  const names = readdirSync(componentsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()

  const comps: Array<{ name: string; rules: RawRule[] }> = []
  const captured: string[] = []
  const skipped: string[] = []
  const classNames = new Set<string>()
  const signatures: Record<string, VariantSignature[]> = {}

  // Phase 1: capture every component's cva config up front, so alias rules
  // (a component rendered under a renamed slot) can reference any other
  // component regardless of processing order.
  mkdirSync(tmpDir, { recursive: true })
  const capsByName = new Map<string, CapturedVariant[]>()
  const captureFailed = new Set<string>()
  try {
    for (const name of names) {
      try {
        capsByName.set(name, await captureComponent(join(componentsDir, name, `${name}.tsx`)))
      } catch (err) {
        const esb = (err as { errors?: Array<{ text: string }> }).errors
        const detail = esb ? esb.map((e) => e.text).join('; ') : (err as Error).message.split('\n')[0]
        skipped.push(`${name} (capture error: ${detail})`)
        captureFailed.add(name)
      }
    }
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }

  const capByBase = new Map<string, CapturedVariant>()
  const cvaBases = new Map<string, string[]>()
  for (const caps of capsByName.values()) {
    for (const cap of caps) {
      capByBase.set(classBase(cap.exportName), cap)
      cvaBases.set(cap.exportName, cap.base)
    }
  }
  const knownBases = new Set(capByBase.keys())

  // Phase 2: emit rules per component.
  for (const name of names) {
    if (captureFailed.has(name)) continue
    // A component can span several files (radio-group/radio.tsx, …); scan them
    // all for inline slots + aliases, not just <name>.tsx.
    const partFiles = readdirSync(join(componentsDir, name))
      .filter((f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx'))
      .sort()
      .map((f) => join(componentsDir, name, f))
    const rules: RawRule[] = []
    const localSlots = new Set<string>()

    // Gather inline slots + cva→slot usage across the component's files first,
    // so cvas can be emitted under the slot they actually style.
    const inlineAgg = new Map<string, string[]>()
    const cvaOnSlot = new Map<string, Set<string>>()
    for (const file of partFiles) {
      const { slots, cvaOnSlot: usage } = extractInlineSlots(file, cvaBases)
      for (const [slot, classes] of slots) {
        inlineAgg.set(slot, [...new Set([...(inlineAgg.get(slot) ?? []), ...classes])])
      }
      // A cva may style several slots (navigationMenuTriggerVariants styles both
      // the trigger and the bar link) — emit it under every slot that calls it.
      for (const [cva, styled] of usage) {
        const slots = cvaOnSlot.get(cva) ?? new Set<string>()
        for (const s of styled) slots.add(s)
        cvaOnSlot.set(cva, slots)
      }
    }

    // 1. cva-driven variants (buttons, alerts, …), each under every slot its
    // calls style (usually just its own name; input-otp-cell ← inputOTPVariants;
    // navigation-menu-trigger AND navigation-menu-bar-link ← the trigger cva).
    for (const cap of capsByName.get(name) ?? []) {
      const slots = cvaOnSlot.get(cap.exportName) ?? new Set([classBase(cap.exportName)])
      for (const slot of slots) {
        localSlots.add(slot)
        const emitted = emitVariant(cap, slot)
        rules.push(...emitted.rules)
        if (emitted.signatures.length > 0) signatures[slot] = emitted.signatures
      }
    }

    // 2. alias slots — another cva component rendered under a renamed slot
    // (`<Link data-slot="breadcrumb-link">`, `<Button data-slot="carousel-previous"
    // className="…extras">`). Emit that component's base + resolved default
    // variant FIRST, so any inline extras below (rounded-full, p-0) win the
    // conflicts on override — as they do in React (utility over cva base).
    const aliasBase = new Map<string, string[]>()
    for (const file of partFiles) {
      for (const alias of extractSlotAliases(file, knownBases)) {
        if (localSlots.has(alias.slot) || aliasBase.has(alias.slot)) continue
        const cap = capByBase.get(alias.base)
        if (cap) aliasBase.set(alias.slot, aliasClasses(cap, alias.props))
      }
    }
    for (const [slot, classes] of aliasBase) rules.push(...rulesForClasses(`.cui-${slot}`, classes))

    // 3. emit inline slots (a component's own parts + alias inline extras). For
    // an aliased slot this rule comes after its base, so its extras override.
    for (const [slot, classes] of inlineAgg) {
      if (localSlots.has(slot)) continue
      const slotRules = rulesForClasses(`.cui-${slot}`, classes)
      if (slotRules.length > 0) {
        rules.push(...slotRules)
        localSlots.add(slot)
      }
    }
    for (const slot of aliasBase.keys()) localSlots.add(slot)

    if (rules.length === 0) {
      skipped.push(`${name} (no styling found)`)
      continue
    }
    comps.push({ name, rules })
    captured.push(name)
    for (const rule of rules) for (const cls of selectorClassNames(rule.selector)) classNames.add(cls)
  }

  // Compile @apply -> token-based CSS via Tailwind (no preflight; core owns the
  // reset). Self-healing: on an "unknown utility" error (e.g. inset-block-0),
  // drop that utility and retry, so one un-@apply-able class can't fail the build.
  mkdirSync(distDir, { recursive: true })
  const inputCss = `@layer theme, base, components, utilities;
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/utilities.css' layer(utilities);
@import '${join(tokensDist, 'css', 'tailwind.css')}';
@import './components.src.css';

/* Form-control normalization the React app gets from Tailwind's preflight but
   the framework-agnostic path (no preflight) otherwise lacks — without it bare
   buttons (accordion trigger, ghost, carousel controls) show the UA background.
   In the base layer so component classes (.cui-button--primary bg) still win. */
@layer base {
  button, [type='button'], [type='reset'], [type='submit'] {
    appearance: button;
    background-color: transparent;
    background-image: none;
    /* Zero the UA 3D "outset" border (Tailwind preflight does this globally):
       otherwise bare buttons — the sortable table header, ghost triggers —
       show a rogue inset stroke. Component classes re-add borders as needed. */
    border: 0 solid;
    padding: 0;
  }
  button, input, optgroup, select, textarea { margin: 0; }
  :where(button, [role='button']) { cursor: pointer; }
  :where(svg) { display: block; vertical-align: middle; }
}

/* The framework-agnostic markup toggles panels with the [hidden] attribute, but
   several component classes set display (grid/flex), which ties [hidden] on
   specificity and wins on source order — so overlays would show when closed.
   Unlayered + !important makes [hidden] authoritative for consumers + our JS. */
[hidden] { display: none !important; }
`
  writeFileSync(join(distDir, '_input.css'), inputCss)
  // Run the Tailwind CLI's JS entry with the current Node, not the
  // node_modules/.bin/tailwindcss shim — the extensionless shim isn't directly
  // spawnable on Windows (execFileSync throws ENOENT), so resolving the real
  // entry keeps the build cross-platform.
  const tailwindCli = join(dirname(require.resolve('@tailwindcss/cli/package.json')), 'dist/index.mjs')
  const dropped = new Set<string>()
  for (let attempt = 0; attempt < 200; attempt++) {
    writeFileSync(join(distDir, 'components.src.css'), renderSrc(comps, dropped))
    try {
      execFileSync(
        process.execPath,
        [tailwindCli, '-i', join(distDir, '_input.css'), '-o', join(distDir, 'commons.css')],
        { stdio: 'pipe' },
      )
      break
    } catch (err) {
      const output =
        String((err as { stderr?: Buffer }).stderr ?? '') +
        String((err as { stdout?: Buffer }).stdout ?? '')
      const match = output.match(/Cannot apply unknown utility class `([^`]+)`/)
      if (match?.[1] && !dropped.has(match[1])) {
        dropped.add(match[1])
        continue
      }
      throw err
    }
  }
  rmSync(join(distDir, '_input.css'), { force: true })
  return {
    captured,
    skipped,
    distDir,
    dropped: [...dropped].sort(),
    classNames: [...classNames].sort(),
    signatures,
  }
}
