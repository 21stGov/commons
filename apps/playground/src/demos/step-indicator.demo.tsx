// SPDX-License-Identifier: MIT

import * as React from 'react'

import { StepIndicator } from '@21stgov/commons-react'

export const title = 'Step indicator'

const STEPS = ['Personal information', 'Household', 'Documents', 'Review']

export default function Demo(): React.JSX.Element {
  const [step, setStep] = React.useState(1)

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <section aria-labelledby="si-interactive-heading">
        <h3 id="si-interactive-heading" className="text-sm font-semibold">
          Interactive (with counter)
        </h3>
        <StepIndicator steps={STEPS} currentStep={step} showCounter />
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className="min-h-11 rounded-sm border border-border px-3 text-sm disabled:text-disabled-foreground"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0}
          >
            Back
          </button>
          <button
            type="button"
            className="min-h-11 rounded-sm border border-border px-3 text-sm disabled:text-disabled-foreground"
            onClick={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))}
            disabled={step === STEPS.length - 1}
          >
            Next
          </button>
        </div>
      </section>

      <section aria-labelledby="si-first-heading">
        <h3 id="si-first-heading" className="text-sm font-semibold">
          First step
        </h3>
        <StepIndicator steps={STEPS} currentStep={0} />
      </section>

      <section aria-labelledby="si-last-heading">
        <h3 id="si-last-heading" className="text-sm font-semibold">
          Final step
        </h3>
        <StepIndicator steps={STEPS} currentStep={STEPS.length - 1} showCounter />
      </section>

      <section aria-labelledby="si-rtl-heading">
        <h3 id="si-rtl-heading" className="text-sm font-semibold">
          RTL and translated strings
        </h3>
        <div dir="rtl" lang="ar">
          <StepIndicator
            steps={['المعلومات الشخصية', 'الأسرة', 'المستندات', 'المراجعة']}
            currentStep={1}
            label="التقدم"
            showCounter
            counterLabel={(current, total) => `الخطوة ${current} من ${total}`}
            statusLabels={{
              complete: 'مكتملة',
              current: 'الحالية',
              incomplete: 'غير مكتملة',
            }}
          />
        </div>
      </section>
    </div>
  )
}
