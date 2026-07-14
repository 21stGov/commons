// SPDX-License-Identifier: MIT

'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function TooltipDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Brief supporting description">
        <TooltipProvider>
          <p>
            Your parcel ID is printed on your assessment notice.{' '}
            <Tooltip>
              <TooltipTrigger>Parcel ID format</TooltipTrigger>
              <TooltipContent>Two letters followed by eight numbers, such as AB-12345678.</TooltipContent>
            </Tooltip>
          </p>
        </TooltipProvider>
      </DemoSection>

      <DemoSection title="Prefer visible help whenever space allows">
        <p className="max-w-prose text-sm text-muted-foreground">
          Tooltips hide information. Keep instructions, errors, deadlines, and anything residents
          must understand visible on the page; reserve this component for brief, noncritical help.
        </p>
      </DemoSection>
    </DemoStack>
  )
}
