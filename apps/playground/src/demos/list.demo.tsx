// SPDX-License-Identifier: MIT

import * as React from 'react'

import {
  List,
  ListItem,
  DescriptionList,
  DescriptionTerm,
  DescriptionDetails,
} from '@21stgov/commons-react'

export const title = 'List'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="list-ordered-heading">
        <h3 id="list-ordered-heading" className="text-sm font-semibold">
          Ordered
        </h3>
        <List variant="ordered" aria-label="Steps to apply">
          <ListItem>Gather your documents</ListItem>
          <ListItem>Complete the application</ListItem>
          <ListItem>Submit for review</ListItem>
        </List>
      </section>

      <section aria-labelledby="list-unordered-heading">
        <h3 id="list-unordered-heading" className="text-sm font-semibold">
          Unordered
        </h3>
        <List aria-label="What you'll need">
          <ListItem>A valid, government-issued photo ID</ListItem>
          <ListItem>Proof of residency dated within the last 90 days</ListItem>
          <ListItem>Your application or case number</ListItem>
        </List>
      </section>

      <section aria-labelledby="list-unstyled-heading">
        <h3 id="list-unstyled-heading" className="text-sm font-semibold">
          Unstyled (nav-like)
        </h3>
        <nav aria-label="Footer">
          <List variant="unstyled">
            <ListItem>
              <a className="underline" href="#privacy">
                Privacy policy
              </a>
            </ListItem>
            <ListItem>
              <a className="underline" href="#accessibility">
                Accessibility statement
              </a>
            </ListItem>
            <ListItem>
              <a className="underline" href="#contact">
                Contact us
              </a>
            </ListItem>
          </List>
        </nav>
      </section>

      <section aria-labelledby="list-description-stacked-heading">
        <h3 id="list-description-stacked-heading" className="text-sm font-semibold">
          Description list (stacked)
        </h3>
        <DescriptionList>
          <DescriptionTerm>Case number</DescriptionTerm>
          <DescriptionDetails>2026-0142</DescriptionDetails>
          <DescriptionTerm>Status</DescriptionTerm>
          <DescriptionDetails>Under review</DescriptionDetails>
          <DescriptionTerm>Phone numbers</DescriptionTerm>
          <DescriptionDetails>(202) 555-0100</DescriptionDetails>
          <DescriptionDetails>(202) 555-0101</DescriptionDetails>
        </DescriptionList>
      </section>

      <section aria-labelledby="list-description-inline-heading">
        <h3 id="list-description-inline-heading" className="text-sm font-semibold">
          Description list (inline)
        </h3>
        <DescriptionList layout="inline">
          <DescriptionTerm>Property ID</DescriptionTerm>
          <DescriptionDetails>123-456-789</DescriptionDetails>
          <DescriptionTerm>Zoning</DescriptionTerm>
          <DescriptionDetails>Residential (R-1)</DescriptionDetails>
        </DescriptionList>
      </section>

      <section aria-labelledby="list-rtl-heading">
        <h3 id="list-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl">
          <List variant="ordered" aria-label="الخطوات">
            <ListItem>اجمع مستنداتك</ListItem>
            <ListItem>أكمل الطلب</ListItem>
          </List>
        </div>
      </section>
    </div>
  )
}
