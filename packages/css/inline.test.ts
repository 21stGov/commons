// SPDX-License-Identifier: MIT

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { extractInlineSlots } from './inline.ts'

let dir: string
function fixture(source: string): string {
  const file = join(dir, 'component.tsx')
  writeFileSync(file, source)
  return file
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'cui-inline-'))
})
afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

describe('extractInlineSlots — cvaOnSlot', () => {
  it('records EVERY slot a cva styles, not just the first', () => {
    // navigationMenuTriggerVariants dresses both the trigger and a plain bar
    // link — the generator must emit its `.cui-*` variants under each slot, so
    // the HTML path matches React for both. (First-wins would silently drop the
    // second, and the bar link would lose the trigger's border/weight styling.)
    const file = fixture(`
      export function Nav() {
        return (
          <ul>
            <li>
              <button data-slot="nav-trigger" className={cn(navVariants({ current: false }))}>Home</button>
            </li>
            <li>
              <a data-slot="nav-bar-link" className={cn(navVariants({ current: true }))}>Contact</a>
            </li>
          </ul>
        )
      }
    `)
    // `cvaBases` tells the extractor which identifiers are cva calls.
    const cvaBases = new Map([['navVariants', ['border-b-2']]])
    const { cvaOnSlot } = extractInlineSlots(file, cvaBases)
    expect(cvaOnSlot.get('navVariants')).toEqual(new Set(['nav-trigger', 'nav-bar-link']))
  })
})
