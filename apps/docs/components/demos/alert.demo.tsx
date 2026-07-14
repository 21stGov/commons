// SPDX-License-Identifier: MIT

'use client'

import { Alert } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

const variants = ['info', 'success', 'warning', 'error', 'emergency'] as const

const headings: Record<(typeof variants)[number], string> = {
  info: 'Information',
  success: 'Application submitted',
  warning: 'Review before continuing',
  error: 'Submission failed',
  emergency: 'Boil water notice in effect',
}

export default function AlertDemo(): React.JSX.Element {
  const [dismissed, setDismissed] = React.useState(false)

  return (
    <DemoStack>
      <DemoSection title="Variants">
        <div className="flex flex-col gap-105">
          {variants.map((variant) => (
            <Alert key={variant} variant={variant} heading={headings[variant]}>
              Each variant pairs its state colors with an icon and a heading,
              so meaning never relies on color alone.
            </Alert>
          ))}
        </div>
      </DemoSection>

      <DemoSection title="Slim">
        <Alert variant="info" slim>
          City offices close at noon on Friday, July 3.
        </Alert>
      </DemoSection>

      <DemoSection title="Dismissible">
        {dismissed ? (
          <button
            type="button"
            className="min-h-11 self-start rounded-md border border-border-strong px-4 text-sm underline"
            onClick={() => setDismissed(false)}
          >
            Restore the dismissed alert
          </button>
        ) : (
          <Alert
            variant="warning"
            heading="Scheduled maintenance"
            dismissible
            onDismiss={() => setDismissed(true)}
          >
            Online payments will be unavailable Sunday from 2–4 a.m.
          </Alert>
        )}
      </DemoSection>
    </DemoStack>
  )
}
