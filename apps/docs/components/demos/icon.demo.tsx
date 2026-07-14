// SPDX-License-Identifier: MIT

'use client'

import { Icon, iconNames } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function IconDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="The curated set">
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] gap-2">
          {iconNames.map((name) => (
            <li
              key={name}
              className="flex flex-col items-center gap-105 rounded-md border border-border p-205 text-center"
            >
              {/* Decorative: the visible name below already labels each cell. */}
              <Icon name={name} className="size-[1.5rem] text-foreground" />
              <span className="text-xs text-muted-foreground">{name}</span>
            </li>
          ))}
        </ul>
      </DemoSection>

      <DemoSection title="Sizing">
        {/* Default 1em: the icon scales with — and optically matches — its text. */}
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-1 text-sm text-foreground">
            <Icon name="info" /> Scales with small text (1em default)
          </p>
          <p className="flex items-center gap-1 text-lg text-foreground">
            <Icon name="info" /> Scales with large text (1em default)
          </p>
          <div className="flex items-end gap-3 text-foreground">
            <Icon name="calendar" size="xs" />
            <Icon name="calendar" size="sm" />
            <Icon name="calendar" size="md" />
            <Icon name="calendar" size="lg" />
          </div>
        </div>
      </DemoSection>

      <DemoSection title="Decorative vs. meaningful">
        <div className="flex flex-col gap-2 text-sm text-foreground">
          {/* Decorative: aria-hidden, skipped by screen readers — the text carries the meaning. */}
          <p className="flex items-center gap-1">
            <Icon name="check" className="text-foreground" /> Application received
          </p>
          {/* Meaningful: a standalone icon with no text needs an accessible name. */}
          <p className="flex items-center gap-1">
            <Icon name="alert-triangle" label="Warning" className="text-foreground" />
            <span className="sr-only">followed by</span> a labelled status icon that screen
            readers announce as &ldquo;Warning&rdquo;.
          </p>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
