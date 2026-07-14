// SPDX-License-Identifier: MIT

'use client'

import * as React from 'react'

import { demos } from '@/components/demos'

/**
 * Live demo frame on generated component pages. The demos import the real
 * components from @21stgov/commons-react — the same code the CLI installs.
 */
export function ComponentDemo({
  name,
  children,
}: {
  name: string
  children?: React.ReactNode
}): React.JSX.Element {
  const loader = demos[name]
  const Demo = React.useMemo(() => (loader ? React.lazy(loader) : undefined), [loader])
  const [view, setView] = React.useState<'preview' | 'code'>('preview')
  const hasCode = React.Children.count(children) > 0

  if (!Demo) {
    return (
      <p className="not-prose rounded-md border border-warning-border bg-warning p-4 text-warning-foreground">
        No live demo is registered for “{name}” yet.
      </p>
    )
  }

  return (
    <div className="docs-component-demo not-prose">
      {hasCode ? (
        <div role="group" aria-label="Example view" className="docs-component-demo-toolbar">
          <button
            type="button"
            aria-pressed={view === 'preview'}
            onClick={() => setView('preview')}
          >
            Preview
          </button>
          <button type="button" aria-pressed={view === 'code'} onClick={() => setView('code')}>
            Code
          </button>
        </div>
      ) : null}
      <div className="docs-component-demo-preview" hidden={view !== 'preview'}>
        <React.Suspense
          fallback={<p className="text-sm text-muted-foreground">Loading example…</p>}
        >
          <Demo />
        </React.Suspense>
      </div>
      {hasCode ? (
        <div className="docs-component-demo-code" hidden={view !== 'code'}>
          {children}
        </div>
      ) : null}
    </div>
  )
}
