// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceScrollArea } from './scrollarea.ts'

function metric(el: Element, prop: string, value: number): void {
  Object.defineProperty(el, prop, { configurable: true, value })
}

function area(): void {
  document.body.innerHTML = `
    <div data-slot="scroll-area">
      <div data-slot="scroll-area-viewport"><div>content</div></div>
      <div data-slot="scroll-area-scrollbar" data-orientation="vertical">
        <div data-slot="scroll-area-thumb"></div>
      </div>
    </div>`
}
const bar = () => document.querySelector<HTMLElement>('[data-slot="scroll-area-scrollbar"]')!
const thumb = () => document.querySelector<HTMLElement>('[data-slot="scroll-area-thumb"]')!
const viewport = () => document.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')!

describe('enhanceScrollArea', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('hides a scrollbar whose axis does not overflow', () => {
    area()
    enhanceScrollArea(document) // jsdom reports 0 metrics → no overflow
    expect(bar().hidden).toBe(true)
  })

  it('shows and sizes the thumb when the content overflows', () => {
    area()
    metric(viewport(), 'clientHeight', 100)
    metric(viewport(), 'scrollHeight', 300)
    metric(viewport(), 'scrollTop', 0)
    metric(bar(), 'clientHeight', 100)
    enhanceScrollArea(document)
    expect(bar().hidden).toBe(false)
    expect(thumb().style.height).not.toBe('')
  })
})
