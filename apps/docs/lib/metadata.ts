// SPDX-License-Identifier: MIT

import type { Metadata } from 'next'

export const siteConfig = {
  name: 'Commons',
  title: 'Commons — the public design system local government deserves',
  description:
    'An open-source, accessibility-first design system for U.S. local governments by 21st Gov.',
  url: 'https://commonsui.com',
  locale: 'en_US',
  language: 'en-US',
  repository: 'https://github.com/21stgov/commons',
  license: 'https://github.com/21stgov/commons/blob/main/LICENSE',
  socialImage: '/og-image.png',
  socialImageAlt:
    'Commons — the public design system local government deserves. Open source, accessible, and built in public.',
} as const

export function canonicalPath(path: string): string {
  if (path === '/') return '/'
  return `${path.replace(/\/+$/, '')}/`
}

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString()
}

function metaDescription(description: string): string {
  const normalized = description.replace(/\s+/g, ' ').trim()
  if (normalized.length <= 180) return normalized

  const shortened = normalized.slice(0, 177).replace(/\s+\S*$/, '')
  return `${shortened}…`
}

interface PageMetadataOptions {
  title: string
  description: string
  path: string
  markdownPath?: string
  absoluteTitle?: boolean
}

export function buildPageMetadata({
  title,
  description,
  path,
  markdownPath,
  absoluteTitle = false,
}: PageMetadataOptions): Metadata {
  const canonical = canonicalPath(path)
  const summary = metaDescription(description)

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: summary,
    alternates: {
      canonical,
      ...(markdownPath ? { types: { 'text/markdown': markdownPath } } : {}),
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description: summary,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [
        {
          url: siteConfig.socialImage,
          width: 1200,
          height: 630,
          alt: siteConfig.socialImageAlt,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: summary,
      creator: '@21stgov',
      images: [siteConfig.socialImage],
    },
  }
}

export function buildBreadcrumbs(path: string, currentTitle: string) {
  const segments = path.split('/').filter(Boolean)

  return [
    { name: 'Home', item: absoluteUrl('/') },
    ...segments.map((segment, index) => {
      const itemPath = canonicalPath(`/${segments.slice(0, index + 1).join('/')}`)
      const isCurrent = index === segments.length - 1
      const name =
        segment === 'docs'
          ? 'Docs'
          : segment === 'components'
            ? 'Components'
            : isCurrent
              ? currentTitle
              : segment
                  .split('-')
                  .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
                  .join(' ')

      return { name, item: absoluteUrl(itemPath) }
    }),
  ]
}
