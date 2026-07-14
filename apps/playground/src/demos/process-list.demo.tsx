// SPDX-License-Identifier: MIT

import * as React from 'react'

import { ProcessList, ProcessListItem } from '@21stgov/commons-react'

export const title = 'Process list'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <section aria-labelledby="pl-basic-heading">
        <h3 id="pl-basic-heading" className="text-sm font-semibold">
          How to apply for a permit
        </h3>
        <ProcessList>
          <ProcessListItem heading="Gather your documents">
            Collect proof of ownership, a site plan, and a government-issued ID before you
            start the application.
          </ProcessListItem>
          <ProcessListItem heading="Complete the application">
            Fill out every required field on the permit form. You can save a draft and return
            to it later.
          </ProcessListItem>
          <ProcessListItem heading="Pay the filing fee">
            Fees vary by permit type. You will see the exact amount before you submit payment.
          </ProcessListItem>
          <ProcessListItem heading="Await review">
            A reviewer will contact you within 10 business days if anything else is needed.
          </ProcessListItem>
        </ProcessList>
      </section>

      <section aria-labelledby="pl-status-heading">
        <h3 id="pl-status-heading" className="text-sm font-semibold">
          With complete / current / upcoming status
        </h3>
        <ProcessList>
          <ProcessListItem heading="Gather your documents" status="complete">
            Submitted on March 3.
          </ProcessListItem>
          <ProcessListItem heading="Complete the application" status="complete">
            Submitted on March 5.
          </ProcessListItem>
          <ProcessListItem heading="Pay the filing fee" status="current">
            Payment is due within 5 business days of submitting your application.
          </ProcessListItem>
          <ProcessListItem heading="Await review" status="upcoming">
            You will be notified by email once a reviewer is assigned.
          </ProcessListItem>
        </ProcessList>
      </section>

      <section aria-labelledby="pl-substeps-heading">
        <h3 id="pl-substeps-heading" className="text-sm font-semibold">
          With substeps
        </h3>
        <ProcessList>
          <ProcessListItem heading="Gather your documents">
            <p>You will need the following:</p>
            <ProcessList size="compact">
              <ProcessListItem heading="Proof of ownership">
                A deed, title, or lease agreement.
              </ProcessListItem>
              <ProcessListItem heading="Site plan">
                A drawing showing the project location on your property.
              </ProcessListItem>
              <ProcessListItem heading="Government-issued ID">
                A driver&rsquo;s license, state ID, or passport.
              </ProcessListItem>
            </ProcessList>
          </ProcessListItem>
          <ProcessListItem heading="Submit the application">
            Upload the documents above along with the completed form.
          </ProcessListItem>
        </ProcessList>
      </section>

      <section aria-labelledby="pl-rtl-heading">
        <h3 id="pl-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl" lang="ar">
          <ProcessList>
            <ProcessListItem heading="اجمع مستنداتك">
              اجمع إثبات الملكية ومخطط الموقع وبطاقة هوية حكومية.
            </ProcessListItem>
            <ProcessListItem heading="أكمل الطلب" status="current">
              املأ جميع الحقول المطلوبة في نموذج الطلب.
            </ProcessListItem>
          </ProcessList>
        </div>
      </section>
    </div>
  )
}
