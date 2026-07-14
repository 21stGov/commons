// SPDX-License-Identifier: MIT

'use client'

import { Link } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function LinkDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Variants">
        <div className="flex flex-col gap-105">
          <p>
            Renew your permit on the <Link href="#default">city services page</Link> before the
            deadline. (default — always underlined)
          </p>
          <p className="text-muted-foreground">
            Footer-style navigation:{' '}
            <Link href="#subtle" variant="subtle">
              Privacy policy
            </Link>{' '}
            (subtle — inherits text color, keeps the underline)
          </p>
          <Link href="#standalone" variant="standalone">
            View all city services
          </Link>
        </div>
      </DemoSection>

      <DemoSection title="External (explicit only)">
        <p>
          Federal guidance lives on{' '}
          <Link href="https://www.ada.gov" external>
            ADA.gov
          </Link>
          . The icon is decorative; screen readers hear “(opens in new tab)”, and
          rel=&quot;noreferrer noopener&quot; is forced.
        </p>
      </DemoSection>

      <DemoSection title="RTL">
        <p dir="rtl" lang="ar">
          جدِّد تصريحك في <Link href="#rtl">صفحة خدمات المدينة</Link> قبل الموعد النهائي.
        </p>
      </DemoSection>
    </DemoStack>
  )
}
