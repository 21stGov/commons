// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Alert } from '@21stgov/commons-react'

export const title = 'Alert'

const variants = ['info', 'success', 'warning', 'error', 'emergency'] as const

const headings: Record<(typeof variants)[number], string> = {
  info: 'Information',
  success: 'Application submitted',
  warning: 'Review before continuing',
  error: 'Submission failed',
  emergency: 'Boil water notice in effect',
}

export default function Demo(): React.JSX.Element {
  const [dismissed, setDismissed] = React.useState(false)
  const [injected, setInjected] = React.useState(false)

  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="alert-variants-heading">
        <h3 id="alert-variants-heading" className="text-sm font-semibold">
          Variants
        </h3>
        <div className="flex flex-col gap-105">
          {variants.map((variant) => (
            <Alert key={variant} variant={variant} heading={headings[variant]}>
              Each variant pairs its state colors with an icon and a heading, so meaning never
              relies on color alone.
            </Alert>
          ))}
        </div>
      </section>

      <section aria-labelledby="alert-slim-heading">
        <h3 id="alert-slim-heading" className="text-sm font-semibold">
          Slim
        </h3>
        <div className="flex flex-col gap-105">
          <Alert variant="info" slim>
            City offices close at noon on Friday, July 3.
          </Alert>
          <Alert variant="success" slim>
            Your changes were saved.
          </Alert>
        </div>
      </section>

      <section aria-labelledby="alert-dismiss-heading">
        <h3 id="alert-dismiss-heading" className="text-sm font-semibold">
          Dismissible (consumer removes the node)
        </h3>
        {dismissed ? (
          <button
            type="button"
            className="min-h-11 rounded-md border border-border-strong px-4 text-sm underline"
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
      </section>

      <section aria-labelledby="alert-live-heading">
        <h3 id="alert-live-heading" className="text-sm font-semibold">
          Live-region opt-in (dynamic injection)
        </h3>
        <div className="flex flex-col gap-105">
          <button
            type="button"
            className="min-h-11 self-start rounded-md border border-border-strong px-4 text-sm underline"
            onClick={() => setInjected((current) => !current)}
          >
            {injected ? 'Remove the live alert' : 'Inject a live alert'}
          </button>
          {injected ? (
            <Alert variant="error" live="assertive" heading="Payment declined">
              Your card was declined. No charge was made.
            </Alert>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="alert-rtl-heading">
        <h3 id="alert-rtl-heading" className="text-sm font-semibold">
          RTL (layout mirrors to the right edge)
        </h3>
        <div dir="rtl" lang="ar">
          <Alert variant="info" heading="معلومة" dismissible dismissLabel="إغلاق">
            تُغلق مكاتب المدينة ظهر يوم الجمعة.
          </Alert>
        </div>
      </section>
    </div>
  )
}
