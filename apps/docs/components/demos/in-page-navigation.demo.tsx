// SPDX-License-Identifier: MIT

'use client'

import { InPageNavigation, Prose, type InPageNavItem } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

const SECTIONS: Array<InPageNavItem & { body: string }> = [
  {
    id: 'ipn-overview',
    label: 'Overview',
    level: 2,
    body: 'The residential parking permit lets residents park on their own block during posted street-cleaning and permit-only hours.',
  },
  {
    id: 'ipn-eligibility',
    label: 'Who is eligible',
    level: 2,
    body: 'You must live on a block zoned for permit parking and register the vehicle to your home address.',
  },
  {
    id: 'ipn-documents',
    label: 'Required documents',
    level: 3,
    body: 'Bring a photo ID, your vehicle registration, and one proof of residency dated within the last 60 days.',
  },
  {
    id: 'ipn-fees',
    label: 'Fees',
    level: 3,
    body: 'The annual permit is $35 for the first vehicle and $50 for each additional vehicle in the household.',
  },
  {
    id: 'ipn-apply',
    label: 'How to apply',
    level: 2,
    body: 'Apply online, by mail, or in person at the Municipal Services counter. Online applications are processed within three business days.',
  },
  {
    id: 'ipn-renew',
    label: 'Renewing your permit',
    level: 2,
    body: 'Permits expire on June 30. Renew starting May 1 to avoid a lapse; you will be notified by mail 30 days before expiration.',
  },
]

const ITEMS: InPageNavItem[] = SECTIONS.map(({ id, label, level }) => ({ id, label, level }))

function Article(): React.JSX.Element {
  // Prose owns the heading/paragraph vertical rhythm (bare <h_>/<p> have their
  // flow margins zeroed by the core reset, which read unevenly here). The
  // section ids the scrollspy observes stay on the <section> wrappers, so
  // tracking is unaffected; the flex gap spaces the sections apart while Prose
  // handles the heading-to-paragraph spacing inside each one.
  return (
    <Prose as="article" className="flex flex-col gap-8">
      {SECTIONS.map((section) => {
        const Heading = section.level === 3 ? 'h4' : 'h3'
        return (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-h`}>
            <Heading id={`${section.id}-h`}>{section.label}</Heading>
            <p>{section.body}</p>
            <p>Scroll to watch the “On this page” list track the section you are reading.</p>
          </section>
        )
      })}
    </Prose>
  )
}

export default function InPageNavigationDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="On this page (scrollspy beside an article)">
        {/* A real, self-contained article: each entry links to a section id
            below and the active entry tracks the section scrolled into view. */}
        <div className="grid gap-8 md:grid-cols-[16rem_1fr]">
          <div className="md:sticky md:top-4 md:self-start">
            <InPageNavigation items={ITEMS} />
          </div>
          <Article />
        </div>
      </DemoSection>

      <DemoSection title="Collapsible on narrow viewports">
        {/* Below md the list collapses behind an “On this page” toggle; at md and
            up the toggle disappears and the list is always shown. */}
        <InPageNavigation items={ITEMS} collapsible />
      </DemoSection>

      <DemoSection title="Controlled active section">
        <InPageNavigation items={ITEMS} activeId="ipn-apply" smoothScroll={false} />
      </DemoSection>
    </DemoStack>
  )
}
