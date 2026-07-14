// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Toggle } from '@21stgov/commons-react'

export const title = 'Toggle'

function BoldIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4.5 2.5h4a3 3 0 0 1 1.7 5.46A3.25 3.25 0 0 1 9 13.5H4.5V2.5Zm2 2v2.5H8a1.25 1.25 0 0 0 0-2.5H6.5Zm0 4.5V11H9a1.25 1.25 0 0 0 0-2.5H6.5Z" />
    </svg>
  )
}

function ControlledExample(): React.JSX.Element {
  const [pinned, setPinned] = React.useState(false)
  return (
    <div className="flex flex-col gap-2">
      <Toggle pressed={pinned} onPressedChange={setPinned}>
        Pin to top
      </Toggle>
      <p className="text-sm text-muted-foreground">
        This item is {pinned ? 'pinned' : 'not pinned'}.
      </p>
    </div>
  )
}

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="toggle-states-heading">
        <h3 id="toggle-states-heading" className="text-sm font-semibold">
          States
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <Toggle>Show map</Toggle>
          <Toggle defaultPressed>Show map (on)</Toggle>
          <Toggle disabled>Disabled</Toggle>
          <Toggle disabled defaultPressed>
            Disabled and on
          </Toggle>
        </div>
      </section>

      <section aria-labelledby="toggle-variants-heading">
        <h3 id="toggle-variants-heading" className="text-sm font-semibold">
          Variants and sizes
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <Toggle variant="outline" size="sm">
            Small
          </Toggle>
          <Toggle variant="outline">Medium</Toggle>
          <Toggle variant="ghost" size="lg">
            Large ghost
          </Toggle>
        </div>
      </section>

      <section aria-labelledby="toggle-icon-heading">
        <h3 id="toggle-icon-heading" className="text-sm font-semibold">
          Icon-only (accessible name + tooltip)
        </h3>
        <Toggle variant="ghost" aria-label="Bold" title="Bold">
          <BoldIcon />
        </Toggle>
      </section>

      <section aria-labelledby="toggle-controlled-heading">
        <h3 id="toggle-controlled-heading" className="text-sm font-semibold">
          Controlled
        </h3>
        <ControlledExample />
      </section>

      <section aria-labelledby="toggle-rtl-heading">
        <h3 id="toggle-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl" className="flex flex-wrap items-center gap-2">
          <Toggle defaultPressed>عريض</Toggle>
          <Toggle>مائل</Toggle>
        </div>
      </section>
    </div>
  )
}
