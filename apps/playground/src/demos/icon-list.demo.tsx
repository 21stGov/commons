// SPDX-License-Identifier: MIT

import { IconList, IconListItem } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Icon List'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="icon-list-benefits-heading">
        <h3 id="icon-list-benefits-heading" className="text-sm font-semibold">
          Benefits (decorative check bullets)
        </h3>
        <IconList className="max-w-prose">
          <IconListItem>Free to apply online or in person</IconListItem>
          <IconListItem>Decision within 10 business days</IconListItem>
          <IconListItem>
            Renews automatically each year — you will get a reminder email before it
            lapses so there is nothing else to do.
          </IconListItem>
        </IconList>
      </section>

      <section aria-labelledby="icon-list-steps-heading">
        <h3 id="icon-list-steps-heading" className="text-sm font-semibold">
          Custom default icon (next steps)
        </h3>
        <IconList icon="arrow-right" className="max-w-prose">
          <IconListItem>Submit your application and supporting documents</IconListItem>
          <IconListItem>A caseworker reviews it and may request more info</IconListItem>
          <IconListItem>You receive a decision letter by mail and email</IconListItem>
        </IconList>
      </section>

      <section aria-labelledby="icon-list-compare-heading">
        <h3 id="icon-list-compare-heading" className="text-sm font-semibold">
          Per-item icons (included vs. not)
        </h3>
        <IconList className="max-w-prose">
          <IconListItem iconLabel="Included">Online applications</IconListItem>
          <IconListItem iconLabel="Included">Document upload</IconListItem>
          <IconListItem icon="x" iconLabel="Not available">
            Phone applications
          </IconListItem>
        </IconList>
      </section>

      <section aria-labelledby="icon-list-rtl-heading">
        <h3 id="icon-list-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl">
          <IconList className="max-w-prose">
            <IconListItem>مجاني للتقديم</IconListItem>
            <IconListItem>قرار خلال ١٠ أيام عمل</IconListItem>
          </IconList>
        </div>
      </section>
    </div>
  )
}
