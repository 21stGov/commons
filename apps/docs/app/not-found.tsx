// SPDX-License-Identifier: MIT

import type { Metadata } from 'next'
import Link from 'next/link'
import type { JSX } from 'react'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

export default function NotFound(): JSX.Element {
  return (
    <main id="main" tabIndex={-1} className="docs-not-found outline-none">
      <span className="docs-not-found-mark" aria-hidden="true" />
      <p className="docs-not-found-code">404</p>
      <h1>This page wandered off.</h1>
      <p className="docs-not-found-lede">
        The page you’re looking for doesn’t exist, or it may have moved. Let’s get you back on
        track.
      </p>
      <nav className="docs-not-found-actions" aria-label="Where to next">
        <Link className="docs-not-found-action docs-not-found-action--primary" href="/">
          Back home
        </Link>
        <Link className="docs-not-found-action" href="/docs">
          Documentation
        </Link>
        <Link className="docs-not-found-action" href="/docs/components">
          Components
        </Link>
      </nav>
    </main>
  )
}
