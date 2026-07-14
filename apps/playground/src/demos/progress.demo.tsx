// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Progress } from '@21stgov/commons-react'

export const title = 'Progress'

export default function Demo(): React.JSX.Element {
  const [value, setValue] = React.useState(40)

  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="progress-determinate-heading">
        <h3 id="progress-determinate-heading" className="text-sm font-semibold">
          Determinate
        </h3>
        <div className="flex flex-col gap-3">
          <Progress label="Getting started" value={0} showValue />
          <Progress label="Uploading files" value={40} showValue />
          <Progress label="Processing records" value={72} showValue />
          <Progress label="Almost done" value={100} showValue />
        </div>
      </section>

      <section aria-labelledby="progress-live-heading">
        <h3 id="progress-live-heading" className="text-sm font-semibold">
          Live value
        </h3>
        <div className="flex flex-col gap-2">
          <Progress label="Import progress" value={value} showValue />
          <div className="flex gap-2">
            <button
              type="button"
              className="min-h-11 rounded-md border border-border-strong px-4 text-sm underline"
              onClick={() => setValue((v) => Math.max(0, v - 10))}
            >
              −10%
            </button>
            <button
              type="button"
              className="min-h-11 rounded-md border border-border-strong px-4 text-sm underline"
              onClick={() => setValue((v) => Math.min(100, v + 10))}
            >
              +10%
            </button>
          </div>
        </div>
      </section>

      <section aria-labelledby="progress-custom-heading">
        <h3 id="progress-custom-heading" className="text-sm font-semibold">
          Custom max and template
        </h3>
        <Progress label="Step" value={2} max={4} valueTemplate="Step {value} of {max}" showValue />
      </section>

      <section aria-labelledby="progress-indeterminate-heading">
        <h3 id="progress-indeterminate-heading" className="text-sm font-semibold">
          Indeterminate (unknown duration)
        </h3>
        <Progress label="Contacting server" value={null} showValue />
      </section>

      <section aria-labelledby="progress-nolabel-heading">
        <h3 id="progress-nolabel-heading" className="text-sm font-semibold">
          Named by aria-label (no visible label)
        </h3>
        <Progress aria-label="Background sync" value={55} />
      </section>
    </div>
  )
}
