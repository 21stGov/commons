// SPDX-License-Identifier: MIT

import {
  Header,
  HeaderMenuButton,
  HeaderNavigationMenu,
  type HeaderNavItem,
  HeaderTitle,
} from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Header Navigation Menu'

// One `items` array renders both presentations: the floating mega-menu from
// `md` up, and an inline <details> accordion below `md` (sections expand in
// place and push the page down instead of floating over it).
const NAV: readonly HeaderNavItem[] = [
  { label: 'Home', href: '/', current: true },
  {
    label: 'Services',
    groups: [
      {
        heading: 'Residents',
        links: [
          { label: 'Permits & licenses', href: '/permits' },
          { label: 'Pay a bill', href: '/pay' },
        ],
      },
    ],
  },
  { label: 'Contact', href: '/contact' },
]

export default function Demo(): React.JSX.Element {
  return (
    <Header defaultMenuExpanded>
      <HeaderTitle title="City of Springfield" href="/" />
      <HeaderMenuButton />
      <HeaderNavigationMenu items={NAV} />
    </Header>
  )
}
