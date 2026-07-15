// SPDX-License-Identifier: MIT

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { enhanceTooltip } from './popup.ts'

function tooltipMarkup(): void {
  document.body.innerHTML = `
    <div data-slot="tooltip">
      <button data-slot="tooltip-trigger">Info</button>
      <div data-slot="tooltip-positioner" hidden>
        <div data-slot="tooltip-popup">Help</div>
      </div>
    </div>`
}
const trigger = () => document.querySelector<HTMLElement>('[data-slot="tooltip-trigger"]')!
const positioner = () => document.querySelector<HTMLElement>('[data-slot="tooltip-positioner"]')!
const popup = () => document.querySelector<HTMLElement>('[data-slot="tooltip-popup"]')!

describe('enhanceTooltip', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows on pointerenter', () => {
    tooltipMarkup()
    enhanceTooltip(document)
    trigger().dispatchEvent(new Event('pointerenter'))
    expect(positioner().hidden).toBe(false)
    expect(popup().hasAttribute('data-open')).toBe(true)
  })

  it('shows on focus', () => {
    tooltipMarkup()
    enhanceTooltip(document)
    trigger().dispatchEvent(new Event('focus'))
    expect(positioner().hidden).toBe(false)
  })

  it('hides after the close delay on pointerleave', () => {
    vi.useFakeTimers()
    tooltipMarkup()
    enhanceTooltip(document)
    trigger().dispatchEvent(new Event('pointerenter'))
    trigger().dispatchEvent(new Event('pointerleave'))
    expect(positioner().hidden).toBe(false) // still open until the delay elapses
    vi.advanceTimersByTime(100)
    expect(positioner().hidden).toBe(true)
    expect(popup().hasAttribute('data-open')).toBe(false)
  })

  it('hides on Escape from the trigger', () => {
    vi.useFakeTimers()
    tooltipMarkup()
    enhanceTooltip(document)
    trigger().dispatchEvent(new Event('pointerenter'))
    trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    vi.advanceTimersByTime(100)
    expect(positioner().hidden).toBe(true)
  })
})
