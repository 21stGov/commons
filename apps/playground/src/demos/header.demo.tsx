// SPDX-License-Identifier: MIT

import * as React from 'react'

import {
  GovBanner,
  Header,
  HeaderMenuButton,
  HeaderNav,
  HeaderNavLink,
  HeaderTitle,
} from '@21stgov/commons-react'

export const title = 'Header'

/** Decorative placeholder seal so the logo slot has something to show. */
function SealLogo(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-3 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.5" />
      <path d="M12 6.5v11M6.5 12h11" strokeLinecap="round" />
    </svg>
  )
}

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="header-full-heading">
        <h3 id="header-full-heading" className="text-sm font-semibold">
          Full page top: GovBanner + Header (resize the window — below the md breakpoint the nav
          collapses behind the Menu disclosure; Escape closes it)
        </h3>
        <div>
          <GovBanner entity="the City of Springfield" />
          <Header>
            <HeaderTitle title="City of Springfield" href="#demo-header" logo={<SealLogo />} />
            <HeaderMenuButton />
            <HeaderNav>
              <HeaderNavLink href="#demo-header" current>
                Services
              </HeaderNavLink>
              <HeaderNavLink href="#demo-header">Payments</HeaderNavLink>
              <HeaderNavLink href="#demo-header">Meetings</HeaderNavLink>
              <HeaderNavLink href="#demo-header">Contact</HeaderNavLink>
            </HeaderNav>
          </Header>
        </div>
      </section>

      <section aria-labelledby="header-expanded-heading">
        <h3 id="header-expanded-heading" className="text-sm font-semibold">
          Mobile menu expanded by default (what narrow viewports see after activating Menu)
        </h3>
        <Header defaultMenuExpanded>
          <HeaderTitle title="Springfield Public Library" href="#demo-header" />
          <HeaderMenuButton />
          <HeaderNav>
            <HeaderNavLink href="#demo-header">Catalog</HeaderNavLink>
            <HeaderNavLink href="#demo-header" current>
              Events
            </HeaderNavLink>
            <HeaderNavLink href="#demo-header">Locations</HeaderNavLink>
            <HeaderNavLink href="#demo-header">Get a card</HeaderNavLink>
          </HeaderNav>
        </Header>
      </section>

      <section aria-labelledby="header-rtl-heading">
        <h3 id="header-rtl-heading" className="text-sm font-semibold">
          RTL (Arabic — all strings are props)
        </h3>
        <div dir="rtl">
          <Header>
            <HeaderTitle title="مدينة سبرينغفيلد" href="#demo-header" logo={<SealLogo />} />
            <HeaderMenuButton menuLabel="القائمة" />
            <HeaderNav ariaLabel="التنقل الرئيسي">
              <HeaderNavLink href="#demo-header" current>
                الخدمات
              </HeaderNavLink>
              <HeaderNavLink href="#demo-header">المدفوعات</HeaderNavLink>
              <HeaderNavLink href="#demo-header">الاجتماعات</HeaderNavLink>
              <HeaderNavLink href="#demo-header">اتصل بنا</HeaderNavLink>
            </HeaderNav>
          </Header>
        </div>
      </section>
    </div>
  )
}
