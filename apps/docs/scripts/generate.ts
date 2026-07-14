// SPDX-License-Identifier: MIT

/**
 * Build-time content generation for the docs site.
 *
 * 1. Emits one MDX page per component under content/docs/components/, built
 *    from packages/react/src/components/<name>/registry.frag.json (canonical
 *    source — never hand-copied).
 * 2. Emits public/llms.txt.
 * 3. Copies the built registry (apps/registry/dist/r) to public/r so the
 *    static export serves /r/<name>.json.
 *
 * `--content-only` skips step 3 (used by typecheck, which must not require
 * the registry app to have been built).
 */

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

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
  `${JSON.stringify({ title: 'Components', defaultOpen: true }, null, 2)}\n`,
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
    changelogBody,
)

// --- 2. llms.txt ------------------------------------------------------------

const publicDir = join(appDir, 'public')
mkdirSync(publicDir, { recursive: true })
writeFileSync(join(publicDir, 'llms.txt'), buildLlmsTxt(components, loadStaticPages()))

// --- 3. Registry passthrough ------------------------------------------------

if (!contentOnly) {
  const registryDist = join(repoRoot, 'apps', 'registry', 'dist', 'r')
  if (!existsSync(join(registryDist, 'index.json'))) {
    throw new Error(
      `Registry output not found at ${registryDist}. ` +
        'Run "pnpm --filter registry build" first (turbo does this automatically for "pnpm --filter docs build").',
    )
  }
  const target = join(publicDir, 'r')
  rmSync(target, { recursive: true, force: true })
  cpSync(registryDist, target, { recursive: true })
}

console.log(
  `docs: generated ${components.length} component pages` +
    `${contentOnly ? ' (content only)' : ', llms.txt, and /r passthrough'}` +
    ` (${components.map((c) => c.name).join(', ')})`,
)
