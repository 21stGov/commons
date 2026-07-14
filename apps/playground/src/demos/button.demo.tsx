// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Button } from '@21stgov/commons-react'

export const title = 'Button'

const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const
const sizes = ['sm', 'md', 'lg'] as const

export default function Demo(): React.JSX.Element {
  const [busy, setBusy] = React.useState(false)

  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="button-variants-heading">
        <h3 id="button-variants-heading" className="text-sm font-semibold">
          Variants × sizes
        </h3>
        <div className="flex flex-col gap-2">
          {variants.map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-105">
              {sizes.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  {variant} {size}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="button-states-heading">
        <h3 id="button-states-heading" className="text-sm font-semibold">
          States
        </h3>
        <div className="flex flex-wrap items-center gap-105">
          <Button disabled>Disabled</Button>
          <Button loading loadingLabel="Loading">
            Loading
          </Button>
          <Button
            loading={busy}
            loadingLabel="Saving"
            onClick={() => {
              setBusy(true)
              setTimeout(() => setBusy(false), 2000)
            }}
          >
            Click to load
          </Button>
          <Button variant="ghost" aria-label="Search">
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="7" cy="7" r="4.5" />
              <path d="m10.5 10.5 3 3" strokeLinecap="round" />
            </svg>
          </Button>
        </div>
      </section>

      <section aria-labelledby="button-rtl-heading">
        <h3 id="button-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl" lang="ar" className="flex flex-wrap items-center gap-105">
          <Button>إرسال الطلب</Button>
          <Button variant="secondary">حفظ كمسودة</Button>
          <Button variant="outline">إلغاء</Button>
          <Button loading loadingLabel="جارٍ الحفظ">
            حفظ
          </Button>
        </div>
      </section>
    </div>
  )
}
