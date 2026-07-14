// SPDX-License-Identifier: MIT

import '@21stgov/commons-fonts/index.css'
import './globals.css'

import { RootProvider } from 'fumadocs-ui/provider/next'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { SearchDialog } from '@/components/search-dialog'
import { RouteScrollReset } from '@/components/route-scroll-reset'

export const metadata: Metadata = {
  metadataBase: new URL('https://commonsui.com'),
  title: {
    template: '%s | Commons',
    default: 'Commons — the public design system local government deserves',
  },
  description:
    'An open-source, accessibility-first design system for U.S. local governments by 21st Gov.',
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
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
