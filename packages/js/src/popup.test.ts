// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceDropdownMenu, enhancePopover } from './popup.ts'

describe('enhancePopover', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('opens on trigger click and closes on a second click', () => {
    document.body.innerHTML = `
      <div data-slot="popover">
        <button data-slot="popover-trigger" aria-expanded="false">Open</button>
        <div data-slot="popover-positioner" hidden>
          <div data-slot="popover-popup"><a href="#">link</a></div>
        </div>
      </div>`
    enhancePopover(document)
    const trigger = document.querySelector<HTMLElement>('[data-slot="popover-trigger"]')!
    const positioner = document.querySelector<HTMLElement>('[data-slot="popover-positioner"]')!

    trigger.click()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(positioner.hidden).toBe(false)

    trigger.click()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(positioner.hidden).toBe(true)
  })
})

describe('enhanceDropdownMenu', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('opens the menu, marks the popup open, and focuses the first item', () => {
    document.body.innerHTML = `
      <div data-slot="dropdown-menu">
        <button data-slot="dropdown-menu-trigger" aria-expanded="false">Menu</button>
        <div data-slot="dropdown-menu-positioner" hidden>
          <div data-slot="dropdown-menu-popup" role="menu">
            <button role="menuitem">One</button>
            <button role="menuitem">Two</button>
          </div>
        </div>
      </div>`
    enhanceDropdownMenu(document)
    const trigger = document.querySelector<HTMLElement>('[data-slot="dropdown-menu-trigger"]')!
    const popup = document.querySelector<HTMLElement>('[data-slot="dropdown-menu-popup"]')!

    trigger.click()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(popup.hasAttribute('data-open')).toBe(true)
    const items = document.querySelectorAll<HTMLElement>('[role="menuitem"]')
    expect(document.activeElement).toBe(items[0])
  })
})
