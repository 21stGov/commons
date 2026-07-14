// SPDX-License-Identifier: MIT

'use client'

import { IconList, IconListItem } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function IconListDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Benefits (decorative check bullets)">
        {/* Default icon = check; the visible text carries the meaning, so the
            bullets are decorative and skipped by screen readers. */}
        <IconList className="max-w-prose">
          <IconListItem>Free to apply online or in person</IconListItem>
          <IconListItem>Decision within 10 business days</IconListItem>
          <IconListItem>
            Renews automatically each year — you will get a reminder email before it
            lapses so there is nothing else to do.
          </IconListItem>
        </IconList>
      </DemoSection>

      <DemoSection title="Custom default icon (next steps)">
        <IconList icon="arrow-right" className="max-w-prose">
          <IconListItem>Submit your application and supporting documents</IconListItem>
          <IconListItem>A caseworker reviews it and may request more info</IconListItem>
          <IconListItem>You receive a decision letter by mail and email</IconListItem>
        </IconList>
      </DemoSection>

      <DemoSection title="Per-item icons (included vs. not)">
        {/* The x is MEANINGFUL here — it conveys "not available", which the text
            alone does not — so it carries an accessible name via iconLabel. */}
        <IconList className="max-w-prose">
          <IconListItem iconLabel="Included">Online applications</IconListItem>
          <IconListItem iconLabel="Included">Document upload</IconListItem>
          <IconListItem icon="x" iconLabel="Not available">
            Phone applications
          </IconListItem>
        </IconList>
      </DemoSection>

      <DemoSection title="RTL">
        {/* Logical spacing: the leading icon flips to the inline-start (right). */}
        <div dir="rtl">
          <IconList className="max-w-prose">
            <IconListItem>مجاني للتقديم</IconListItem>
            <IconListItem>قرار خلال ١٠ أيام عمل</IconListItem>
          </IconList>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
