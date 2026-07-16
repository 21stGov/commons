// SPDX-License-Identifier: MIT

'use client'

import {
  Header,
  HeaderMenuButton,
  HeaderNavigationMenu,
  type HeaderNavItem,
  HeaderTitle,
} from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

// One `items` array feeds both presentations. In the narrow docs frame the
// header renders its mobile state: an inline <details> accordion behind the Menu
// disclosure (`defaultMenuExpanded` opens it so the bar shows — tap a section to
// expand its links in place and push the content below down). From `md` up the
// same items become the floating mega-menu and the Menu button hides.
const NAV: readonly HeaderNavItem[] = [
  { label: 'Home', href: '#', current: true },
  {
    label: 'Services',
    groups: [
      {
        heading: 'Residents',
        links: [
          { label: 'Permits & licenses', href: '#' },
          { label: 'Trash & recycling', href: '#' },
          { label: 'Pay a bill', href: '#' },
        ],
      },
      {
        heading: 'Business',
        links: [
          { label: 'Start a business', href: '#' },
          { label: 'Bids & contracts', href: '#' },
        ],
      },
    ],
  },
  {
    label: 'Government',
    groups: [
      {
        heading: 'City hall',
        links: [
          { label: 'Mayor’s office', href: '#' },
          { label: 'City council', href: '#' },
          { label: 'Departments', href: '#' },
        ],
      },
    ],
  },
  { label: 'Contact', href: '#' },
]

export default function HeaderNavigationMenuDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Header navigation — mega-menu on desktop, accordion on mobile">
        <Header defaultMenuExpanded>
          <HeaderTitle title="City of Springfield" href="#" />
          <HeaderMenuButton />
          <HeaderNavigationMenu items={NAV} />
        </Header>
      </DemoSection>
    </DemoStack>
  )
}
