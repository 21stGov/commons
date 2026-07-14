// SPDX-License-Identifier: MIT

import { Calendar, type DateRange } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Calendar'

export default function Demo(): React.JSX.Element {
  const [single, setSingle] = React.useState<Date | undefined>(new Date(2024, 0, 15))
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2024, 0, 8),
    to: new Date(2024, 0, 19),
  })
  const [rtl, setRtl] = React.useState<Date | undefined>(new Date(2024, 0, 15))

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="cal-single-heading">
        <h3 id="cal-single-heading" className="mb-2 text-sm font-semibold">
          Single date
        </h3>
        <Calendar
          mode="single"
          selected={single}
          onSelect={setSingle}
          defaultMonth={new Date(2024, 0, 1)}
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Selected: {single ? single.toLocaleDateString() : 'none'}
        </p>
      </section>

      <section aria-labelledby="cal-range-heading">
        <h3 id="cal-range-heading" className="mb-2 text-sm font-semibold">
          Date range
        </h3>
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          numberOfMonths={2}
          defaultMonth={new Date(2024, 0, 1)}
        />
      </section>

      <section aria-labelledby="cal-bounds-heading">
        <h3 id="cal-bounds-heading" className="mb-2 text-sm font-semibold">
          With min / max and disabled days
        </h3>
        <Calendar
          mode="single"
          defaultMonth={new Date(2024, 0, 1)}
          min={new Date(2024, 0, 5)}
          max={new Date(2024, 0, 26)}
          disabled={[{ dayOfWeek: [0, 6] }]}
        />
      </section>

      <section aria-labelledby="cal-rtl-heading" dir="rtl" lang="ar">
        <h3 id="cal-rtl-heading" className="mb-2 text-sm font-semibold">
          RTL (arrow keys flip)
        </h3>
        <Calendar
          mode="single"
          dir="rtl"
          selected={rtl}
          onSelect={setRtl}
          defaultMonth={new Date(2024, 0, 1)}
        />
      </section>
    </div>
  )
}
