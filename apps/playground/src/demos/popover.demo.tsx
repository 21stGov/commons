// SPDX-License-Identifier: MIT

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

export const title = 'Popover'

export default function Demo(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
      <Popover>
        <PopoverTrigger render={<Button variant="outline">Filters</Button>} />
        <PopoverContent>
          <PopoverTitle>Filter results</PopoverTitle>
          <PopoverDescription>Narrow the list to matching records.</PopoverDescription>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            Keyword
            <input type="text" name="keyword" />
          </label>
          <PopoverClose render={<Button size="sm">Apply</Button>} />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger>Extra actions</PopoverTrigger>
        <PopoverContent side="right" align="start">
          <PopoverTitle>Record actions</PopoverTitle>
          <PopoverClose>Duplicate</PopoverClose>
          <PopoverClose>Export</PopoverClose>
        </PopoverContent>
      </Popover>
    </div>
  )
}
