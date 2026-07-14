// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Link } from '@21stgov/commons-react'

export const title = 'Link'

// Note: links have no disabled state (native <a> contract — remove the
// href instead) and are not form controls, so there is no in-Field usage.

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="link-variants-heading">
        <h3 id="link-variants-heading" className="text-sm font-semibold">
          Variants
        </h3>
        <div className="flex flex-col gap-105">
          <p>
            Renew your permit on the <Link href="#default">city services page</Link> before the
            deadline. (default — always underlined, visited uses the link-visited token)
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
      </section>

      <section aria-labelledby="link-external-heading">
        <h3 id="link-external-heading" className="text-sm font-semibold">
          External (explicit only)
        </h3>
        <div className="flex flex-col gap-105">
          <p>
            Federal guidance lives on{' '}
            <Link href="https://www.ada.gov" external>
              ADA.gov
            </Link>
            . The icon is decorative; screen readers hear “(opens in new tab)”, and
            rel=&quot;noreferrer noopener&quot; is forced.
          </p>
          <Link href="https://designsystem.digital.gov" variant="standalone" external>
            Compare with USWDS
          </Link>
          <p>
            Translated label:{' '}
            <Link
              href="https://www.ada.gov"
              external
              externalLabel="(se abre en una pestaña nueva)"
            >
              ADA.gov en español
            </Link>
          </p>
        </div>
      </section>

      <section aria-labelledby="link-rtl-heading">
        <h3 id="link-rtl-heading" className="text-sm font-semibold">
          RTL (directional icons mirror)
        </h3>
        <div dir="rtl" lang="ar" className="flex flex-col gap-105">
          <p>
            جدّد تصريحك عبر <Link href="#rtl">صفحة خدمات المدينة</Link> قبل الموعد النهائي.
          </p>
          <Link href="#rtl-standalone" variant="standalone">
            عرض جميع الخدمات
          </Link>
          <p>
            <Link href="https://www.ada.gov" external externalLabel="(يفتح في علامة تبويب جديدة)">
              الموقع الفيدرالي
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
