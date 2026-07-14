// SPDX-License-Identifier: MIT

import * as React from 'react'

import { MemorableDate, type MemorableDateValue } from '@21stgov/commons-react'

export const title = 'Memorable date'

export default function Demo(): React.JSX.Element {
  const [dob, setDob] = React.useState<MemorableDateValue>({
    month: '',
    day: '',
    year: '',
  })

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <section aria-labelledby="md-basic-heading">
        <h3 id="md-basic-heading" className="text-sm font-semibold">
          Uncontrolled, with a hint
        </h3>
        <MemorableDate
          legend="Date of birth"
          hint="For example: January 19 2000"
          autoComplete={{ month: 'bday-month', day: 'bday-day', year: 'bday-year' }}
        />
      </section>

      <section aria-labelledby="md-required-heading">
        <h3 id="md-required-heading" className="text-sm font-semibold">
          Required
        </h3>
        <MemorableDate legend="Issue date" required />
      </section>

      <section aria-labelledby="md-error-heading">
        <h3 id="md-error-heading" className="text-sm font-semibold">
          Error at the group level
        </h3>
        <MemorableDate
          legend="Date of birth"
          error="Enter a complete date, including the year."
        />
      </section>

      <section aria-labelledby="md-disabled-heading">
        <h3 id="md-disabled-heading" className="text-sm font-semibold">
          Disabled
        </h3>
        <MemorableDate
          legend="Date of birth"
          disabled
          defaultValue={{ month: '1', day: '19', year: '2000' }}
        />
      </section>

      <section aria-labelledby="md-controlled-heading">
        <h3 id="md-controlled-heading" className="text-sm font-semibold">
          Controlled
        </h3>
        <MemorableDate legend="Date of birth" value={dob} onChange={setDob} />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Value: {dob.month || '-'}/{dob.day || '-'}/{dob.year || '-'}
        </p>
      </section>

      <section aria-labelledby="md-rtl-heading">
        <h3 id="md-rtl-heading" className="text-sm font-semibold">
          RTL and translated strings
        </h3>
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
      </section>
    </div>
  )
}
