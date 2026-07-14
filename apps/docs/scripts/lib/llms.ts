// SPDX-License-Identifier: MIT

/** Builds /llms.txt — the machine-readable map of the site (docs/ai-and-agents.md, Layer 1). */

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { appDir, type ComponentDoc, githubUrl, siteUrl } from './data.ts'

interface StaticPage {
  slug: string
  title: string
  description: string
}

/** Read title/description frontmatter from the hand-written getting-started pages. */
export function loadStaticPages(): StaticPage[] {
  const contentDir = join(appDir, 'content', 'docs')
  const order = ['index', 'installation', 'theming', 'cli', 'mcp', 'accessibility']

  const pages: StaticPage[] = []
  for (const entry of readdirSync(contentDir)) {
    if (!entry.endsWith('.mdx')) continue
    const slug = entry.replace(/\.mdx$/, '')
    const raw = readFileSync(join(contentDir, entry), 'utf8')
    const title = /^title:\s*["']?(.*?)["']?\s*$/m.exec(raw)?.[1] ?? slug
    const description = /^description:\s*["']?(.*?)["']?\s*$/m.exec(raw)?.[1] ?? ''
    pages.push({ slug, title, description })
  }

  return pages.sort((a, b) => {
    const ai = order.indexOf(a.slug)
    const bi = order.indexOf(b.slug)
    return (ai === -1 ? order.length : ai) - (bi === -1 ? order.length : bi)
  })
}

export function buildLlmsTxt(components: ComponentDoc[], staticPages: StaticPage[]): string {
  const pageUrl = (slug: string): string =>
    slug === 'index' ? `${siteUrl}/docs.md` : `${siteUrl}/docs/${slug}.md`

  const docLines = staticPages
    .map((p) => `- [${p.title}](${pageUrl(p.slug)})${p.description ? `: ${p.description}` : ''}`)
    .join('\n')

  const componentLines = components
    .map(
      (c) =>
        `- [${c.title}](${siteUrl}/docs/components/${c.name}.md): ${c.description} (status: ${c.status})`,
    )
    .join('\n')

  const registryLines = components
    .map((c) => `- [${c.name}](${siteUrl}/r/${c.name}.json)`)
    .join('\n')

  return `# Commons

> The public design system local government deserves. Commons is an
> open-source, accessibility-first design system for U.S. local governments by
> 21st Gov (MIT license). WCAG 2.2 AA baseline with selected AAA defaults; the
> CLI copies component source into your repository so you own the code.

Every documentation page has a Markdown mirror at the same path with a \`.md\`
extension. Component pages include the normative accessibility contract. The
component registry is deterministic JSON served under \`/r/\`.

## Documentation

${docLines}
- [Components overview](${siteUrl}/docs/components.md): Every component, its status, and its accessibility contract.

## Components

${componentLines}

## Registry (machine-readable JSON)

- [Catalog index](${siteUrl}/r/index.json): names, summaries, status, and item URLs for every component.
${registryLines}

## Source

- [GitHub repository](${githubUrl})
- [npm CLI package: @21stgov/commons](https://www.npmjs.com/package/@21stgov/commons)

## Optional

- [JSON schemas](${siteUrl}/schema/): not yet published; registry items declare their intended \`$schema\` URLs.
`
}
