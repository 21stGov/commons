// SPDX-License-Identifier: MIT

'use client'

import { MemorableDate } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function MemorableDateDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Date of birth (with hint)">
        <MemorableDate
          legend="Date of birth"
          hint="For example: January 19 2000"
          autoComplete={{ month: 'bday-month', day: 'bday-day', year: 'bday-year' }}
        />
      </DemoSection>

      <DemoSection title="Required">
        <MemorableDate legend="Issue date" required />
      </DemoSection>

      <DemoSection title="Error at the group level">
        <MemorableDate
          legend="Date of birth"
          error="Enter a complete date, including the year."
        />
      </DemoSection>

      <DemoSection title="RTL and translated strings">
        <div dir="rtl" lang="ar">
          <MemorableDate
            legend="تاريخ الميلاد"
            subLabels={{ month: 'الشهر', day: 'اليوم', year: 'السنة' }}
            monthPlaceholderLabel="- اختر -"
            monthLabels={[
              'يناير',
              'فبراير',
              'مارس',
              'أبريل',
              'مايو',
              'يونيو',
              'يوليو',
              'أغسطس',
              'سبتمبر',
              'أكتوبر',
              'نوفمبر',
              'ديسمبر',
            ]}
          />
        </div>
      </DemoSection>
    </DemoStack>
  )
}
