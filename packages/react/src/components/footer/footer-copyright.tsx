// SPDX-License-Identifier: MIT

'use client'

import * as React from 'react'

import { cn } from '@/lib/cn'

const MAX_YEAR_CHECK_DELAY = 24 * 60 * 60 * 1000

export interface FooterCopyrightProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Organization or rights holder shown after the year.
   * Translation-ready; this may include localized text or links.
   */
  children: React.ReactNode
  /**
   * Fixed year override. Omit it to use the visitor's current local year
   * and update automatically when that year changes.
   */
  year?: number
}

function getCurrentYear(): number {
  return new Date().getFullYear()
}

/**
 * Final line of a composed site footer. Place it last, after an optional
 * Identifier, so legal ownership remains the bottom-most footer content.
 * When `year` is omitted, the local calendar year refreshes at least daily
 * and immediately around the New Year boundary without a page reload.
 */
export const FooterCopyright = React.forwardRef<HTMLDivElement, FooterCopyrightProps>(
  function FooterCopyright({ className, children, year, ...props }, ref) {
    const [currentYear, setCurrentYear] = React.useState(getCurrentYear)

    React.useEffect(() => {
      if (year !== undefined) {
        return undefined
      }

      let timeoutId: number | undefined

      function refreshAndSchedule(): void {
        const now = new Date()
        setCurrentYear(now.getFullYear())

        const nextYear = new Date(now.getFullYear() + 1, 0, 1)
        const untilNextYear = nextYear.getTime() - now.getTime() + 1000
        timeoutId = window.setTimeout(
          refreshAndSchedule,
          Math.min(untilNextYear, MAX_YEAR_CHECK_DELAY)
        )
      }

      refreshAndSchedule()
      return () => {
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId)
        }
      }
    }, [year])

    const displayedYear = year ?? currentYear

    return (
      <div
        {...props}
        ref={ref}
        data-slot="footer-copyright"
        className={cn('border-t border-border bg-muted text-foreground', className)}
      >
        <p className="mx-auto w-full max-w-5xl px-2 py-105 text-sm">
          ©{' '}
          <span data-slot="footer-copyright-year" suppressHydrationWarning>
            {displayedYear}
          </span>{' '}
          {children}
        </p>
      </div>
    )
  }
)
