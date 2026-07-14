// SPDX-License-Identifier: MIT

'use client'

import {
  Icon,
  Sidebar,
  SidebarGroup,
  SidebarItem,
  SidebarNav,
  SidebarSection,
  SidebarTrigger,
} from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function SidebarDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Department navigation">
        <div className="max-w-64 rounded-md border border-border">
          <Sidebar defaultMenuExpanded>
            <SidebarNav ariaLabel="Parks &amp; Recreation">
              <SidebarItem href="#overview" icon={<Icon name="map-pin" />} current>
                Overview
              </SidebarItem>
              <SidebarGroup label="Permits &amp; licenses" defaultOpen>
                <SidebarItem href="#event-permits">Event permits</SidebarItem>
                <SidebarItem href="#facility-rentals">Facility rentals</SidebarItem>
                <SidebarItem href="#vendor-licenses">Vendor licenses</SidebarItem>
              </SidebarGroup>
              <SidebarGroup label="Programs">
                <SidebarItem href="#youth">Youth sports</SidebarItem>
                <SidebarItem href="#senior">Senior activities</SidebarItem>
              </SidebarGroup>
              <SidebarSection label="Resources">
                <SidebarItem href="#forms" icon={<Icon name="download" />}>
                  Forms &amp; documents
                </SidebarItem>
                <SidebarItem href="#contact" icon={<Icon name="mail" />}>
                  Contact us
                </SidebarItem>
              </SidebarSection>
            </SidebarNav>
          </Sidebar>
        </div>
      </DemoSection>

      <DemoSection title="Responsive (collapses behind a menu button)">
        <p className="max-w-prose text-sm text-muted-foreground">
          Resize the frame below the <code>md</code> breakpoint: the rail
          collapses behind the “Sections” button. It is a disclosure — Escape
          closes it and returns focus to the button; the links stay in the DOM
          so find-in-page keeps working.
        </p>
        <div className="max-w-64 rounded-md border border-border p-2">
          <Sidebar>
            <SidebarTrigger />
            <SidebarNav ariaLabel="City services" className="pt-1">
              <SidebarItem href="#pay" current>
                Pay a bill
              </SidebarItem>
              <SidebarItem href="#report">Report an issue</SidebarItem>
              <SidebarItem href="#permits">Apply for a permit</SidebarItem>
            </SidebarNav>
          </Sidebar>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
