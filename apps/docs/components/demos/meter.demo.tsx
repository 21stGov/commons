// SPDX-License-Identifier: MIT

'use client'

import { Meter } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function MeterDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Storage used">
        <Meter
          label="Storage used"
          value={189}
          min={0}
          max={256}
          showValue
          valueTemplate="{value} GB of {max} GB"
        />
      </DemoSection>

      <DemoSection title="Budget with low / optimal / high thresholds">
        <div className="flex flex-col gap-3">
          <Meter
            label="Monthly budget used"
            value={420}
            min={0}
            max={1000}
            showValue
            valueTemplate="${value} of ${max}"
            thresholds={[
              { max: 700, label: 'Under budget', tone: 'success' },
              { max: 900, label: 'On track', tone: 'warning' },
              { max: 1000, label: 'Over budget', tone: 'error' },
            ]}
          />
          <Meter
            label="Monthly budget used"
            value={840}
            min={0}
            max={1000}
            showValue
            valueTemplate="${value} of ${max}"
            thresholds={[
              { max: 700, label: 'Under budget', tone: 'success' },
              { max: 900, label: 'On track', tone: 'warning' },
              { max: 1000, label: 'Over budget', tone: 'error' },
            ]}
          />
          <Meter
            label="Monthly budget used"
            value={975}
            min={0}
            max={1000}
            showValue
            valueTemplate="${value} of ${max}"
            thresholds={[
              { max: 700, label: 'Under budget', tone: 'success' },
              { max: 900, label: 'On track', tone: 'warning' },
              { max: 1000, label: 'Over budget', tone: 'error' },
            ]}
          />
        </div>
      </DemoSection>

      <DemoSection title="Score">
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
      </DemoSection>

      <DemoSection title="Named by aria-label (no visible label)">
        <Meter aria-label="Background sync buffer" value={55} />
      </DemoSection>
    </DemoStack>
  )
}
