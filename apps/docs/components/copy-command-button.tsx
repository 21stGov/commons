// SPDX-License-Identifier: MIT

'use client'

import * as React from 'react'

export interface CopyCommandButtonProps {
  value: string
}

/** Compact copy action with persistent focus and a polite status update. */
export function CopyCommandButton({ value }: CopyCommandButtonProps): React.JSX.Element {
  const [copied, setCopied] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    },
    []
  )

  async function copy(): Promise<void> {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button
      type="button"
      className="docs-copy-command"
      aria-label={copied ? 'Command copied' : 'Copy command'}
      onClick={() => void copy()}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </button>
  )
}

function CopyIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <rect x="6.5" y="6.5" width="9" height="9" rx="1.5" stroke="currentColor" />
      <path d="M4.5 13.5h-1v-10h10v1" stroke="currentColor" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path
        d="m4.5 10 3.25 3.25 7.75-7.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
