// SPDX-License-Identifier: MIT

import Script from 'next/script'
import type { JSX } from 'react'

/**
 * Analytics are build-time opt-in. Local builds and downstream forks emit no
 * tracking script unless they deliberately provide their own public Site ID.
 */
export function FathomAnalytics(): JSX.Element | null {
  const siteId = process.env.NEXT_PUBLIC_FATHOM_SITE_ID?.trim()

  if (!siteId) return null

  return (
    <Script
      id="fathom-analytics"
      src="https://cdn.usefathom.com/script.js"
      data-site={siteId}
      data-spa="auto"
      data-honor-dnt="true"
      strategy="afterInteractive"
    />
  )
}
