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

export function emitRule(selector: string, rawClasses: string[], out: string[]): void {
  const classes = rawClasses.filter((c) => !isMarker(c))
  if (classes.length === 0) return
  const { self, descendants } = splitUtilities(classes)
  if (self.length > 0) out.push(`  ${selector} {\n    @apply ${self.join(' ')};\n  }`)
  for (const [inner, utils] of descendants) {
    out.push(`  ${selector}${inner} {\n    @apply ${utils.join(' ')};\n  }`)
  }
}

/** A rendered variant of a component, for the verification gallery. */
export interface Swatch {
  /** The full class attribute, e.g. "cui-button cui-button--primary". */
  classes: string
  /** The variant this shows, e.g. "primary" or "base". */
  label: string
}

/** One component export -> its `.cui-*` rules plus its gallery swatches. */
export function emitVariant(cap: CapturedVariant, out: string[]): Swatch[] {
  const name = classBase(cap.exportName)
  const sel = `.cui-${name}`
  const baseClasses = [...cap.base]
  const modifiers: Array<{ sel: string; classes: string[]; label: string }> = []

  for (const [group, values] of Object.entries(cap.variants)) {
    const isBoolean = Object.keys(values).every((k) => k === 'true' || k === 'false')
    const def = cap.defaultVariants[group]
    for (const [key, classes] of Object.entries(values)) {
      if (isBoolean) {
        if (key === 'true') {
          modifiers.push({ sel: `${sel}--${camelToKebab(group)}`, classes, label: camelToKebab(group) })
        } else if (String(def) === 'false') {
          baseClasses.push(...classes) // default off-state folds into the base rule
        } else {
          modifiers.push({
            sel: `${sel}--${camelToKebab(group)}-false`,
            classes,
            label: `${camelToKebab(group)}-false`,
          })
        }
      } else {
        modifiers.push({ sel: `${sel}--${camelToKebab(key)}`, classes, label: camelToKebab(key) })
      }
    }
  }

  out.push(`  /* ${cap.exportName} */`)
  emitRule(sel, baseClasses, out)
  for (const m of modifiers) emitRule(m.sel, m.classes, out)

  const swatches: Swatch[] = [{ classes: `cui-${name}`, label: 'base' }]
  for (const m of modifiers) {
    swatches.push({ classes: `cui-${name} ${m.sel.slice(1)}`, label: m.label })
  }
  return swatches
}

// --- buildCss: capture all components, emit, compile ------------------------

export interface GalleryComponent {
  name: string
  swatches: Swatch[]
}

export interface BuildResult {
  captured: string[]
  skipped: string[]
  gallery: GalleryComponent[]
  distDir: string
}

/** The distributable CSS this consumer links. */
export const distDir = join(here, 'dist')

export async function buildCss(): Promise<BuildResult> {
  const names = readdirSync(componentsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()

  mkdirSync(tmpDir, { recursive: true })
  const rulesByComponent: string[] = []
  const captured: string[] = []
  const skipped: string[] = []
  const gallery: GalleryComponent[] = []

  try {
    for (const name of names) {
      const entry = join(componentsDir, name, `${name}.tsx`)
      let caps: CapturedVariant[]
      try {
        caps = await captureComponent(entry)
      } catch (err) {
        const esb = (err as { errors?: Array<{ text: string }> }).errors
        const detail = esb ? esb.map((e) => e.text).join('; ') : (err as Error).message.split('\n')[0]
        skipped.push(`${name} (capture error: ${detail})`)
        continue
      }
      if (caps.length === 0) {
        skipped.push(`${name} (no cva)`)
        continue
      }
      const out: string[] = []
      const swatches: Swatch[] = []
      for (const cap of caps) swatches.push(...emitVariant(cap, out))
      rulesByComponent.push(`  /* ==== ${name} ==== */\n${out.join('\n')}`)
      gallery.push({ name, swatches })
      captured.push(name)
    }
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }

  mkdirSync(distDir, { recursive: true })
  const header = `/* SPDX-License-Identifier: MIT */\n/* GENERATED by packages/css/generate.ts from the components' cva() definitions. Do not edit. */\n`
  const srcCss = `${header}\n@layer components {\n${rulesByComponent.join('\n\n')}\n}\n`
  writeFileSync(join(distDir, 'components.src.css'), srcCss)

  // Compile @apply -> token-based CSS via Tailwind (no preflight; core owns the
  // reset). Self-contained: consumers link tokens + this file, no Tailwind.
  const inputCss = `@layer theme, base, components, utilities;
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/utilities.css' layer(utilities);
@import '${join(tokensDist, 'css', 'tailwind.css')}';
@import './components.src.css';
`
  writeFileSync(join(distDir, '_input.css'), inputCss)
  const tailwindBin = join(here, 'node_modules', '.bin', 'tailwindcss')
  execFileSync(tailwindBin, ['-i', join(distDir, '_input.css'), '-o', join(distDir, 'commons.css')], {
    stdio: 'pipe',
  })
  rmSync(join(distDir, '_input.css'), { force: true })

  return { captured, skipped, gallery, distDir }
}
