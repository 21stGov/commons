// SPDX-License-Identifier: MIT

'use client'

import { SiteAlert } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function SiteAlertDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Info">
        <SiteAlert variant="info" heading="Offices closed Monday">
          <p>
            City offices are closed Monday, July 4 for the holiday. See the{' '}
            <a href="/holidays">holiday schedule</a>.
          </p>
        </SiteAlert>
      </DemoSection>

      <DemoSection title="Emergency">
        <SiteAlert variant="emergency" heading="Boil water notice in effect">
          Boil tap water for one minute before drinking or cooking until further notice.
        </SiteAlert>
      </DemoSection>

      <DemoSection title="Slim">
        <SiteAlert variant="info" slim>
          Online payments are temporarily unavailable while we perform maintenance.
        </SiteAlert>
      </DemoSection>
    </DemoStack>
  )
}
