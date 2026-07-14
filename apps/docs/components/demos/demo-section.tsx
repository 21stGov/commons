// SPDX-License-Identifier: MIT

'use client'

import * as React from 'react'

/** Labelled example section inside a component demo frame. */
export function DemoSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}): React.JSX.Element {
  const headingId = React.useId()

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <h3 id={headingId} className="text-sm font-semibold text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  )
}

/** Vertical rhythm wrapper for a demo's sections. */
export function DemoStack({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <div className="flex flex-col gap-6">{children}</div>
}
