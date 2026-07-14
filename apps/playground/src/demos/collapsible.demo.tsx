// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '@21stgov/commons-react'

export const title = 'Collapsible'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="collapsible-default-heading">
        <h3 id="collapsible-default-heading" className="text-sm font-semibold">
          Show more details (single disclosure)
        </h3>
        <p className="max-w-prose text-sm text-muted-foreground">
          The Assistance Program helps residents pay heating bills in winter.
        </p>
        <Collapsible>
          <CollapsibleTrigger>Show eligibility details</CollapsibleTrigger>
          <CollapsiblePanel>
            <p className="max-w-prose text-muted-foreground">
              Households at or below 200% of the federal poverty level qualify. Bring a photo ID,
              a recent utility bill, and proof of income to any service center.
            </p>
          </CollapsiblePanel>
        </Collapsible>
      </section>

      <section aria-labelledby="collapsible-open-heading">
        <h3 id="collapsible-open-heading" className="text-sm font-semibold">
          Open by default, no chevron indicator
        </h3>
        <Collapsible defaultOpen>
          <CollapsibleTrigger showIndicator={false}>Toggle office hours</CollapsibleTrigger>
          <CollapsiblePanel>
            <p className="text-muted-foreground">
              City Hall is open Monday through Friday, 8:00 AM to 4:30 PM.
            </p>
          </CollapsiblePanel>
        </Collapsible>
      </section>

      <section aria-labelledby="collapsible-find-heading">
        <h3 id="collapsible-find-heading" className="text-sm font-semibold">
          hiddenUntilFound (browser find-in-page can reveal the closed panel)
        </h3>
        <Collapsible>
          <CollapsibleTrigger>Show mailing address</CollapsibleTrigger>
          <CollapsiblePanel hiddenUntilFound>
            <p className="text-muted-foreground">
              Office of the Clerk, 100 Main Street, Suite 200. Try Ctrl/Cmd+F for “Suite 200”.
            </p>
          </CollapsiblePanel>
        </Collapsible>
      </section>

      <section aria-labelledby="collapsible-rtl-heading">
        <h3 id="collapsible-rtl-heading" className="text-sm font-semibold">
          RTL (Arabic — chevron flips to the inline-end edge)
        </h3>
        <div dir="rtl">
          <Collapsible lang="ar">
            <CollapsibleTrigger>عرض تفاصيل الأهلية</CollapsibleTrigger>
            <CollapsiblePanel>
              <p className="text-muted-foreground">
                الأسر ذات الدخل المنخفض مؤهلة للحصول على الدعم. أحضر بطاقة هوية وإثبات دخل.
              </p>
            </CollapsiblePanel>
          </Collapsible>
        </div>
      </section>
    </div>
  )
}
