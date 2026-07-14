// SPDX-License-Identifier: MIT

'use client'

import {
  List,
  ListItem,
  DescriptionList,
  DescriptionTerm,
  DescriptionDetails,
} from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function ListDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Ordered">
        <List variant="ordered" aria-label="Steps to apply">
          <ListItem>Gather your documents</ListItem>
          <ListItem>Complete the application</ListItem>
          <ListItem>Submit for review</ListItem>
        </List>
      </DemoSection>

      <DemoSection title="Unordered">
        <List aria-label="What you'll need">
          <ListItem>A valid, government-issued photo ID</ListItem>
          <ListItem>Proof of residency dated within the last 90 days</ListItem>
          <ListItem>Your application or case number</ListItem>
        </List>
      </DemoSection>

      <DemoSection title="Unstyled (nav-like)">
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
      </DemoSection>

      <DemoSection title="Description list (stacked)">
        <DescriptionList>
          <DescriptionTerm>Case number</DescriptionTerm>
          <DescriptionDetails>2026-0142</DescriptionDetails>
          <DescriptionTerm>Status</DescriptionTerm>
          <DescriptionDetails>Under review</DescriptionDetails>
          <DescriptionTerm>Phone numbers</DescriptionTerm>
          <DescriptionDetails>(202) 555-0100</DescriptionDetails>
          <DescriptionDetails>(202) 555-0101</DescriptionDetails>
        </DescriptionList>
      </DemoSection>

      <DemoSection title="Description list (inline)">
        <DescriptionList layout="inline">
          <DescriptionTerm>Property ID</DescriptionTerm>
          <DescriptionDetails>123-456-789</DescriptionDetails>
          <DescriptionTerm>Zoning</DescriptionTerm>
          <DescriptionDetails>Residential (R-1)</DescriptionDetails>
        </DescriptionList>
      </DemoSection>
    </DemoStack>
  )
}
