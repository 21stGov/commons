// SPDX-License-Identifier: MIT

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { JSX } from 'react'

/**
 * The CDN quick-start snippet for the Installation guide, rendered as a server
 * component so the version comes from the live (lockstep) package version at
 * build time — the URL never drifts from the release. The generated component
 * pages get the same value via `scripts/lib/data.ts`; this keeps the one
 * hand-authored guide in sync too.
 */
function cdnBase(): string {
  const pkg = JSON.parse(
    readFileSync(join(process.cwd(), '..', '..', 'packages', 'css', 'package.json'), 'utf8')
  ) as { version: string }
  return `https://cdn.commonsui.com/v${pkg.version}`
}

export function CdnLinks(): JSX.Element {
  const base = cdnBase()
  return (
    <pre className="docs-cdn-snippet not-prose" tabIndex={0}>
      <code>
        {`<link rel="stylesheet" href="${base}/commons.css" />\n`}
        {`<script src="${base}/commons.js" defer></script>`}
      </code>
    </pre>
  )
}
