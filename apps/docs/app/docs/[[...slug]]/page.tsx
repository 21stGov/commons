// SPDX-License-Identifier: MIT

import { createRelativeLink } from 'fumadocs-ui/mdx'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page'

import { getMDXComponents } from '@/components/mdx'
import { source } from '@/lib/source'

interface Props {
  params: Promise<{ slug?: string[] }>
}

export default async function Page(props: Props) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  const MDX = page.data.body

  return (
    // DocsLayout provides banner/nav/complementary landmarks but no <main>;
    // `contents` keeps its grid layout intact while adding the landmark.
    <main className="contents">
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

  return {
    title: page.data.title,
    description: page.data.description,
  }
}
