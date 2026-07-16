// SPDX-License-Identifier: MIT

import { DocsLayout } from 'fumadocs-ui/layouts/notebook'
import type { ReactNode } from 'react'

import { baseOptions } from '@/lib/layout.shared'
import { source } from '@/lib/source'

export default function Layout({ children }: { children: ReactNode }) {
  const { nav, ...base } = baseOptions({ preferences: true })
  return (
    // The notebook layout with `nav.mode: 'top'` keeps the same full-width
    // top navbar as the marketing pages (title + Docs/Components/GitHub) and
    // hangs the docs sidebar below it — so moving between the home page and
    // the docs never swaps the site chrome (the default docs layout dissolves
    // the navbar into the sidebar, which read as "jumping to a new site").
    <DocsLayout
      tree={source.getPageTree()}
      sidebar={{ collapsible: false }}
      nav={{ ...nav, mode: 'top' }}
      {...base}
    >
      {children}
    </DocsLayout>
  )
}
