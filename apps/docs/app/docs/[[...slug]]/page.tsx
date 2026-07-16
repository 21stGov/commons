// SPDX-License-Identifier: MIT

import { createRelativeLink } from 'fumadocs-ui/mdx'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

// Must match the layout family: app/docs/layout.tsx uses the notebook
// DocsLayout (persistent top navbar), so the page parts come from notebook too.
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/notebook/page'

import { getMDXComponents } from '@/components/mdx'
import { StructuredData } from '@/components/structured-data'
import {
  absoluteUrl,
  buildBreadcrumbs,
  buildPageMetadata,
  canonicalPath,
  siteConfig,
} from '@/lib/metadata'
import { source } from '@/lib/source'

interface Props {
  params: Promise<{ slug?: string[] }>
}

export default async function Page(props: Props) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  const MDX = page.data.body
  const canonical = canonicalPath(page.url)
  const canonicalUrl = absoluteUrl(canonical)
  const breadcrumbs = buildBreadcrumbs(page.url, page.data.title)
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        '@id': `${canonicalUrl}#article`,
        headline: page.data.title,
        description: page.data.description,
        url: canonicalUrl,
        mainEntityOfPage: canonicalUrl,
        inLanguage: siteConfig.language,
        isAccessibleForFree: true,
        image: absoluteUrl(siteConfig.socialImage),
        license: siteConfig.license,
        isPartOf: { '@id': `${siteConfig.url}/#website` },
        about: { '@id': `${siteConfig.url}/#software` },
        author: { '@id': 'https://21stgov.com/#organization' },
        publisher: { '@id': 'https://21stgov.com/#organization' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((breadcrumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: breadcrumb.name,
          item: breadcrumb.item,
        })),
      },
    ],
  }

  return (
    // DocsLayout provides banner/nav/complementary landmarks but no <main>;
    // `contents` keeps its grid layout intact while adding the landmark.
    <main className="contents">
      <StructuredData data={structuredData} />
      <DocsPage
        toc={page.data.toc}
        full={page.data.full}
        footer={{ className: 'docs-page-footer' }}
      >
        {/* Skip-link target: the start of the page's main content. */}
        <span id="main" tabIndex={-1} className="sr-only">
          Main content
        </span>
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
        <DocsBody>
          <MDX
            components={getMDXComponents({
              a: createRelativeLink(source, page),
            })}
          />
        </DocsBody>
      </DocsPage>
    </main>
  )
}

export async function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  return buildPageMetadata({
    title: page.data.title,
    description:
      page.data.description ?? `${page.data.title} documentation for the Commons design system.`,
    path: page.url,
    markdownPath: `${page.url}.md`,
  })
}
