// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { enhanceCommandPalette } from './commandpalette.ts'

function paletteMarkup(): void {
  document.body.innerHTML = `
    <div data-slot="command-palette-root">
      <button data-slot="command-palette-trigger" aria-expanded="false">Open</button>
      <div data-slot="command-palette-backdrop" hidden></div>
      <div data-slot="command-palette-viewport" hidden>
        <div data-slot="command-palette" role="dialog" aria-modal="true">
          <input data-slot="command-palette-input" role="combobox" />
          <div data-slot="command-palette-list" role="listbox">
            <div data-slot="command-palette-group">
              <div id="c1" data-slot="command-palette-item" role="option" data-label="New file" data-keywords="create">New file</div>
              <div id="c2" data-slot="command-palette-item" role="option" data-label="Open file" data-keywords="load">Open file</div>
            </div>
          </div>
          <div data-slot="command-palette-empty" hidden>No results</div>
        </div>
      </div>
    </div>`
}
const trigger = () => document.querySelector<HTMLElement>('[data-slot="command-palette-trigger"]')!
const viewport = () => document.querySelector<HTMLElement>('[data-slot="command-palette-viewport"]')!
const backdrop = () => document.querySelector<HTMLElement>('[data-slot="command-palette-backdrop"]')!
const input = () => document.querySelector<HTMLInputElement>('[data-slot="command-palette-input"]')!
const empty = () => document.querySelector<HTMLElement>('[data-slot="command-palette-empty"]')!
const c1 = () => document.getElementById('c1')!
const c2 = () => document.getElementById('c2')!

function type(value: string): void {
  input().value = value
  input().dispatchEvent(new Event('input', { bubbles: true }))
}

describe('enhanceCommandPalette', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('opens as a modal on the trigger, focuses the input, and highlights the first item', () => {
    paletteMarkup()
    enhanceCommandPalette(document)
    trigger().click()
    expect(viewport().hidden).toBe(false)
    expect(backdrop().hidden).toBe(false)
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(input())
    expect(c1().hasAttribute('data-highlighted')).toBe(true)
    expect(input().getAttribute('aria-activedescendant')).toBe('c1')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })) // leave closed
  })

  it('filters items by label + keywords and hides the emptied group', () => {
    paletteMarkup()
    enhanceCommandPalette(document)
    trigger().click()
    type('open')
    expect(c1().hidden).toBe(true)
    expect(c2().hidden).toBe(false)
    expect(empty().hidden).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  })

  it('shows the empty state when nothing matches', () => {
    paletteMarkup()
    enhanceCommandPalette(document)
    trigger().click()
    type('zzz')
    expect(empty().hidden).toBe(false)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  })

  it('ArrowDown moves the highlight and Enter runs the command, then closes', () => {
    paletteMarkup()
    enhanceCommandPalette(document)
    const ran = vi.fn()
    document.addEventListener('cui:command', ran)
    trigger().click()
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })) // c1 → c2
    expect(c2().hasAttribute('data-highlighted')).toBe(true)
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(ran).toHaveBeenCalledTimes(1)
    expect(viewport().hidden).toBe(true)
    document.removeEventListener('cui:command', ran)
  })

  it('Cmd/Ctrl-K toggles the palette open and closed', () => {
    paletteMarkup()
    enhanceCommandPalette(document)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
    expect(viewport().hidden).toBe(false)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
    expect(viewport().hidden).toBe(true)
  })
})
