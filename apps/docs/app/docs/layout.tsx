// SPDX-License-Identifier: MIT

import { DocsLayout } from 'fumadocs-ui/layouts/notebook'
import type { ReactNode } from 'react'

import { DocsSiteHeader } from '@/components/site-nav'
import { baseOptions } from '@/lib/layout.shared'
import { source } from '@/lib/source'

export default function Layout({ children }: { children: ReactNode }) {
  const { nav, ...base } = baseOptions({ preferences: true })
  return (
    // The notebook layout gives docs a persistent top navbar + a sidebar below
    // it. `slots.header` swaps in the shared SiteNav so this navbar is byte-
    // identical to the marketing home's; the small-screen control is the
    // sidebar trigger (opens the page tree).
    <DocsLayout
      tree={source.getPageTree()}
      sidebar={{ collapsible: false }}
      nav={{ ...nav, mode: 'top' }}
      slots={{ header: DocsSiteHeader }}
      {...base}
    >
      {children}
    </DocsLayout>
  )
}
