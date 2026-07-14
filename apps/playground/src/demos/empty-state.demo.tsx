// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Button, EmptyState } from '@21stgov/commons-react'

export const title = 'Empty State'

function SearchIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  )
}

function InboxIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M3 13h4l2 3h6l2-3h4" strokeLinejoin="round" />
      <path d="M3 13 5 5h14l2 8v6H3v-6Z" strokeLinejoin="round" />
    </svg>
  )
}

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="empty-firstrun-heading">
        <h3 id="empty-firstrun-heading" className="text-sm font-semibold">
          First run (empty)
        </h3>
        <div className="rounded-md border border-border">
          <EmptyState
            icon={<InboxIcon />}
            heading="No documents yet"
            action={<Button>Upload a document</Button>}
          >
            When you add documents, they will show up here for your whole team.
          </EmptyState>
        </div>
      </section>

      <section aria-labelledby="empty-noresults-heading">
        <h3 id="empty-noresults-heading" className="text-sm font-semibold">
          No results (after a search)
        </h3>
        <div className="rounded-md border border-border">
          <EmptyState
            variant="no-results"
            icon={<SearchIcon />}
            heading="No results for “zoning”"
            action={<Button variant="outline">Clear filters</Button>}
          >
            No records matched your search. Try a broader term or remove a filter.
          </EmptyState>
        </div>
      </section>

      <section aria-labelledby="empty-minimal-heading">
        <h3 id="empty-minimal-heading" className="text-sm font-semibold">
          Minimal (heading only, h3)
        </h3>
        <div className="rounded-md border border-border">
          <EmptyState heading="No saved items" headingLevel="h3" />
        </div>
      </section>

      <section aria-labelledby="empty-rtl-heading">
        <h3 id="empty-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl" className="rounded-md border border-border">
          <EmptyState
            variant="no-results"
            icon={<SearchIcon />}
            heading="لا توجد نتائج"
            action={<Button variant="outline">مسح عوامل التصفية</Button>}
          >
            لم يطابق أي سجل بحثك. جرّب مصطلحًا أوسع.
          </EmptyState>
        </div>
      </section>
    </div>
  )
}
