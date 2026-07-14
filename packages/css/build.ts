// SPDX-License-Identifier: MIT

/** CLI entry: generate the component CSS + a self-contained verification gallery. */

import { buildCss } from './generate.ts'
import { writeGallery } from './gallery.ts'

const result = await buildCss()
writeGallery(result)

console.log(`captured ${result.captured.length} components; skipped ${result.skipped.length}:`)
console.log(`  ${result.skipped.join(', ')}`)
if (result.dropped.length > 0) {
  console.log(`\ndropped ${result.dropped.length} un-@apply-able utilities: ${result.dropped.join(', ')}`)
}
console.log('\nwrote dist/components.src.css, dist/commons.css, dist/gallery.html')
console.log('gallery (self-contained, open directly): poc/non-react/gallery.html')
