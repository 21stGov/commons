// SPDX-License-Identifier: MIT

'use client'

import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function CollapsibleDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Show more details (single disclosure)">
        <p className="max-w-prose text-sm text-muted-foreground">
          The Assistance Program helps residents pay heating bills in winter.
        </p>
        <Collapsible>
          <CollapsibleTrigger>Show eligibility details</CollapsibleTrigger>
          <CollapsiblePanel>
            <p className="max-w-prose text-muted-foreground">
              Households at or below 200% of the federal poverty level qualify. Bring a photo ID and
              proof of income to any service center.
            </p>
          </CollapsiblePanel>
        </Collapsible>
      </DemoSection>

      <DemoSection title="RTL (Arabic — chevron flips to the inline-end edge)">
        <div dir="rtl">
          <Collapsible lang="ar">
            <CollapsibleTrigger>عرض تفاصيل الأهلية</CollapsibleTrigger>
            <CollapsiblePanel>
              <p className="text-muted-foreground">
                الأسر ذات الدخل المنخفض مؤهلة للحصول على الدعم.
              </p>
            </CollapsiblePanel>
          </Collapsible>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
