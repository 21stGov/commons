// SPDX-License-Identifier: MIT

'use client'

import {
  Button,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function PopoverDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Filter panel">
        <Popover>
          <PopoverTrigger render={<Button variant="outline">Filters</Button>} />
          <PopoverContent>
            <PopoverTitle>Filter results</PopoverTitle>
            <PopoverDescription>Narrow the list to matching records.</PopoverDescription>
            <PopoverClose render={<Button size="sm">Apply</Button>} />
          </PopoverContent>
        </Popover>
      </DemoSection>
    </DemoStack>
  )
}
