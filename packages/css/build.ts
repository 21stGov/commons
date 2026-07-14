// SPDX-License-Identifier: MIT

/**
 * CLI entry: generate the component CSS + a self-contained verification
 * gallery, then render every React demo into `.cui-*` HTML for the HTML
 * playground (apps/html-playground).
 */

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { generateDemos } from './demos.ts'
import { buildCss } from './generate.ts'
import { writeGallery } from './gallery.ts'

const here = dirname(fileURLToPath(import.meta.url))
const playgroundGenerated = join(here, '..', '..', 'apps', 'html-playground', 'src', 'generated')

const result = await buildCss()
writeGallery(result)

console.log(`captured ${result.captured.length} components; skipped ${result.skipped.length}:`)
console.log(`  ${result.skipped.join(', ')}`)
if (result.dropped.length > 0) {
  console.log(`\ndropped ${result.dropped.length} un-@apply-able utilities: ${result.dropped.join(', ')}`)
}
console.log('\nwrote dist/components.src.css, dist/commons.css, dist/gallery.html')
console.log('gallery (self-contained, open directly): poc/non-react/gallery.html')

const { results: demos, internalGap } = await generateDemos(
  result.classNames,
  result.signatures,
  playgroundGenerated,
)
const failed = demos.filter((d) => !d.ok)
console.log(`\nhtml-playground: rendered ${demos.length - failed.length}/${demos.length} demos to .cui-* HTML`)
if (failed.length > 0) {
  for (const d of failed) console.log(`  FAILED ${d.slug}: ${d.error}`)
}
if (internalGap.length > 0) {
  console.log(
    `\ncommons.css coverage gap — ${internalGap.length} utility classes still needed by component internals (mostly icon sizing), supplied by the playground's scaffold.css for now:`,
  )
  console.log(`  ${internalGap.join(' ')}`)
}
