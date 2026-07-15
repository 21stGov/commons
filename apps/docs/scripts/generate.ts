// SPDX-License-Identifier: MIT

/**
 * Build-time content generation for the docs site.
 *
 * 1. Emits one MDX page per component under content/docs/components/, built
 *    from packages/react/src/components/<name>/registry.frag.json (canonical
 *    source — never hand-copied).
 * 2. Emits public/llms.txt.
 * 3. Emits public/schema/*.json — the resolvable JSON Schema documents behind
 *    the /schema/ `$schema` URLs, generated from the CLI's zod schemas.
 * 4. Copies the built registry (apps/registry/dist/r) to public/r so the
 *    static export serves /r/<name>.json.
 *
 * `--content-only` skips step 4 (used by typecheck, which must not require
 * the registry app to have been built).
 */

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { buildJsonSchemas } from '../../../packages/cli/src/schemas.ts'

import { appDir, loadComponents, repoRoot } from './lib/data.ts'
import { buildLlmsTxt, loadStaticPages } from './lib/llms.ts'
import { buildComponentMdx, buildComponentsIndexMdx } from './lib/render.ts'

const contentOnly = process.argv.includes('--content-only')

const components = loadComponents()

// --- 1. Generated component MDX pages --------------------------------------

const generatedDir = join(appDir, 'content', 'docs', 'components')
rmSync(generatedDir, { recursive: true, force: true })
mkdirSync(generatedDir, { recursive: true })

for (const component of components) {
  writeFileSync(join(generatedDir, `${component.name}.mdx`), buildComponentMdx(component))
}
writeFileSync(join(generatedDir, 'index.mdx'), buildComponentsIndexMdx(components))
writeFileSync(
  join(generatedDir, 'meta.json'),
  `${JSON.stringify({ title: 'Components', defaultOpen: true }, null, 2)}\n`
)

// --- 1b. Changelog page (from the repo-root CHANGELOG.md) -------------------
// The root CHANGELOG.md is the single source of truth; this mirrors it onto the
// docs site so there is one changelog, not two that drift.

const changelogBody = readFileSync(join(repoRoot, 'CHANGELOG.md'), 'utf8')
  // Drop the top-level "# Changelog" heading — the page title comes from the
  // frontmatter below.
  .replace(/^#\s+Changelog\s*\n+/, '')
writeFileSync(
  join(appDir, 'content', 'docs', 'changelog.mdx'),
  `---\ntitle: "Changelog"\ndescription: "Notable, user-facing changes to Commons, release by release."\n---\n\n` +
    `{/* GENERATED from the repo-root CHANGELOG.md — edit that file, not this one. */}\n\n` +
    changelogBody
)

// --- 2. llms.txt ------------------------------------------------------------

const publicDir = join(appDir, 'public')
mkdirSync(publicDir, { recursive: true })
writeFileSync(join(publicDir, 'llms.txt'), buildLlmsTxt(components, loadStaticPages()))

// --- 3. JSON schemas --------------------------------------------------------
// Resolvable documents behind the /schema/ `$schema` URLs that registry items,
// the catalog, CLI --json output, and commons.json declare. Generated from the
// CLI's own zod schemas so the published contract can never drift from code.

const schemaDir = join(publicDir, 'schema')
mkdirSync(schemaDir, { recursive: true })
for (const [file, doc] of Object.entries(buildJsonSchemas())) {
  writeFileSync(join(schemaDir, file), `${JSON.stringify(doc, null, 2)}\n`)
}

// --- 4. Registry passthrough ------------------------------------------------

if (!contentOnly) {
  const registryDist = join(repoRoot, 'apps', 'registry', 'dist', 'r')
  if (!existsSync(join(registryDist, 'index.json'))) {
    throw new Error(
      `Registry output not found at ${registryDist}. ` +
        'Run "pnpm --filter registry build" first (turbo does this automatically for "pnpm --filter docs build").'
    )
  }
  const target = join(publicDir, 'r')
  rmSync(target, { recursive: true, force: true })
  cpSync(registryDist, target, { recursive: true })
}

// --- Vanilla "HTML" tab frames (public/cui/*) ------------------------------
// The iframe assets for each component page's HTML tab. Skipped in
// --content-only mode (esbuild + font copy is heavier, not needed for a
// content-only MDX refresh).
let cuiFrameCount = 0
if (!contentOnly) {
  const { generateCuiFrames } = await import('./cui-frames.ts')
  cuiFrameCount = (await generateCuiFrames()).length
}

console.log(
  `docs: generated ${components.length} component pages, JSON schemas` +
    `${contentOnly ? ' (content only)' : `, llms.txt, /r passthrough, and ${cuiFrameCount} vanilla HTML frames`}` +
    ` (${components.map((c) => c.name).join(', ')})`
)
