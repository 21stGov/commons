// SPDX-License-Identifier: MIT

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

export const title = 'Header Navigation Menu'

export default function Demo(): React.JSX.Element {
  return (
    <Header defaultMenuExpanded>
      <HeaderTitle title="City of Springfield" href="/" />
      <HeaderMenuButton />
      <HeaderNavigationMenu>
        <NavigationMenuList className="md:gap-x-1">
          <NavigationMenuItem>
            <NavigationMenuLink href="/" current>
              Home
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem value="services">
            <NavigationMenuTrigger>Services</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLinkGroup label="Residents">
                <NavigationMenuLink href="/permits">Permits &amp; licenses</NavigationMenuLink>
                <NavigationMenuLink href="/pay">Pay a bill</NavigationMenuLink>
              </NavigationMenuLinkGroup>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink href="/contact">Contact</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport />
      </HeaderNavigationMenu>
    </Header>
  )
}
