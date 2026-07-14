// SPDX-License-Identifier: MIT

/**
 * Build a single self-contained gallery.html — the generated component CSS
 * (tokens + core reset + `.cui-*` classes) inlined, plus a swatch for every
 * component variant, so the whole output can be eyeballed by opening one file
 * (no server, no external assets). Light/dark and LTR/RTL toggles included.
 */

import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { BuildResult } from './generate.ts'

const here = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const tokensDist = dirname(require.resolve('@21stgov/commons-tokens/index.css'))
const coreIndex = require.resolve('@21stgov/commons-core/index.css')

/** Compile a self-contained bundle: engine + tokens + core reset + components. */
function compileBundle(dist: string): string {
  const input = `@layer theme, base, components, utilities;
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/utilities.css' layer(utilities);
@import '${join(tokensDist, 'index.css')}';
@import '${coreIndex}';
@import '${join(tokensDist, 'css', 'tailwind.css')}';
@import '${join(dist, 'components.src.css')}';
`
  const inPath = join(dist, '_bundle_in.css')
  const outPath = join(dist, '_bundle_out.css')
  writeFileSync(inPath, input)
  execFileSync(join(here, 'node_modules', '.bin', 'tailwindcss'), ['-i', inPath, '-o', outPath], {
    stdio: 'pipe',
  })
  const css = readFileSync(outPath, 'utf8')
  rmSync(inPath, { force: true })
  rmSync(outPath, { force: true })
  return css
}

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

export function writeGallery(result: BuildResult): void {
  const bundle = compileBundle(result.distDir)

  const sections = result.gallery
    .map((c) => {
      const swatches = c.swatches
        .map(
          (s) =>
            `<div class="swatch"><div class="cell"><div class="${esc(s.classes)}">${esc(c.name)}</div></div><code>${esc(s.label)}</code></div>`,
        )
        .join('\n')
      return `<section><h2>${esc(c.name)} <small>.cui-${esc(c.name)}</small></h2><div class="swatches">${swatches}</div></section>`
    })
    .join('\n')

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Commons CSS — component gallery</title>
<style>${bundle}</style>
<style>
  body { color: var(--cui-text-default); background: var(--cui-bg-default); font-family: system-ui, sans-serif; margin: 0; padding: 1.5rem; max-width: 76rem; margin-inline: auto; }
  header { position: sticky; top: 0; z-index: 1; display: flex; gap: .75rem; align-items: center; justify-content: space-between; padding: .5rem 0; margin-block-end: 1rem; background: var(--cui-bg-default); border-block-end: 1px solid var(--cui-border-default, #8886); }
  h2 { font-size: .95rem; margin: 1.75rem 0 .5rem; } h2 small { color: var(--cui-text-muted); font-weight: 400; }
  .swatches { display: flex; flex-wrap: wrap; gap: .875rem; align-items: flex-start; }
  .swatch { display: flex; flex-direction: column; gap: .25rem; align-items: flex-start; }
  .swatch code { font-size: .7rem; color: var(--cui-text-muted); }
  /* A transform establishes a containing block, so overlay components with
     position:fixed/inset-0 (drawer, dialog…) render bounded, not full-screen. */
  .cell { transform: translateZ(0); overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center; min-width: 7rem; min-height: 3rem; max-width: 22rem; padding: .5rem; border: 1px dashed color-mix(in oklab, var(--cui-text-muted) 40%, transparent); border-radius: .375rem; }
</style>
</head>
<body>
<header>
  <strong>Commons CSS gallery — ${result.captured.length} components, no React or Tailwind</strong>
  <span style="display:flex;gap:.5rem">
    <button class="cui-button cui-button--outline cui-button--sm" onclick="var d=document.documentElement.dataset;d.theme=d.theme==='dark'?'light':'dark'">Theme</button>
    <button class="cui-button cui-button--outline cui-button--sm" onclick="var e=document.documentElement;e.dir=e.dir==='rtl'?'ltr':'rtl'">RTL</button>
  </span>
</header>
${sections}
</body>
</html>
`

  writeFileSync(join(result.distDir, 'gallery.html'), html)
  // Tracked, self-contained copy for opening directly (double-click).
  const pocDir = join(here, '..', '..', 'poc', 'non-react')
  mkdirSync(pocDir, { recursive: true })
  writeFileSync(join(pocDir, 'gallery.html'), html)
}
