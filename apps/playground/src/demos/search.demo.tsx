// SPDX-License-Identifier: MIT

import { Search } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Search'

const SERVICES = [
  'Pay a water bill',
  'Parking permits',
  'Building permits',
  'Report a pothole',
  'Trash & recycling pickup',
  'Property tax lookup',
  'Register to vote',
]

export default function Demo(): React.JSX.Element {
  const [lastQuery, setLastQuery] = React.useState<string | null>(null)

  return (
    <div className="flex max-w-md flex-col gap-5">
      <section aria-labelledby="search-plain-heading">
        <h3 id="search-plain-heading" className="text-sm font-semibold">
          Site search
        </h3>
        <Search
          label="Search the city website"
          placeholder="Search services, permits, and pages"
          onSearch={setLastQuery}
        />
        <p className="mt-2 text-sm text-muted-foreground">
          {lastQuery == null ? 'Type a query and press Enter.' : `You searched: “${lastQuery}”`}
        </p>
      </section>

      <section aria-labelledby="search-autocomplete-heading">
        <h3 id="search-autocomplete-heading" className="text-sm font-semibold">
          With autocomplete suggestions
        </h3>
        <Search
          label="Search services"
          placeholder="Start typing a service"
          suggestions={SERVICES}
          onSearch={setLastQuery}
        />
      </section>

      <section aria-labelledby="search-compact-heading">
        <h3 id="search-compact-heading" className="text-sm font-semibold">
          Compact header variant
        </h3>
        <div className="flex items-center justify-end rounded-sm border border-border bg-muted p-2">
          <Search width="auto" iconSubmit label="Search" placeholder="Search" onSearch={setLastQuery} />
        </div>
      </section>

      <section aria-labelledby="search-rtl-heading">
        <h3 id="search-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl" lang="ar">
          <Search label="بحث" submitLabel="بحث" placeholder="ابحث عن خدمة" suggestions={SERVICES} />
        </div>
      </section>
    </div>
  )
}
