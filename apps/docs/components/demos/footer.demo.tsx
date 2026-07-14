// SPDX-License-Identifier: MIT

'use client'

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
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function FooterDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Footer + identifier stacked, as they ship on a real site">
        <div>
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
        </div>
      </DemoSection>

      <DemoSection title="Custom heading level (fit the page's heading outline)">
        <Footer>
          <FooterNav ariaLabel="Footer (heading level demo)">
            <FooterSection heading="Services" headingLevel="h4">
              <FooterLink href="#trash">Trash and recycling</FooterLink>
            </FooterSection>
            <FooterSection heading="Government" headingLevel="h4">
              <FooterLink href="#council">City council</FooterLink>
            </FooterSection>
          </FooterNav>
          <FooterCopyright>City of Example</FooterCopyright>
        </Footer>
      </DemoSection>
    </DemoStack>
  )
}
