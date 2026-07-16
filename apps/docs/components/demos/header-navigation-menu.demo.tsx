// SPDX-License-Identifier: MIT

'use client'

import {
  Header,
  HeaderMenuButton,
  HeaderNavigationMenu,
  HeaderTitle,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuLinkGroup,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

// The docs demo area is narrow, so the header renders its mobile state: the
// mega-menu collapses behind the Menu disclosure. `defaultMenuExpanded` opens
// it here so the bar is visible — activate a trigger (Services / Government) to
// open its panel; from `md` up the whole bar is inline and the button hides.
export default function HeaderNavigationMenuDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Header mega-menu (activate a trigger to open its panel)">
        <Header defaultMenuExpanded>
          <HeaderTitle title="City of Springfield" href="#" />
          <HeaderMenuButton />
          <HeaderNavigationMenu>
            <NavigationMenuList className="md:gap-x-1">
              <NavigationMenuItem>
                <NavigationMenuLink href="#" current>
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem value="services">
                <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="flex flex-col gap-2 md:flex-row md:gap-6">
                    <NavigationMenuLinkGroup label="Residents">
                      <NavigationMenuLink href="#">Permits &amp; licenses</NavigationMenuLink>
                      <NavigationMenuLink href="#">Trash &amp; recycling</NavigationMenuLink>
                      <NavigationMenuLink href="#">Pay a bill</NavigationMenuLink>
                    </NavigationMenuLinkGroup>
                    <NavigationMenuLinkGroup label="Business">
                      <NavigationMenuLink href="#">Start a business</NavigationMenuLink>
                      <NavigationMenuLink href="#">Bids &amp; contracts</NavigationMenuLink>
                    </NavigationMenuLinkGroup>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem value="government">
                <NavigationMenuTrigger>Government</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLinkGroup label="City hall">
                    <NavigationMenuLink href="#">Mayor&rsquo;s office</NavigationMenuLink>
                    <NavigationMenuLink href="#">City council</NavigationMenuLink>
                    <NavigationMenuLink href="#">Departments</NavigationMenuLink>
                  </NavigationMenuLinkGroup>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink href="#">Contact</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
            <NavigationMenuViewport />
          </HeaderNavigationMenu>
        </Header>
      </DemoSection>
    </DemoStack>
  )
}
