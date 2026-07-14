// SPDX-License-Identifier: MIT

'use client'

import { Search } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

const SERVICES = [
  'Pay a water bill',
  'Parking permits',
  'Building permits',
  'Report a pothole',
  'Trash & recycling pickup',
  'Property tax lookup',
  'Register to vote',
]

export default function SearchDemo(): React.JSX.Element {
  const [lastQuery, setLastQuery] = React.useState<string | null>(null)

  return (
    <DemoStack>
      <DemoSection title="Site search">
        <div className="max-w-md">
          <Search
            label="Search the city website"
            placeholder="Search services, permits, and pages"
            onSearch={setLastQuery}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {lastQuery == null ? 'Type a query and press Enter.' : `You searched: “${lastQuery}”`}
          </p>
        </div>
      </DemoSection>

      <DemoSection title="With autocomplete suggestions">
        <div className="max-w-md">
          <Search
            label="Search services"
            placeholder="Start typing a service"
            suggestions={SERVICES}
            onSearch={setLastQuery}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Suggestions are an enhancement — you can still submit any free-text query.
          </p>
        </div>
      </DemoSection>

      <DemoSection title="Compact header variant">
        <div className="flex items-center justify-end rounded-sm border border-border bg-muted p-2">
          <Search
            width="auto"
            iconSubmit
            label="Search"
            placeholder="Search"
            onSearch={setLastQuery}
          />
        </div>
      </DemoSection>

      <DemoSection title="No-JS form (native GET)">
        <div className="max-w-md">
          <Search
            label="Search"
            action="https://example.gov/search"
            method="get"
            name="q"
            placeholder="Submits to /search even without JavaScript"
          />
        </div>
      </DemoSection>

      <DemoSection title="RTL">
        <div dir="rtl" className="max-w-md">
          <Search label="بحث" submitLabel="بحث" placeholder="ابحث عن خدمة" suggestions={SERVICES} />
        </div>
      </DemoSection>
    </DemoStack>
  )
}
