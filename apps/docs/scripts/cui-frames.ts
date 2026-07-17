// SPDX-License-Identifier: MIT

/**
 * Generate the "HTML" tab assets for component pages: the framework-agnostic
 * `.cui-*` demo of each component, isolated in an <iframe> so `commons.css`'s
 * own reset/theme never collides with the docs' Tailwind.
 *
 * Emits into `public/cui/`:
 *   - commons.css : the whole vanilla stylesheet chain (fonts + tokens + core +
 *                   commons.css + the playground's scaffold + authored overrides)
 *                   bundled by esbuild, with the woff2 fonts copied alongside.
 *   - commons.js  : the @21stgov/commons-js IIFE (auto-enhances the markup).
 *   - <name>.html : one standalone page per component whose vanilla fragment
 *                   exists, ready to load in the iframe. Reads `?theme=` so the
 *                   frame can follow the docs' light/dark/high-contrast theme.
 *
 * The vanilla fragments are the html-playground's own output — authored markup
 * wins over the SSR-generated fragment (same precedence the playground uses).
 */

import { build } from 'esbuild'
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { appDir, loadComponents, repoRoot } from './lib/data.ts'

const cuiDir = join(appDir, 'public', 'cui')
const playgroundSrc = join(repoRoot, 'apps', 'html-playground', 'src')

/** Read a component's vanilla fragment (authored override wins over generated). */
function fragmentFor(name: string): string | null {
  const authored = join(playgroundSrc, 'authored', `${name}.html`)
  if (existsSync(authored)) return readFileSync(authored, 'utf8')
  const generated = join(playgroundSrc, 'generated', 'demos', `${name}.html`)
  if (existsSync(generated)) return readFileSync(generated, 'utf8')
  return null
}

function framePage(name: string, fragment: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${name} — vanilla HTML (Commons)</title>
<script>
  // Follow the docs theme (?theme=light|dark|high-contrast); default to the
  // OS preference via color-scheme.
  const theme = new URLSearchParams(location.search).get('theme')
  if (theme) document.documentElement.dataset.theme = theme
</script>
<link rel="stylesheet" href="./commons.css" />
<style>
  html { color-scheme: light dark; }
  body {
    margin: 1.25rem;
    background: var(--cui-bg-default);
    color: var(--cui-text-default);
    font-family: var(--cui-font-family-sans, system-ui, sans-serif);
    font-size: 1rem;
    /* Core sets min-block-size 100dvb so a real page's body fills the viewport.
       In this height-fitted iframe that is circular: the body fills the frame,
       so its scrollHeight always equals the current frame height and the parent
       can never shrink it back down (e.g. after a wide layout replaces a tall
       narrow one). Let the body hug its content instead. */
    min-block-size: 0;
  }
</style>
</head>
<body>
${fragment.trim()}
<script src="./commons.js"></script>
</body>
</html>
`
}

export async function generateCuiFrames(): Promise<string[]> {
  rmSync(cuiDir, { recursive: true, force: true })
  mkdirSync(cuiDir, { recursive: true })

  // 1. Bundle the vanilla stylesheet chain (same order as the playground's
  //    style.css). Core goes in the `reset` layer so component classes win.
  const cssEntry = [
    '@layer reset;',
    `@import ${JSON.stringify(join(repoRoot, 'packages/fonts/index.css'))};`,
    `@import ${JSON.stringify(join(repoRoot, 'packages/tokens/dist/index.css'))};`,
    `@import ${JSON.stringify(join(repoRoot, 'packages/core/dist/index.css'))} layer(reset);`,
    `@import ${JSON.stringify(join(repoRoot, 'packages/css/dist/commons.css'))};`,
    `@import ${JSON.stringify(join(playgroundSrc, 'generated/scaffold.css'))};`,
    `@import ${JSON.stringify(join(playgroundSrc, 'authored/authored.css'))};`,
  ].join('\n')

  await build({
    stdin: { contents: cssEntry, resolveDir: repoRoot, loader: 'css' },
    bundle: true,
    outfile: join(cuiDir, 'commons.css'),
    loader: { '.woff2': 'file' },
    assetNames: 'fonts/[name]',
    logLevel: 'warning',
  })

  // 2. The runtime (IIFE — auto-enhances on load).
  const jsSource = join(repoRoot, 'packages/js/dist/index.global.js')
  if (!existsSync(jsSource)) {
    throw new Error(
      `Missing ${jsSource}. Run "pnpm --filter @21stgov/commons-js build" first (turbo does this for the docs build).`,
    )
  }
  copyFileSync(jsSource, join(cuiDir, 'commons.js'))

  // 3. One standalone frame per component that has a vanilla fragment.
  const emitted: string[] = []
  for (const component of loadComponents()) {
    const fragment = fragmentFor(component.name)
    if (fragment == null) continue
    writeFileSync(join(cuiDir, `${component.name}.html`), framePage(component.name, fragment))
    emitted.push(component.name)
  }
  return emitted
}
