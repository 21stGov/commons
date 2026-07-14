// SPDX-License-Identifier: MIT

'use client'

import { Button } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const

export default function ButtonDemo(): React.JSX.Element {
  const [busy, setBusy] = React.useState(false)

  return (
    <DemoStack>
      <DemoSection title="Variants">
        <div className="flex flex-wrap items-center gap-105">
          {variants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant.charAt(0).toUpperCase() + variant.slice(1)}
            </Button>
          ))}
        </div>
      </DemoSection>

      <DemoSection title="States">
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
        </div>
      </DemoSection>

      <DemoSection title="RTL">
        <div dir="rtl" lang="ar" className="flex flex-wrap items-center gap-105">
          <Button>إرسال الطلب</Button>
          <Button variant="secondary">حفظ كمسودة</Button>
          <Button variant="outline">إلغاء</Button>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
