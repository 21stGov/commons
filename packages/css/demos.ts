// SPDX-License-Identifier: MIT

/**
 * Turn the React playground's own `*.demo.tsx` files into framework-agnostic
 * HTML fragments for the HTML playground — true React⇄HTML parity, no
 * hand-authored markup to drift or get wrong.
 *
 * Pipeline (per demo):
 *   1. esbuild-bundle the demo (react / react-dom / commons-react stay
 *      external, resolved from node_modules — the built components), import it.
 *   2. renderToStaticMarkup(<Demo/>) — the real component output, carrying the
 *      exact data-slot / data-variant / aria / role attributes.
 *   3. rewrite: every element with `data-slot` gets its `.cui-*` classes
 *      (base + variant/size, derived from its data-* and validated against the
 *      generator's class manifest); Tailwind utilities are stripped from
 *      component internals (so any coverage gap shows honestly), and kept only
 *      on demo scaffolding (the wrapper divs that arrange examples).
 *   4. the union of scaffolding utilities is compiled once, via Tailwind, into
 *      a tiny `scaffold.css` — so the playground needs no Tailwind build and
 *      the components themselves are proven by `commons.css` alone.
 */

import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import esbuild from 'esbuild'
import { HTMLElement, parse } from 'node-html-parser'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { camelToKebab, type VariantSignature } from './generate.ts'

const require = createRequire(import.meta.url)
const tokensDist = dirname(require.resolve('@21stgov/commons-tokens/index.css'))

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const demosSrcDir = join(repoRoot, 'apps', 'playground', 'src', 'demos')
const tmpDir = join(here, '.cui-demos-tmp')

export interface DemoResult {
  slug: string
  title: string
  ok: boolean
  error?: string
}

export interface DemosSummary {
  results: DemoResult[]
  /**
   * Component-internal utility classes still needed (no `.cui-*` rule covers
   * them) — the honest coverage gap in commons.css, sorted.
   */
  internalGap: string[]
}

/** A React demo module, once bundled and imported. */
interface DemoModule {
  title?: string
  default?: React.ComponentType
}

/** Bundle + import one demo module so it can be server-rendered. */
async function loadDemo(entry: string): Promise<DemoModule> {
  const outfile = join(tmpDir, `${Math.random().toString(36).slice(2)}.mjs`)
  await esbuild.build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    logLevel: 'silent',
    // Everything (react, react-dom, @21stgov/commons-react) resolves from
    // node_modules at import time — we render the real built components.
    packages: 'external',
    tsconfig: join(repoRoot, 'apps', 'playground', 'tsconfig.json'),
  })
  return (await import(pathToFileURL(outfile).href)) as DemoModule
}

type Signatures = Record<string, VariantSignature[]>

/**
 * `peer` / `group` marker classes carry no styles of their own, but the CSS
 * targets them (`.peer:checked ~ …`, `.group[data-state=open] …`) to style
 * *other* elements. They must survive the rewrite or cross-element state
 * styling — the checkbox check, the accordion chevron — never fires.
 */
const isMarkerToken = (cls: string): boolean =>
  cls === 'peer' || cls === 'group' || /^(peer|group)\//.test(cls)

/**
 * The `.cui-*` classes for one `data-slot` element:
 *  - the base slot class,
 *  - a modifier for each `data-*` that names a real variant/size (Badge etc.),
 *  - and, for components that expose variants only through classes (Button),
 *    the modifier recovered by matching the element's original Tailwind classes
 *    against the generator's variant signatures — one winner per cva group.
 *
 * Must run before the element's class attribute is rewritten.
 */
function cuiClassesFor(
  slot: string,
  el: HTMLElement,
  manifest: Set<string>,
  signatures: Signatures,
): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  const add = (cls: string): void => {
    if (!seen.has(cls)) {
      seen.add(cls)
      out.push(cls)
    }
  }

  const base = `cui-${slot}`
  if (manifest.has(base)) add(base)

  // 0. keep peer/group markers so cross-element state selectors keep matching.
  for (const c of (el.getAttribute('class') ?? '').split(/\s+/)) {
    if (isMarkerToken(c)) add(c)
  }

  // 1. data-* attributes (data-variant, data-size, …).
  for (const [name, rawVal] of Object.entries(el.attributes)) {
    if (!name.startsWith('data-') || name === 'data-slot') continue
    const key = name.slice('data-'.length)
    const val = String(rawVal)
    // Boolean variant (data-loading="true") folds to `--<key>`; enum variant
    // (data-variant="success") to `--<value>`. Try the value verbatim and
    // kebab-cased, since cva keys can be camelCase.
    const candidates =
      val === 'true' || val === 'false'
        ? val === 'true'
          ? [`${base}--${key}`, `${base}--${camelToKebab(key)}`]
          : []
        : [`${base}--${val}`, `${base}--${camelToKebab(val)}`]
    const hit = candidates.find((c) => manifest.has(c))
    if (hit) add(hit)
  }

  // 2. signature matching from the element's original classes — one modifier
  // per cva group, preferring the most specific (longest) matching signature.
  const sigs = signatures[slot]
  if (sigs) {
    const orig = new Set((el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean))
    const best = new Map<string, { modifier: string; count: number }>()
    for (const s of sigs) {
      if (!manifest.has(s.modifier) || s.classes.length === 0) continue
      if (s.classes.every((c) => orig.has(c))) {
        const cur = best.get(s.group)
        if (!cur || s.classes.length > cur.count) {
          best.set(s.group, { modifier: s.modifier, count: s.classes.length })
        }
      }
    }
    for (const { modifier } of best.values()) add(modifier)
  }

  return out
}

export interface RewriteResult {
  html: string
  /** Utility classes on demo scaffolding (outside any component subtree). */
  scaffold: Set<string>
  /**
   * Utility classes still needed by elements *inside* a component that carry no
   * `data-slot` (mostly icon sizing) — the true measure of what `commons.css`
   * doesn't yet cover on its own. Kept so the playground renders correctly, and
   * reported so the gap is visible.
   */
  internal: Set<string>
}

/** Rewrite server-rendered component markup to `.cui-*`, in place. */
export function rewrite(html: string, manifest: Set<string>, signatures: Signatures): RewriteResult {
  const root = parse(html, { comment: false })
  const scaffold = new Set<string>()
  const internal = new Set<string>()

  const walk = (node: unknown, inComponent: boolean): void => {
    if (!(node instanceof HTMLElement)) return
    const slot = node.getAttribute('data-slot')
    let childInComponent = inComponent

    if (slot != null) {
      const classes = cuiClassesFor(slot, node, manifest, signatures)
      if (classes.length > 0) node.setAttribute('class', classes.join(' '))
      else node.removeAttribute('class')
      childInComponent = true
    } else {
      const cls = node.getAttribute('class')
      if (cls) {
        // Keep the classes so the demo renders correctly, and bucket them:
        // scaffolding (demo layout) vs component-internal (a `commons.css`
        // coverage gap — an element the generator hasn't given a `.cui-*` rule).
        const target = inComponent ? internal : scaffold
        for (const c of cls.split(/\s+/)) if (c) target.add(c)
      }
    }

    for (const child of node.childNodes) walk(child, childInComponent)
  }

  for (const child of root.childNodes) walk(child, false)
  return { html: root.toString(), scaffold, internal }
}

/** Compile the union of scaffolding utilities into a standalone stylesheet. */
function compileScaffold(scaffold: Set<string>, outDir: string): void {
  const classList = [...scaffold].sort()
  const contentPath = join(tmpDir, 'scaffold-content.txt')
  const inputPath = join(tmpDir, 'scaffold-input.css')
  // Tailwind scans the content file for class names; the tokens bridge maps
  // token utilities (text-muted-foreground, …) onto var(--cui-*), which the
  // playground supplies via commons-tokens.
  writeFileSync(contentPath, classList.join('\n'))
  writeFileSync(
    inputPath,
    `@layer theme, utilities;
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/utilities.css' layer(utilities);
@import '${join(tokensDist, 'css', 'tailwind.css')}';
@source '${contentPath}';
`,
  )
  const tailwindBin = join(here, 'node_modules', '.bin', 'tailwindcss')
  execFileSync(tailwindBin, ['-i', inputPath, '-o', join(outDir, 'scaffold.css')], { stdio: 'pipe' })
}

/**
 * Render every demo to a `.cui-*` HTML fragment under `outDir/demos/`, plus a
 * `demos.json` manifest and a `scaffold.css`. `classNames` is the generator's
 * emitted-class manifest (BuildResult.classNames).
 */
export async function generateDemos(
  classNames: string[],
  signatures: Signatures,
  outDir: string,
): Promise<DemosSummary> {
  const manifest = new Set(classNames)
  const demosOut = join(outDir, 'demos')
  mkdirSync(demosOut, { recursive: true })
  mkdirSync(tmpDir, { recursive: true })

  const files = readdirSync(demosSrcDir)
    .filter((f) => f.endsWith('.demo.tsx'))
    .sort()

  const results: DemoResult[] = []
  const scaffold = new Set<string>()
  const internal = new Set<string>()

  try {
    for (const file of files) {
      const slug = file.replace(/\.demo\.tsx$/, '')
      try {
        const mod = await loadDemo(join(demosSrcDir, file))
        if (typeof mod.default !== 'function') throw new Error('no default export')
        const rendered = renderToStaticMarkup(React.createElement(mod.default))
        const r = rewrite(rendered, manifest, signatures)
        for (const c of r.scaffold) scaffold.add(c)
        for (const c of r.internal) internal.add(c)
        writeFileSync(join(demosOut, `${slug}.html`), `${r.html}\n`)
        results.push({ slug, title: mod.title ?? slug, ok: true })
      } catch (err) {
        results.push({ slug, title: slug, ok: false, error: (err as Error).message.split('\n')[0] })
      }
    }
    // Compile scaffolding + the internal utilities the components still need,
    // so every demo renders; components' own styling still comes from the
    // `.cui-*` classes in commons.css.
    compileScaffold(new Set([...scaffold, ...internal]), outDir)
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }

  results.sort((a, b) => a.title.localeCompare(b.title, 'en'))
  writeFileSync(join(outDir, 'demos.json'), `${JSON.stringify(results, null, 2)}\n`)
  return { results, internalGap: [...internal].sort() }
}
