// SPDX-License-Identifier: MIT

import type { Metadata } from 'next'

import { LegalPage } from '@/components/legal-page'
import { buildPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Roadmap',
  description:
    'A directional look at what the Commons team is working on next, starting with full parity between the HTML and React components.',
  path: '/roadmap',
})

export default function RoadmapPage(): React.JSX.Element {
  return (
    <LegalPage
      title="Roadmap"
      lede="Where Commons is headed next. This roadmap is early and directional, not a schedule or a commitment."
      updated="July 15, 2026"
    >
      <p>
        Commons is pre-1.0 and experimental. Everything here is subject to change, and this page is
        meant to give a sense of direction rather than firm dates or version numbers. Right now there
        is one concrete priority; more will be shared here as it firms up.
      </p>

      <h2>Up next</h2>
      <h3>Parity between the HTML and React components</h3>
      <p>
        Commons already ships two ways to build: a React component library, and a framework-agnostic
        path built on <code>commons.css</code> classes plus the <code>@21stgov/commons-js</code>{' '}
        progressive-enhancement runtime. Our current focus is closing the remaining gaps between
        them.
      </p>
      <p>
        The goal is full 1:1 parity between the <code>.cui-*</code> HTML components and their React
        counterparts, in both look <strong>and</strong> behavior, so every component works
        identically whether you reach for React or plain HTML in any stack. If you are building
        without React today, the{' '}
        <a href="/docs/without-react">framework-agnostic guide</a> is the place to start.
      </p>

      <h2>Coming soon</h2>
      <p>
        More is being planned. As additional work firms up, we will add it here rather than promise
        it before we are confident in it. We would rather keep this page short and honest than pad it
        with items we are not ready to stand behind.
      </p>

      <h2>Share what you need</h2>
      <p>
        Commons is built for U.S. local governments, and input from the people using it shapes what
        comes next. If there is something you need, open an issue or start a discussion on{' '}
        <a href="https://github.com/21stgov/commons" rel="noopener noreferrer" target="_blank">
          GitHub
        </a>
        .
      </p>
    </LegalPage>
  )
}
