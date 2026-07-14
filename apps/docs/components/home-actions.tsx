// SPDX-License-Identifier: MIT

'use client'

import { buttonVariants, cn } from '@21stgov/commons-react'
import Link from 'next/link'
import * as React from 'react'

/** Homepage navigation links rendered with the Commons button contract. */
export function HomeActions(): React.JSX.Element {
  return (
    <div className="docs-home-actions flex flex-wrap items-center gap-105">
      <Link
        href="/docs"
        data-home-button="primary"
        className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'no-underline')}
      >
        Read the docs
      </Link>
      <a
        href="https://github.com/21stgov/commons"
        data-home-button="outline"
        className={cn(buttonVariants({ variant: 'outline', size: 'md' }), 'no-underline')}
      >
        GitHub
      </a>
    </div>
  )
}
