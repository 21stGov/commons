// SPDX-License-Identifier: MIT

import type { MetadataRoute } from 'next'

import { absoluteUrl, canonicalPath } from '@/lib/metadata'
import { source } from '@/lib/source'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const docsPages: MetadataRoute.Sitemap = source
    .getPages()
    .map((page) => {
      const isComponentsIndex = page.url === '/docs/components'
      const isComponent = page.url.startsWith('/docs/components/')

      return {
        url: absoluteUrl(canonicalPath(page.url)),
        changeFrequency: 'weekly' as const,
        priority: isComponentsIndex ? 0.9 : isComponent ? 0.7 : 0.8,
      }
    })
    .sort((a, b) => a.url.localeCompare(b.url))

  // Standalone pages outside the docs tree (footer-linked policy / legal /
  // roadmap pages). Kept in sync with the footer links in site-footer.tsx.
  const standalonePages: MetadataRoute.Sitemap = [
    '/roadmap',
    '/terms',
    '/privacy',
    '/acceptable-use',
    '/accessibility-statement',
    '/disclaimer',
  ].map((path) => ({
    url: absoluteUrl(canonicalPath(path)),
    changeFrequency: 'yearly' as const,
    priority: 0.4,
  }))

  return [
    {
      url: absoluteUrl('/'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...standalonePages,
    ...docsPages,
  ]
}
