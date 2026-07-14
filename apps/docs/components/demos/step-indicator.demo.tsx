// SPDX-License-Identifier: MIT

'use client'

import { StepIndicator } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

const STEPS = ['Personal information', 'Household', 'Documents', 'Review']

export default function StepIndicatorDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Mid-flow with counter">
        <StepIndicator steps={STEPS} currentStep={2} showCounter />
      </DemoSection>

      <DemoSection title="First step">
        <StepIndicator steps={STEPS} currentStep={0} />
      </DemoSection>

      <DemoSection title="Final step">
        <StepIndicator steps={STEPS} currentStep={STEPS.length - 1} showCounter />
      </DemoSection>

      <DemoSection title="RTL and translated strings">
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
      </DemoSection>
    </DemoStack>
  )
}
