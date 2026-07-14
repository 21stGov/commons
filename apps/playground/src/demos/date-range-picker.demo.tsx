// SPDX-License-Identifier: MIT

import { DateRangePicker, type DateRangePickerValue, Field } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Date range picker'

function formatRange(range: DateRangePickerValue | undefined): string {
  if (!range?.from) {
    return 'none'
  }
  const from = range.from.toLocaleDateString()
  return range.to ? `${from} – ${range.to.toLocaleDateString()}` : `${from} – …`
}

export default function Demo(): React.JSX.Element {
  const [standalone, setStandalone] = React.useState<DateRangePickerValue | undefined>(undefined)
  const [inField, setInField] = React.useState<DateRangePickerValue | undefined>(undefined)

  return (
    <div className="flex max-w-md flex-col gap-8">
      <section aria-labelledby="drp-standalone-heading">
        <h3 id="drp-standalone-heading" className="mb-2 text-sm font-semibold">
          Standalone
        </h3>
        <DateRangePicker value={standalone} onValueChange={setStandalone} />
        <p className="mt-2 text-sm text-muted-foreground">Selected: {formatRange(standalone)}</p>
      </section>

      <section aria-labelledby="drp-field-heading">
        <h3 id="drp-field-heading" className="mb-2 text-sm font-semibold">
          Inside a Field
        </h3>
        <Field label="Stay dates" hint="Weekdays only, within the next two months." required>
          <DateRangePicker
            value={inField}
            onValueChange={setInField}
            disabled={[{ dayOfWeek: [0, 6] }]}
          />
        </Field>
      </section>

      <section aria-labelledby="drp-bounds-heading">
        <h3 id="drp-bounds-heading" className="mb-2 text-sm font-semibold">
          With min / max window
        </h3>
        <DateRangePicker
          defaultValue={{ from: new Date(2024, 0, 12), to: new Date(2024, 0, 18) }}
          min={new Date(2024, 0, 8)}
          max={new Date(2024, 0, 26)}
          calendarProps={{ defaultMonth: new Date(2024, 0, 1) }}
        />
      </section>

      <section aria-labelledby="drp-rtl-heading" dir="rtl" lang="ar">
        <h3 id="drp-rtl-heading" className="mb-2 text-sm font-semibold">
          RTL
        </h3>
        <DateRangePicker
          dir="rtl"
          triggerLabel="اختر نطاق التاريخ"
          placeholder="اختر نطاقًا"
          dialogLabel="اختر نطاقًا"
        />
      </section>
    </div>
  )
}
