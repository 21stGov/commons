// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Meter } from '@21stgov/commons-react'

export const title = 'Meter'

const budgetThresholds = [
  { max: 700, label: 'Under budget', tone: 'success' as const },
  { max: 900, label: 'On track', tone: 'warning' as const },
  { max: 1000, label: 'Over budget', tone: 'error' as const },
]

function LiveExample(): React.JSX.Element {
  const [spent, setSpent] = React.useState(420)

  return (
    <div className="flex flex-col gap-2">
      <Meter
        label="Monthly budget used"
        value={spent}
        min={0}
        max={1000}
        showValue
        valueTemplate="${value} of ${max}"
        thresholds={budgetThresholds}
      />
      <div className="flex gap-2">
        <button
          type="button"
          className="min-h-11 rounded-md border border-border-strong px-4 text-sm underline"
          onClick={() => setSpent((v) => Math.max(0, v - 50))}
        >
          −$50
        </button>
        <button
          type="button"
          className="min-h-11 rounded-md border border-border-strong px-4 text-sm underline"
          onClick={() => setSpent((v) => Math.min(1000, v + 50))}
        >
          +$50
        </button>
      </div>
    </div>
  )
}

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="meter-storage-heading">
        <h3 id="meter-storage-heading" className="text-sm font-semibold">
          Storage used
        </h3>
        <Meter
          label="Storage used"
          value={189}
          min={0}
          max={256}
          showValue
          valueTemplate="{value} GB of {max} GB"
        />
      </section>

      <section aria-labelledby="meter-budget-heading">
        <h3 id="meter-budget-heading" className="text-sm font-semibold">
          Budget with low / optimal / high thresholds
        </h3>
        <div className="flex flex-col gap-3">
          <Meter
            label="Monthly budget used"
            value={420}
            min={0}
            max={1000}
            showValue
            valueTemplate="${value} of ${max}"
            thresholds={budgetThresholds}
          />
          <Meter
            label="Monthly budget used"
            value={840}
            min={0}
            max={1000}
            showValue
            valueTemplate="${value} of ${max}"
            thresholds={budgetThresholds}
          />
          <Meter
            label="Monthly budget used"
            value={975}
            min={0}
            max={1000}
            showValue
            valueTemplate="${value} of ${max}"
            thresholds={budgetThresholds}
          />
        </div>
      </section>

      <section aria-labelledby="meter-live-heading">
        <h3 id="meter-live-heading" className="text-sm font-semibold">
          Live value
        </h3>
        <LiveExample />
      </section>

      <section aria-labelledby="meter-score-heading">
        <h3 id="meter-score-heading" className="text-sm font-semibold">
          Score
        </h3>
        <Meter
          label="Accessibility score"
          value={92}
          showValue
          thresholds={[
            { max: 49, label: 'Poor', tone: 'error' },
            { max: 89, label: 'Needs improvement', tone: 'warning' },
            { max: 100, label: 'Good', tone: 'success' },
          ]}
        />
      </section>

      <section aria-labelledby="meter-nolabel-heading">
        <h3 id="meter-nolabel-heading" className="text-sm font-semibold">
          Named by aria-label (no visible label)
        </h3>
        <Meter aria-label="Background sync buffer" value={55} />
      </section>

      <section aria-labelledby="meter-rtl-heading">
        <h3 id="meter-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl" className="flex flex-col gap-3">
          <Meter label="استخدام القرص" value={72} showValue />
        </div>
      </section>
    </div>
  )
}
