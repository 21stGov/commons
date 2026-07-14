// SPDX-License-Identifier: MIT

/** CLI entry: generate the component CSS + a self-contained verification gallery. */

import { buildCss } from './generate.ts'
import { writeGallery } from './gallery.ts'

const result = await buildCss()
writeGallery(result)

console.log(
  `captured ${result.captured.length} components; skipped ${result.skipped.length} (no cva):`,
)
console.log(`  ${result.skipped.map((s) => s.replace(/ \(no cva\)/, '')).join(', ')}`)
console.log('\nwrote dist/components.src.css, dist/commons.css, dist/gallery.html')
console.log('gallery (self-contained, open directly): poc/non-react/gallery.html')
