// SPDX-License-Identifier: MIT

import { SummaryBox } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Summary box'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex max-w-measure-lg flex-col gap-5">
      <SummaryBox heading="What you'll need">
        <ul>
          <li>A valid, government-issued photo ID</li>
          <li>Proof of residency dated within the last 90 days</li>
          <li>Your application or case number</li>
          <li>
            A completed <a href="/forms/w9">W-9 form</a>
          </li>
        </ul>
      </SummaryBox>

      <SummaryBox heading="Next steps" headingLevel="h2">
        <ol>
          <li>Review your answers on the summary page.</li>
          <li>Pay the $25 filing fee.</li>
          <li>Submit and download your confirmation receipt.</li>
        </ol>
      </SummaryBox>

      <div dir="rtl" lang="ar">
        <SummaryBox heading="ما ستحتاج إليه">
          <ul>
            <li>بطاقة هوية حكومية سارية بصورة</li>
            <li>إثبات إقامة خلال آخر 90 يوماً</li>
          </ul>
        </SummaryBox>
      </div>
    </div>
  )
}
