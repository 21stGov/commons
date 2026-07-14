// SPDX-License-Identifier: MIT

import * as React from 'react'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuLinkGroup,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@21stgov/commons-react'

export const title = 'Navigation Menu'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="nav-simple-heading">
        <h3 id="nav-simple-heading" className="text-sm font-semibold">
          Simple bar
        </h3>
        <NavigationMenu aria-label="Primary">
          <NavigationMenuList className="md:gap-x-1">
            <NavigationMenuItem>
              <NavigationMenuLink href="/" current>
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/departments">Departments</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/meetings">Meetings</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/contact">Contact</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuViewport />
        </NavigationMenu>
      </section>

      <section aria-labelledby="nav-mega-heading">
        <h3 id="nav-mega-heading" className="text-sm font-semibold">
          Mega-menu panel
        </h3>
        <NavigationMenu aria-label="Primary with panels">
          <NavigationMenuList className="md:gap-x-1">
            <NavigationMenuItem>
              <NavigationMenuLink href="/" current>
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem value="services">
              <NavigationMenuTrigger>Services</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="flex flex-col gap-2 md:flex-row md:gap-6">
                  <NavigationMenuLinkGroup label="Residents">
                    <NavigationMenuLink href="/permits">Permits & licenses</NavigationMenuLink>
                    <NavigationMenuLink href="/trash">Trash & recycling</NavigationMenuLink>
                    <NavigationMenuLink href="/pay">Pay a bill</NavigationMenuLink>
                  </NavigationMenuLinkGroup>
                  <NavigationMenuLinkGroup label="Business">
                    <NavigationMenuLink href="/start">Start a business</NavigationMenuLink>
                    <NavigationMenuLink href="/bids">Bids & contracts</NavigationMenuLink>
                    <NavigationMenuLink href="/zoning">Zoning</NavigationMenuLink>
                  </NavigationMenuLinkGroup>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem value="government">
              <NavigationMenuTrigger>Government</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLinkGroup label="City hall">
                  <NavigationMenuLink href="/mayor">Mayor&rsquo;s office</NavigationMenuLink>
                  <NavigationMenuLink href="/council">City council</NavigationMenuLink>
                  <NavigationMenuLink href="/departments">Departments</NavigationMenuLink>
                </NavigationMenuLinkGroup>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink href="/about">About</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuViewport />
        </NavigationMenu>
      </section>

      <section aria-labelledby="nav-rtl-heading">
        <h3 id="nav-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl">
          <NavigationMenu aria-label="التنقل الرئيسي">
            <NavigationMenuList className="md:gap-x-1">
              <NavigationMenuItem>
                <NavigationMenuLink href="/" current>
                  الرئيسية
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem value="services">
                <NavigationMenuTrigger>الخدمات</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLinkGroup label="السكان">
                    <NavigationMenuLink href="/permits">التصاريح</NavigationMenuLink>
                    <NavigationMenuLink href="/pay">دفع فاتورة</NavigationMenuLink>
                  </NavigationMenuLinkGroup>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/about">حول</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
            <NavigationMenuViewport />
          </NavigationMenu>
        </div>
      </section>
    </div>
  )
}
