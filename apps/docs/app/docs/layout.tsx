// SPDX-License-Identifier: MIT

import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import type { ReactNode } from 'react'

import { baseOptions } from '@/lib/layout.shared'
import { source } from '@/lib/source'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      sidebar={{ collapsible: false }}
      {...baseOptions({ preferences: true })}
    >
      {children}
    </DocsLayout>
  )
}
