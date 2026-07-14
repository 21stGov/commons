// SPDX-License-Identifier: MIT

'use client'

import { AspectRatio } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

function CivicPreview({ label }: { label: string }): React.JSX.Element {
  return (
    <div className="flex size-full items-end bg-muted p-2 text-foreground">
      <div className="flex items-center gap-1 rounded-sm border border-border bg-background px-105 py-05 text-sm shadow-1">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="size-3 shrink-0"
        >
          <path d="M3 9h18M5 9v9m4-9v9m6-9v9m4-9v9M3 18h18M12 3l9 4H3l9-4Z" />
        </svg>
        {label}
      </div>
    </div>
  )
}

export default function AspectRatioDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Widescreen service preview (16:9)">
        <AspectRatio ratio={16 / 9} className="max-w-2xl overflow-hidden rounded-md border border-border">
          <CivicPreview label="Community services" />
        </AspectRatio>
      </DemoSection>

      <DemoSection title="Square thumbnail (1:1)">
        <AspectRatio ratio={1} className="max-w-64 overflow-hidden rounded-md border border-border">
          <CivicPreview label="City Hall" />
        </AspectRatio>
      </DemoSection>

      <DemoSection title="RTL content remains direction-neutral">
        <div dir="rtl" lang="ar" className="max-w-lg">
          <AspectRatio ratio={4 / 3} className="overflow-hidden rounded-md border border-border">
            <CivicPreview label="الخدمات المجتمعية" />
          </AspectRatio>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
