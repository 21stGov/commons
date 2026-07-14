// SPDX-License-Identifier: MIT

import '@21stgov/commons-fonts/index.css'
import './globals.css'

import { RootProvider } from 'fumadocs-ui/provider/next'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { FathomAnalytics } from '@/components/fathom-analytics'
import { RouteScrollReset } from '@/components/route-scroll-reset'
import { SearchDialog } from '@/components/search-dialog'
import { SiteFooter } from '@/components/site-footer'
import { buildPageMetadata, siteConfig } from '@/lib/metadata'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  ...buildPageMetadata({
    title: siteConfig.title,
    description: siteConfig.description,
    path: '/',
    absoluteTitle: true,
  }),
  title: {
    template: '%s | Commons',
    default: siteConfig.title,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: '21st Gov', url: 'https://21stgov.com' }],
  creator: '21st Gov',
  publisher: '21st Gov',
  category: 'technology',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png', sizes: '500x500' }],
    shortcut: ['/favicon.png'],
    apple: [{ url: '/favicon.png', type: 'image/png', sizes: '500x500' }],
  },
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9fafa' },
    { media: '(prefers-color-scheme: dark)', color: '#1b1c1d' },
  ],
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        {/*
          Theme switching writes BOTH the `class` attribute (Fumadocs UI keys
          its own dark styles on `.dark`) and `data-theme` (Commons tokens key
          light / dark / high-contrast on it), so live component demos re-theme
          together with the docs shell.
        */}
        <RootProvider
          theme={{
            attribute: ['class', 'data-theme'],
            defaultTheme: 'system',
            enableSystem: true,
            themes: ['light', 'dark', 'high-contrast'],
          }}
          search={{ SearchDialog }}
        >
          <a href="#main" className="skip-link">
            Skip to main content
          </a>
          <RouteScrollReset />
          <FathomAnalytics />
          {children}
          <SiteFooter />
        </RootProvider>
      </body>
    </html>
  )
}
