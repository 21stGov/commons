// SPDX-License-Identifier: MIT

import { createFromSource } from 'fumadocs-core/search/server'

import { source } from '@/lib/source'

// Static export: the Orama index is prebuilt at build time and shipped as a
// static file; the client (components/search-dialog.tsx) searches in-browser.
export const revalidate = false

export const { staticGET: GET } = createFromSource(source, {
  language: 'english',
})
