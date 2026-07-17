// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceMenubar, enhanceNavigationMenu } from './menubar.ts'

function menubarMarkup(): void {
  document.body.innerHTML = `
    <div data-slot="menubar" role="menubar">
      <div data-slot="menubar-menu">
        <button data-slot="menubar-trigger" aria-expanded="false" aria-haspopup="true">File</button>
        <div data-slot="menubar-positioner" hidden>
          <div data-slot="menubar-content">
            <button role="menuitem">New</button>
            <button role="menuitem">Open</button>
          </div>
        </div>
      </div>
      <div data-slot="menubar-menu">
        <button data-slot="menubar-trigger" aria-expanded="false" aria-haspopup="true">Edit</button>
        <div data-slot="menubar-positioner" hidden>
          <div data-slot="menubar-content">
            <button role="menuitem">Undo</button>
          </div>
        </div>
      </div>
    </div>`
}

const triggers = () => document.querySelectorAll<HTMLElement>('[data-slot="menubar-trigger"]')
const positioners = () => document.querySelectorAll<HTMLElement>('[data-slot="menubar-positioner"]')

describe('enhanceMenubar', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('opens a menu on trigger click and closes it on a second click', () => {
    menubarMarkup()
    enhanceMenubar(document)
    const [file] = triggers()
    const [filePos] = positioners()
    file.click()
    expect(file.getAttribute('aria-expanded')).toBe('true')
    expect(filePos.hidden).toBe(false)
    file.click()
    expect(file.getAttribute('aria-expanded')).toBe('false')
    expect(filePos.hidden).toBe(true)
  })

  it('opening another menu closes the first (one open at a time)', () => {
    menubarMarkup()
    enhanceMenubar(document)
    const [file, edit] = triggers()
    file.click()
    edit.click()
    expect(file.getAttribute('aria-expanded')).toBe('false')
    expect(edit.getAttribute('aria-expanded')).toBe('true')
    edit.click() // leave closed
  })

  it('ArrowRight moves focus to the next trigger', () => {
    menubarMarkup()
    enhanceMenubar(document)
    const [file, edit] = triggers()
    file.focus()
    file.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(document.activeElement).toBe(edit)
  })

  it('ArrowDown opens the menu and focuses the first item', () => {
    menubarMarkup()
    enhanceMenubar(document)
    const [file] = triggers()
    const [filePos] = positioners()
    file.focus()
    file.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(filePos.hidden).toBe(false)
    expect(document.activeElement).toBe(filePos.querySelector('[role="menuitem"]'))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })) // leave closed
  })

  it('Escape closes the open menu and returns focus to its trigger', () => {
    menubarMarkup()
    enhanceMenubar(document)
    const [file] = triggers()
    const [filePos] = positioners()
    file.click()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(filePos.hidden).toBe(true)
    expect(document.activeElement).toBe(file)
  })
})

describe('enhanceNavigationMenu', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  function navMenuMarkup(): void {
    document.body.innerHTML = `
      <nav data-slot="navigation-menu">
        <ul data-slot="navigation-menu-list">
          <li data-slot="navigation-menu-item">
            <button data-slot="navigation-menu-trigger" aria-haspopup="menu" aria-expanded="false">
              Services
              <span data-slot="navigation-menu-trigger-icon"></span>
            </button>
            <div data-slot="navigation-menu-positioner" hidden>
              <div data-slot="navigation-menu-popup">
                <a data-slot="navigation-menu-link" href="#permits">Permits</a>
              </div>
            </div>
          </li>
        </ul>
      </nav>`
  }

  // The open trigger's border/weight and the chevron's rotation are keyed off
  // `[data-popup-open]` in the generated CSS (mirroring React's Base UI state) —
  // not `aria-expanded` — so the enhancer must set it on the trigger AND its
  // icon for the HTML path to match the React presentation.
  it('mirrors the open state as data-popup-open on the trigger and its icon', () => {
    navMenuMarkup()
    enhanceNavigationMenu(document)
    const trigger = document.querySelector<HTMLElement>('[data-slot="navigation-menu-trigger"]')!
    const icon = document.querySelector<HTMLElement>('[data-slot="navigation-menu-trigger-icon"]')!

    expect(trigger.hasAttribute('data-popup-open')).toBe(false)
    expect(icon.hasAttribute('data-popup-open')).toBe(false)

    trigger.click()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.hasAttribute('data-popup-open')).toBe(true)
    expect(icon.hasAttribute('data-popup-open')).toBe(true)

    trigger.click()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.hasAttribute('data-popup-open')).toBe(false)
    expect(icon.hasAttribute('data-popup-open')).toBe(false)
  })
})
