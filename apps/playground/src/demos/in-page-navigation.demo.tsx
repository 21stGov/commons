// SPDX-License-Identifier: MIT

import { InPageNavigation, Prose, type InPageNavItem } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'In-page navigation'

const SECTIONS: Array<InPageNavItem & { body: string }> = [
  {
    id: 'pg-overview',
    label: 'Overview',
    level: 2,
    body: 'The residential parking permit lets residents park on their own block during permit-only hours.',
  },
  {
    id: 'pg-eligibility',
    label: 'Who is eligible',
    level: 2,
    body: 'You must live on a block zoned for permit parking and register the vehicle to your home address.',
  },
  {
    id: 'pg-documents',
    label: 'Required documents',
    level: 3,
    body: 'Bring a photo ID, your vehicle registration, and one proof of residency dated within the last 60 days.',
  },
  {
    id: 'pg-fees',
    label: 'Fees',
    level: 3,
    body: 'The annual permit is $35 for the first vehicle and $50 for each additional vehicle.',
  },
  {
    id: 'pg-apply',
    label: 'How to apply',
    level: 2,
    body: 'Apply online, by mail, or in person at the Municipal Services counter.',
  },
  {
    id: 'pg-renew',
    label: 'Renewing your permit',
    level: 2,
    body: 'Permits expire on June 30. Renew starting May 1 to avoid a lapse in coverage.',
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
            <p>Scroll to watch the “On this page” list track the section in view.</p>
          </section>
        )
      })}
    </Prose>
  )
}

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="pg-ipn-scrollspy" className="flex flex-col gap-3">
        <h3 id="pg-ipn-scrollspy" className="text-sm font-semibold">
          Scrollspy beside an article
        </h3>
        <div className="grid gap-8 md:grid-cols-[16rem_1fr]">
          <div className="md:sticky md:top-4 md:self-start">
            <InPageNavigation items={ITEMS} />
          </div>
          <Article />
        </div>
      </section>

      <section aria-labelledby="pg-ipn-collapsible" className="flex flex-col gap-3">
        <h3 id="pg-ipn-collapsible" className="text-sm font-semibold">
          Collapsible on narrow viewports
        </h3>
        <InPageNavigation items={ITEMS} collapsible />
      </section>

      <section aria-labelledby="pg-ipn-controlled" className="flex flex-col gap-3">
        <h3 id="pg-ipn-controlled" className="text-sm font-semibold">
          Controlled active section
        </h3>
        <InPageNavigation items={ITEMS} activeId="pg-apply" smoothScroll={false} />
      </section>
    </div>
  )
}
