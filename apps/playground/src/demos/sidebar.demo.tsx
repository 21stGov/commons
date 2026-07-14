// SPDX-License-Identifier: MIT

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

export const title = 'Sidebar'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="sidebar-nav-heading">
        <h3 id="sidebar-nav-heading" className="text-sm font-semibold">
          Department navigation
        </h3>
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
      </section>

      <section aria-labelledby="sidebar-responsive-heading">
        <h3 id="sidebar-responsive-heading" className="text-sm font-semibold">
          Responsive disclosure
        </h3>
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
      </section>

      <section aria-labelledby="sidebar-rtl-heading">
        <h3 id="sidebar-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl" className="max-w-64 rounded-md border border-border">
          <Sidebar defaultMenuExpanded>
            <SidebarNav ariaLabel="أقسام">
              <SidebarItem href="#home" current>
                الرئيسية
              </SidebarItem>
              <SidebarGroup label="الخدمات" defaultOpen>
                <SidebarItem href="#permits">التصاريح</SidebarItem>
                <SidebarItem href="#facilities">المرافق</SidebarItem>
              </SidebarGroup>
            </SidebarNav>
          </Sidebar>
        </div>
      </section>
    </div>
  )
}
