// SPDX-License-Identifier: MIT

'use client'

import { usePathname } from 'next/navigation'
import * as React from 'react'

/** Moves new documentation pages to their beginning after client navigation. */
export function RouteScrollReset(): null {
  const pathname = usePathname()
  const previousPathname = React.useRef(pathname)

  React.useEffect(() => {
    if (previousPathname.current === pathname) return
    previousPathname.current = pathname

    const frame = window.requestAnimationFrame(() => {
      document.getElementById('main')?.focus({ preventScroll: true })
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [pathname])

  return null
}
