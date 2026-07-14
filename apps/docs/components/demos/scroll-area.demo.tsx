// SPDX-License-Identifier: MIT

'use client'

import { ScrollArea } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

const AGENCIES = [
  'Assessor',
  'Building & Safety',
  'City Clerk',
  'City Manager',
  'Community Development',
  'Emergency Management',
  'Finance',
  'Fire Department',
  'Human Resources',
  'Parks & Recreation',
  'Planning',
  'Police Department',
  'Public Works',
  'Transportation',
  'Treasurer',
  'Water & Sewer',
]

export default function ScrollAreaDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Fixed-height vertical list">
        <ScrollArea className="h-56" rootClassName="w-72 rounded-md border border-border">
          <ul className="flex flex-col p-2">
            {AGENCIES.map((agency) => (
              <li
                key={agency}
                className="flex min-h-11 items-center rounded-sm px-2 text-sm hover:bg-muted"
              >
                {agency}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </DemoSection>

      <DemoSection title="Horizontal wide content">
        <ScrollArea
          orientation="horizontal"
          className="w-full"
          rootClassName="w-full rounded-md border border-border"
        >
          <div className="flex gap-2 p-2">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className="flex h-24 w-40 shrink-0 items-center justify-center rounded-sm bg-muted text-sm"
              >
                Card {i + 1}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DemoSection>

      <DemoSection title="Constrained box (both axes)">
        <ScrollArea
          orientation="both"
          className="h-56 w-full max-w-md"
          rootClassName="rounded-md border border-border"
        >
          <div className="w-[48rem] p-4">
            <h4 className="text-sm font-semibold">Municipal code excerpt</h4>
            {Array.from({ length: 24 }, (_, i) => (
              <p key={i} className="whitespace-nowrap text-sm text-muted-foreground">
                Section {i + 1}.00 — A single long line that overflows the box on both the
                block and inline axes, so both scrollbars appear.
              </p>
            ))}
          </div>
        </ScrollArea>
      </DemoSection>

      <DemoSection title="RTL">
        <div dir="rtl">
          <ScrollArea className="h-40" rootClassName="w-72 rounded-md border border-border">
            <ul className="flex flex-col p-2">
              {['المدينة', 'المالية', 'الإطفاء', 'الشرطة', 'الأشغال العامة', 'التخطيط', 'المياه'].map(
                (label) => (
                  <li
                    key={label}
                    className="flex min-h-11 items-center rounded-sm px-2 text-sm hover:bg-muted"
                  >
                    {label}
                  </li>
                )
              )}
            </ul>
          </ScrollArea>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
