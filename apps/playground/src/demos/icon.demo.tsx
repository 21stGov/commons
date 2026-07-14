// SPDX-License-Identifier: MIT

import { Icon, iconNames } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Icon'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="icon-set-heading">
        <h3 id="icon-set-heading" className="text-sm font-semibold">
          The curated set
        </h3>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] gap-2">
          {iconNames.map((name) => (
            <li
              key={name}
              className="flex flex-col items-center gap-105 rounded-md border border-border p-205 text-center"
            >
              <Icon name={name} className="size-[1.5rem] text-foreground" />
              <span className="text-xs text-muted-foreground">{name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="icon-sizing-heading">
        <h3 id="icon-sizing-heading" className="text-sm font-semibold">
          Sizing
        </h3>
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-1 text-sm text-foreground">
            <Icon name="info" /> Scales with small text
          </p>
          <p className="flex items-center gap-1 text-lg text-foreground">
            <Icon name="info" /> Scales with large text
          </p>
          <div className="flex items-end gap-3 text-foreground">
            <Icon name="calendar" size="xs" />
            <Icon name="calendar" size="sm" />
            <Icon name="calendar" size="md" />
            <Icon name="calendar" size="lg" />
          </div>
        </div>
      </section>

      <section aria-labelledby="icon-a11y-heading">
        <h3 id="icon-a11y-heading" className="text-sm font-semibold">
          Decorative vs. meaningful
        </h3>
        <div className="flex flex-col gap-2 text-sm text-foreground">
          <p className="flex items-center gap-1">
            <Icon name="check" /> Application received (decorative icon)
          </p>
          <p className="flex items-center gap-1">
            <Icon name="alert-triangle" label="Warning" /> Labelled icon announced as
            &ldquo;Warning&rdquo;
          </p>
        </div>
      </section>

      <section aria-labelledby="icon-rtl-heading">
        <h3 id="icon-rtl-heading" className="text-sm font-semibold">
          RTL (directional glyphs mirror)
        </h3>
        <div dir="rtl" className="flex items-center gap-3 text-foreground">
          <Icon name="chevron-right" size="md" />
          <Icon name="arrow-right" size="md" />
          <Icon name="external-link" size="md" />
        </div>
      </section>
    </div>
  )
}
