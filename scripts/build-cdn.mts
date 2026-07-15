// SPDX-License-Identifier: MIT

/**
 * Build the versioned first-party CDN assets served from cdn.commonsui.com.
 *
 * Emits `dist-cdn/v<version>/`:
 *   - commons.css / commons.min.css — an all-in-one stylesheet (design tokens +
 *     themes, the accessible core reset, and the `.cui-*` component classes),
 *     so one <link> styles a framework-agnostic page. Fonts are intentionally
 *     excluded (optional; system-font fallbacks work) — they need their woff2
 *     assets served alongside and are a later addition.
 *   - commons.js / commons.min.js — the @21stgov/commons-js runtime (IIFE,
 *     auto-enhances `.cui-*` markup on load).
 *
 * The version comes from the (lockstep) package versions. Paths are immutable:
 * a given v<version>/ is uploaded once and never overwritten.
 *
 * Prerequisite: the packages must be built (`pnpm build`) so their `dist/`
 * outputs exist. Run: `pnpm --filter … build` then `tsx scripts/build-cdn.ts`.
 */

import { build, transform } from 'esbuild'
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function requireFile(path: string): string {
  return readFileSync(path, 'utf8')
}

const version: string = JSON.parse(requireFile(join(root, 'packages/css/package.json'))).version
const outDir = join(root, 'dist-cdn', `v${version}`)

rmSync(join(root, 'dist-cdn'), { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

// --- commons.css : tokens + core (in the reset layer) + component classes ---
// Same layering the docs use: core goes in `reset` so the `.cui-*` component
// rules win, tokens first so both consume the `--cui-*` variables.
const cssEntry = [
  '@layer reset;',
  `@import ${JSON.stringify(join(root, 'packages/tokens/dist/index.css'))};`,
  `@import ${JSON.stringify(join(root, 'packages/core/dist/index.css'))} layer(reset);`,
  `@import ${JSON.stringify(join(root, 'packages/css/dist/commons.css'))};`,
].join('\n')

for (const [file, minify] of [
  ['commons.css', false],
  ['commons.min.css', true],
] as const) {
  await build({
    stdin: { contents: cssEntry, resolveDir: root, loader: 'css' },
    bundle: true,
    minify,
    outfile: join(outDir, file),
    logLevel: 'warning',
  })
}

// --- commons.js : the runtime IIFE (readable + minified) ---------------------
const runtime = requireFile(join(root, 'packages/js/dist/index.global.js'))
copyFileSync(join(root, 'packages/js/dist/index.global.js'), join(outDir, 'commons.js'))
const minifiedJs = await transform(runtime, { minify: true, loader: 'js' })
writeFileSync(join(outDir, 'commons.min.js'), minifiedJs.code)

const sizes = ['commons.css', 'commons.min.css', 'commons.js', 'commons.min.js'].map(
  (f) => `${f} ${(requireFile(join(outDir, f)).length / 1024).toFixed(1)}kB`
)
console.log(`cdn: built dist-cdn/v${version}/ — ${sizes.join(', ')}`)
