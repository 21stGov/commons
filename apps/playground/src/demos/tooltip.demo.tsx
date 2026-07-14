// SPDX-License-Identifier: MIT

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Tooltip'

export default function Demo(): React.JSX.Element {
  return (
    <TooltipProvider>
      <p>
        Your parcel ID is printed on your assessment notice.{' '}
        <Tooltip>
          <TooltipTrigger>Parcel ID format</TooltipTrigger>
          <TooltipContent>Two letters followed by eight numbers, such as AB-12345678.</TooltipContent>
        </Tooltip>
      </p>
    </TooltipProvider>
  )
}
