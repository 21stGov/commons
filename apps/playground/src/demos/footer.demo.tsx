// SPDX-License-Identifier: MIT

import * as React from 'react'

import {
  Footer,
  FooterBottom,
  FooterCopyright,
  FooterLink,
  FooterNav,
  FooterSection,
  Identifier,
  IdentifierResource,
  IdentifierIdentity,
  IdentifierLink,
  IdentifierLinks,
} from '@21stgov/commons-react'

export const title = 'Footer'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="footer-stacked-heading">
        <h3 id="footer-stacked-heading" className="text-sm font-semibold">
          Footer + identifier stacked, as they ship at the bottom of a real site
        </h3>
        <Footer>
          <FooterNav>
            <FooterSection heading="Services">
              <FooterLink href="#trash">Trash and recycling</FooterLink>
              <FooterLink href="#permits">Permits and licenses</FooterLink>
              <FooterLink href="#payments">Pay a bill</FooterLink>
            </FooterSection>
            <FooterSection heading="Government">
              <FooterLink href="#council">City council</FooterLink>
              <FooterLink href="#meetings">Public meetings</FooterLink>
              <FooterLink href="#jobs">Jobs</FooterLink>
            </FooterSection>
            <FooterSection heading="Connect">
              <FooterLink href="#news">News</FooterLink>
              <FooterLink href="#contact">Contact us</FooterLink>
            </FooterSection>
          </FooterNav>
          <FooterBottom agencyName="City of Example">
            <a href="tel:+15555550100" className="inline-flex min-h-11 items-center underline">
              (555) 555-0100
            </a>
            <a
              href="mailto:info@cityofexample.example"
              className="inline-flex min-h-11 items-center underline"
            >
              info@cityofexample.example
            </a>
          </FooterBottom>
          <Identifier>
            <IdentifierIdentity agencyName="City of Example" domain="cityofexample.example" />
            <IdentifierLinks>
              <IdentifierLink href="#about">About the City of Example</IdentifierLink>
              <IdentifierLink href="#accessibility">Accessibility statement</IdentifierLink>
              <IdentifierLink href="#records">Public records</IdentifierLink>
              <IdentifierLink href="#privacy">Privacy policy</IdentifierLink>
            </IdentifierLinks>
            <IdentifierResource
              text="Need help finding a city service?"
              linkText="Contact the City"
              href="#contact"
            />
          </Identifier>
          <FooterCopyright>City of Example</FooterCopyright>
        </Footer>
      </section>

      <section aria-labelledby="footer-levels-heading">
        <h3 id="footer-levels-heading" className="text-sm font-semibold">
          Custom heading level (headingLevel="h4" to fit the page outline)
        </h3>
        <Footer>
          <FooterNav ariaLabel="Footer (heading level demo)">
            <FooterSection heading="Services" headingLevel="h4">
              <FooterLink href="#trash">Trash and recycling</FooterLink>
              <FooterLink href="#permits">Permits and licenses</FooterLink>
            </FooterSection>
            <FooterSection heading="Government" headingLevel="h4">
              <FooterLink href="#council">City council</FooterLink>
            </FooterSection>
          </FooterNav>
        </Footer>
      </section>

      <section aria-labelledby="footer-rtl-heading">
        <h3 id="footer-rtl-heading" className="text-sm font-semibold">
          RTL (Arabic — columns and the agency line mirror automatically)
        </h3>
        <div dir="rtl">
          <Footer lang="ar">
            <FooterNav ariaLabel="تذييل الصفحة">
              <FooterSection heading="الخدمات">
                <FooterLink href="#trash">النفايات وإعادة التدوير</FooterLink>
                <FooterLink href="#permits">التصاريح والرخص</FooterLink>
              </FooterSection>
              <FooterSection heading="الحكومة">
                <FooterLink href="#council">مجلس المدينة</FooterLink>
              </FooterSection>
            </FooterNav>
            <FooterBottom agencyName="مدينة المثال" />
            <FooterCopyright>مدينة المثال</FooterCopyright>
          </Footer>
        </div>
      </section>
    </div>
  )
}
