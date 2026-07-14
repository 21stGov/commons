// SPDX-License-Identifier: MIT

import type { JSX } from 'react'

const statusCopy: Record<string, string> = {
  experimental:
    'Experimental — the API may change before a stable release. Manual assistive-technology testing is still in progress.',
  stable: 'Stable — the API and accessibility contract are covered by semantic versioning.',
  deprecated: 'Deprecated — scheduled for removal; see the migration notes.',
}

/** Status badge on generated component pages. Never communicates by color alone. */
export function ComponentStatus({ status }: { status: string }): JSX.Element {
  return (
    <p className="not-prose">
      <span className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-muted px-2 py-1 text-sm font-semibold uppercase tracking-wide">
        Status: {status}
      </span>
      <span className="sr-only">{statusCopy[status] ?? ''}</span>
    </p>
  )
}
