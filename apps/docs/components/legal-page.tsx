// SPDX-License-Identifier: MIT

import type { JSX, ReactNode } from 'react'

/**
 * Layout for the standalone policy / legal pages (Terms, Privacy, Accessibility,
 * Disclaimer, Acceptable Use, Roadmap). These live outside the docs sidebar and
 * are linked from the site footer. They render inside the home layout's nav and
 * the global footer; this just provides the centered prose column.
 */
export function LegalPage({
  title,
  lede,
  updated,
  children,
}: {
  title: string
  lede?: string
  updated?: string
  children: ReactNode
}): JSX.Element {
  return (
    <main id="main" tabIndex={-1} className="docs-legal outline-none">
      <article className="docs-legal-inner">
        <header className="docs-legal-header">
          <h1>{title}</h1>
          {lede ? <p className="docs-legal-lede">{lede}</p> : null}
          {updated ? <p className="docs-legal-meta">Last updated {updated}</p> : null}
        </header>
        {children}
      </article>
    </main>
  )
}
