// SPDX-License-Identifier: MIT

/**
 * Post-export step. Runs after `next build` (output: 'export').
 *
 * 1. Writes the Markdown mirror for every docs page into out/ — the mirror of
 *    route `/docs/x` lives at `/docs/x.md` (docs/ai-and-agents.md, Layer 1).
 *    Component mirrors are rendered from the same registry-fragment data as
 *    the HTML pages; hand-written pages get a light MDX→Markdown transform.
 * 2. Verifies the export contains the artifacts the site contract promises.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { appDir, loadComponents } from './lib/data.ts'
import { loadStaticPages } from './lib/llms.ts'
import { buildComponentMd, buildComponentsIndexMdx } from './lib/render.ts'

const outDir = join(appDir, 'out')
if (!existsSync(outDir)) {
  throw new Error(`Static export not found at ${outDir}. Run "next build" first.`)
}

function writeMirror(routePath: string, markdown: string): void {
  const target = join(outDir, ...`${routePath.replace(/^\//, '')}.md`.split('/'))
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, markdown)
}

/**
 * Light MDX→Markdown transform for the hand-written pages. They are kept
 * nearly pure Markdown by convention; the only JSX they may use is
 * <Tabs>/<Tab> for package-manager variants.
 */
function mdxToMarkdown(raw: string): string {
  let body = raw

  // Frontmatter → H1 + blockquote description.
  let header = ''
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(body)
  if (fm) {
    body = body.slice(fm[0].length)
    const title = /^title:\s*["']?(.*?)["']?\s*$/m.exec(fm[1])?.[1]
    const description = /^description:\s*["']?(.*?)["']?\s*$/m.exec(fm[1])?.[1]
    if (title) header += `# ${title}\n\n`
    if (description) header += `> ${description}\n\n`
  }

  body = body
    // MDX comments
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    // import statements at top level
    .replace(/^import\s.*$/gm, '')
    // <Tab value="pnpm"> → **pnpm** label; closing/opening Tabs dropped
    .replace(/<Tab\s+value="([^"]+)">/g, '**$1**')
    .replace(/<\/?Tabs?[^>]*>/g, '')
    // collapse excess blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return `${header}${body}\n`
}

const components = loadComponents()
const staticPages = loadStaticPages()
const contentDir = join(appDir, 'content', 'docs')

for (const page of staticPages) {
  const raw = readFileSync(join(contentDir, `${page.slug}.mdx`), 'utf8')
  const route = page.slug === 'index' ? '/docs' : `/docs/${page.slug}`
  writeMirror(route, mdxToMarkdown(raw))
}

writeMirror('/docs/components', mdxToMarkdown(buildComponentsIndexMdx(components)))
for (const component of components) {
  writeMirror(`/docs/components/${component.name}`, buildComponentMd(component))
}

// --- Verification ------------------------------------------------------------

const required = [
  'index.html',
  'llms.txt',
  'docs.md',
  join('docs', 'index.html'),
  join('r', 'index.json'),
  join('schema', 'README.md'),
  ...components.flatMap((c) => [
    join('r', `${c.name}.json`),
    join('docs', 'components', c.name, 'index.html'),
    join('docs', 'components', `${c.name}.md`),
  ]),
]

const missing = required.filter((rel) => !existsSync(join(outDir, rel)))
if (missing.length > 0) {
  throw new Error(`Static export is missing required artifacts:\n  ${missing.join('\n  ')}`)
}

console.log(
  `docs: wrote ${staticPages.length + components.length + 1} Markdown mirrors; ` +
    `verified ${required.length} required artifacts in out/`,
)
