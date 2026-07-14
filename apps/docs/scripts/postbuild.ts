// SPDX-License-Identifier: MIT

/**
 * Post-export step. Runs after `next build` (output: 'export').
 *
 * 1. Writes the Markdown mirror for every docs page into out/ — the mirror of
 *    route `/docs/x` lives at `/docs/x.md` (docs/ai-and-agents.md, Layer 1).
 *    Component mirrors are rendered from the same registry-fragment data as
 *    the HTML pages; hand-written pages get a light MDX→Markdown transform.
 * 2. Writes /llms-full.txt from those same Markdown mirrors.
 * 3. Verifies the export contains the SEO and agent artifacts the site
 *    contract promises.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { appDir, loadComponents, siteUrl } from './lib/data.ts'
import { loadStaticPages } from './lib/llms.ts'
import { buildComponentMd, buildComponentsIndexMdx } from './lib/render.ts'

const outDir = join(appDir, 'out')
if (!existsSync(outDir)) {
  throw new Error(`Static export not found at ${outDir}. Run "next build" first.`)
}

const markdownMirrors: Array<{ route: string; markdown: string }> = []

function writeMirror(routePath: string, markdown: string): void {
  const target = join(outDir, ...`${routePath.replace(/^\//, '')}.md`.split('/'))
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, markdown)
  markdownMirrors.push({ route: routePath, markdown })
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

const corpusContents = markdownMirrors
  .map(
    ({ route, markdown }) =>
      `<!-- Canonical HTML: ${siteUrl}${route}/ -->\n` +
      `<!-- Markdown mirror: ${siteUrl}${route}.md -->\n\n` +
      markdown.trim()
  )
  .join('\n\n---\n\n')

writeFileSync(
  join(outDir, 'llms-full.txt'),
  `# Commons — Full Documentation Corpus

> Generated from the same canonical, versioned sources as commonsui.com. For a
> concise map of the project, use ${siteUrl}/llms.txt. Commons is MIT licensed;
> Atkinson Hyperlegible font files are licensed separately under the SIL Open
> Font License 1.1.

${corpusContents}
`
)

// --- Verification ------------------------------------------------------------

const required = [
  'index.html',
  'llms.txt',
  'llms-full.txt',
  'robots.txt',
  'sitemap.xml',
  'manifest.webmanifest',
  'og-image.png',
  'docs.md',
  join('docs', 'index.html'),
  join('r', 'index.json'),
  ...staticPages.flatMap((page) => {
    if (page.slug === 'index') return []
    return [join('docs', page.slug, 'index.html'), join('docs', `${page.slug}.md`)]
  }),
  ...components.flatMap((component) => [
    join('r', `${component.name}.json`),
    join('docs', 'components', component.name, 'index.html'),
    join('docs', 'components', `${component.name}.md`),
  ]),
]

const missing = required.filter((relativePath) => !existsSync(join(outDir, relativePath)))
if (missing.length > 0) {
  throw new Error(`Static export is missing required artifacts:\n  ${missing.join('\n  ')}`)
}

const seoHtmlFiles = [
  'index.html',
  ...staticPages.map((page) =>
    page.slug === 'index' ? join('docs', 'index.html') : join('docs', page.slug, 'index.html')
  ),
  join('docs', 'components', 'index.html'),
  ...components.map((component) => join('docs', 'components', component.name, 'index.html')),
]

const requiredHeadMarkers = [
  '<title>',
  'name="description"',
  'rel="canonical"',
  'property="og:title"',
  'property="og:description"',
  'property="og:image"',
  'name="twitter:card"',
]

const invalidSeoPages: string[] = []
for (const relativePath of seoHtmlFiles) {
  const html = readFileSync(join(outDir, relativePath), 'utf8')
  const missingMarkers = requiredHeadMarkers.filter((marker) => !html.includes(marker))
  if (!html.includes('type="application/ld+json"')) missingMarkers.push('JSON-LD')
  if (missingMarkers.length > 0) {
    invalidSeoPages.push(`${relativePath}: ${missingMarkers.join(', ')}`)
  }
}

if (invalidSeoPages.length > 0) {
  throw new Error(`Exported pages are missing SEO metadata:\n  ${invalidSeoPages.join('\n  ')}`)
}

const robots = readFileSync(join(outDir, 'robots.txt'), 'utf8')
if (!robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) {
  throw new Error('robots.txt does not advertise the canonical sitemap URL.')
}

const sitemap = readFileSync(join(outDir, 'sitemap.xml'), 'utf8')
for (const url of [`${siteUrl}/`, `${siteUrl}/docs/`, `${siteUrl}/docs/components/`]) {
  if (!sitemap.includes(`<loc>${url}</loc>`)) {
    throw new Error(`sitemap.xml is missing canonical URL: ${url}`)
  }
}

const socialImage = readFileSync(join(outDir, 'og-image.png'))
const socialImageWidth = socialImage.readUInt32BE(16)
const socialImageHeight = socialImage.readUInt32BE(20)
if (socialImageWidth !== 1200 || socialImageHeight !== 630) {
  throw new Error(
    `og-image.png must be 1200×630; received ${socialImageWidth}×${socialImageHeight}.`
  )
}

const llmsIndex = readFileSync(join(outDir, 'llms.txt'), 'utf8')
if (!llmsIndex.includes(`${siteUrl}/llms-full.txt`)) {
  throw new Error('llms.txt does not link to the generated full documentation corpus.')
}

console.log(
  `docs: wrote ${staticPages.length + components.length + 1} Markdown mirrors; ` +
    `verified ${required.length} required artifacts and ${seoHtmlFiles.length} SEO pages in out/`
)
