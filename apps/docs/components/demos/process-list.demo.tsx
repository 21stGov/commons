// SPDX-License-Identifier: MIT

'use client'

import { ProcessList, ProcessListItem } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function ProcessListDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="How to apply for a permit">
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
      </DemoSection>

      <DemoSection title="With complete / current / upcoming status">
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
      </DemoSection>

      <DemoSection title="With substeps">
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
      </DemoSection>
    </DemoStack>
  )
}
