// SPDX-License-Identifier: MIT

import { HomeLayout } from 'fumadocs-ui/layouts/home'
import type { ReactNode } from 'react'

import { HomeSiteHeader } from '@/components/site-nav'
import { baseOptions } from '@/lib/layout.shared'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    // The shared SiteNav (slots.header) makes the marketing navbar identical to
    // the docs one. HomeLayout still supplies the full-width content shell and
    // the search provider the SiteNav's search trigger renders into.
    <HomeLayout {...baseOptions({ preferences: true })} slots={{ header: HomeSiteHeader }}>
      {children}
    </HomeLayout>
  )
}
