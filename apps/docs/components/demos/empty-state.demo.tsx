// SPDX-License-Identifier: MIT

'use client'

import { Button, EmptyState } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

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

export default function EmptyStateDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="First run (empty)">
        <div className="rounded-md border border-border">
          <EmptyState
            icon={<InboxIcon />}
            heading="No documents yet"
            action={<Button>Upload a document</Button>}
          >
            When you add documents, they will show up here for your whole team.
          </EmptyState>
        </div>
      </DemoSection>

      <DemoSection title="No results (after a search)">
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
      </DemoSection>

      <DemoSection title="Minimal (heading only, h3)">
        <div className="rounded-md border border-border">
          <EmptyState heading="No saved items" headingLevel="h3" />
        </div>
      </DemoSection>
    </DemoStack>
  )
}
