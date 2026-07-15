// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceContextMenu } from './popup.ts'

function contextMenuMarkup(): void {
  document.body.innerHTML = `
    <div data-slot="context-menu">
      <button data-slot="context-menu-trigger" aria-expanded="false">Right-click me</button>
      <div data-slot="context-menu-positioner" hidden>
        <div data-slot="context-menu-popup" role="menu">
          <button role="menuitem">Cut</button>
          <button role="menuitem">Copy</button>
        </div>
      </div>
    </div>`
}
const trigger = () => document.querySelector<HTMLElement>('[data-slot="context-menu-trigger"]')!
const positioner = () => document.querySelector<HTMLElement>('[data-slot="context-menu-positioner"]')!

describe('enhanceContextMenu', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('opens on the contextmenu event and focuses the first item', () => {
    contextMenuMarkup()
    enhanceContextMenu(document)
    trigger().dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, clientX: 10, clientY: 10 }))
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    expect(positioner().hidden).toBe(false)
    const items = document.querySelectorAll<HTMLElement>('[role="menuitem"]')
    expect(document.activeElement).toBe(items[0])
  })

  it('closes on Escape', () => {
    contextMenuMarkup()
    enhanceContextMenu(document)
    trigger().dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, clientX: 10, clientY: 10 }))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(positioner().hidden).toBe(true)
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })
})
