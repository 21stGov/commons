// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceDialog } from './dialog.ts'

function dialogMarkup(): void {
  document.body.innerHTML = `
    <div data-slot="dialog">
      <button data-slot="dialog-trigger" aria-expanded="false">Open</button>
      <div data-slot="dialog-backdrop" hidden></div>
      <div data-slot="dialog-viewport" hidden>
        <div data-slot="dialog-popup" role="dialog" aria-modal="true" tabindex="-1">
          <button data-slot="dialog-dismiss">Close</button>
        </div>
      </div>
    </div>
    <button id="outside">outside</button>`
}

function alertMarkup(): void {
  document.body.innerHTML = `
    <div data-slot="alert-dialog">
      <button data-slot="alert-dialog-trigger" aria-expanded="false">Open</button>
      <div data-slot="alert-dialog-viewport" hidden>
        <div data-slot="alert-dialog-popup" role="alertdialog" aria-modal="true" tabindex="-1">
          <button data-slot="alert-dialog-dismiss">OK</button>
        </div>
      </div>
    </div>
    <button id="outside">outside</button>`
}

describe('enhanceDialog', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('opens on trigger click: shows viewport + backdrop, marks open, moves focus in', () => {
    dialogMarkup()
    enhanceDialog(document)
    const trigger = document.querySelector<HTMLElement>('[data-slot="dialog-trigger"]')!
    const viewport = document.querySelector<HTMLElement>('[data-slot="dialog-viewport"]')!
    const backdrop = document.querySelector<HTMLElement>('[data-slot="dialog-backdrop"]')!
    const popup = document.querySelector<HTMLElement>('[data-slot="dialog-popup"]')!

    trigger.click()
    expect(viewport.hidden).toBe(false)
    expect(backdrop.hidden).toBe(false)
    expect(popup.hasAttribute('data-open')).toBe(true)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    // jsdom has no layout, so focusFirst falls back to the popup container itself.
    expect(document.activeElement).toBe(popup)

    document.querySelector<HTMLElement>('[data-slot="dialog-dismiss"]')!.click() // teardown listeners
  })

  it('closes on Escape and restores focus to the trigger', () => {
    dialogMarkup()
    enhanceDialog(document)
    const trigger = document.querySelector<HTMLElement>('[data-slot="dialog-trigger"]')!
    const viewport = document.querySelector<HTMLElement>('[data-slot="dialog-viewport"]')!

    trigger.focus()
    trigger.click()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(viewport.hidden).toBe(true)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
  })

  it('closes when a dismiss control is clicked', () => {
    dialogMarkup()
    enhanceDialog(document)
    const trigger = document.querySelector<HTMLElement>('[data-slot="dialog-trigger"]')!
    const viewport = document.querySelector<HTMLElement>('[data-slot="dialog-viewport"]')!

    trigger.click()
    document.querySelector<HTMLElement>('[data-slot="dialog-dismiss"]')!.click()
    expect(viewport.hidden).toBe(true)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('a regular dialog dismisses on an outside pointer press', () => {
    dialogMarkup()
    enhanceDialog(document)
    const trigger = document.querySelector<HTMLElement>('[data-slot="dialog-trigger"]')!
    const viewport = document.querySelector<HTMLElement>('[data-slot="dialog-viewport"]')!

    trigger.click()
    document.getElementById('outside')!.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(viewport.hidden).toBe(true)
  })

  it('an alert dialog ignores outside presses but still closes on Escape', () => {
    alertMarkup()
    enhanceDialog(document)
    const trigger = document.querySelector<HTMLElement>('[data-slot="alert-dialog-trigger"]')!
    const viewport = document.querySelector<HTMLElement>('[data-slot="alert-dialog-viewport"]')!

    trigger.click()
    document.getElementById('outside')!.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(viewport.hidden).toBe(false) // outside press ignored

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(viewport.hidden).toBe(true)
  })
})
