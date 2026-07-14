// SPDX-License-Identifier: MIT

'use client'

import {
  GovBanner,
  Header,
  HeaderMenuButton,
  HeaderNav,
  HeaderNavLink,
  HeaderTitle,
} from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

// The docs demo area is narrow, so the header renders its mobile state here:
// the nav collapses behind the Menu disclosure — exactly what phone users get.
export default function HeaderDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="With the gov banner above (activate “Menu” — Escape closes it)">
        <div>
          <GovBanner entity="the City of Springfield" />
          <Header>
            <HeaderTitle title="City of Springfield" href="#" />
            <HeaderMenuButton />
            <HeaderNav>
              <HeaderNavLink href="#" current>
                Services
              </HeaderNavLink>
              <HeaderNavLink href="#">Payments</HeaderNavLink>
              <HeaderNavLink href="#">Meetings</HeaderNavLink>
              <HeaderNavLink href="#">Contact</HeaderNavLink>
            </HeaderNav>
          </Header>
        </div>
      </DemoSection>

      <DemoSection title="Menu expanded (aria-current marks the current page)">
        <Header defaultMenuExpanded>
          <HeaderTitle title="Springfield Public Library" href="#" />
          <HeaderMenuButton />
          <HeaderNav>
            <HeaderNavLink href="#">Catalog</HeaderNavLink>
            <HeaderNavLink href="#" current>
              Events
            </HeaderNavLink>
            <HeaderNavLink href="#">Locations</HeaderNavLink>
          </HeaderNav>
        </Header>
      </DemoSection>
    </DemoStack>
  )
}
