// SPDX-License-Identifier: MIT

import * as React from 'react'

import { ScrollArea } from '@21stgov/commons-react'

export const title = 'Scroll Area'

const AGENCIES = [
  'Assessor',
  'Building & Safety',
  'City Clerk',
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
  'Water & Sewer',
]

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="scroll-area-vertical-heading">
        <h3 id="scroll-area-vertical-heading" className="text-sm font-semibold">
          Fixed-height vertical list
        </h3>
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
      </section>

      <section aria-labelledby="scroll-area-horizontal-heading">
        <h3 id="scroll-area-horizontal-heading" className="text-sm font-semibold">
          Horizontal wide content
        </h3>
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
      </section>

      <section aria-labelledby="scroll-area-both-heading">
        <h3 id="scroll-area-both-heading" className="text-sm font-semibold">
          Constrained box (both axes)
        </h3>
        <ScrollArea
          orientation="both"
          className="h-56 w-full max-w-md"
          rootClassName="rounded-md border border-border"
        >
          <div className="w-[48rem] p-4">
            {Array.from({ length: 24 }, (_, i) => (
              <p key={i} className="whitespace-nowrap text-sm text-muted-foreground">
                Section {i + 1}.00 — A single long line that overflows on both axes.
              </p>
            ))}
          </div>
        </ScrollArea>
      </section>

      <section aria-labelledby="scroll-area-rtl-heading">
        <h3 id="scroll-area-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
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
      </section>
    </div>
  )
}
