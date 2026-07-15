// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceSwitch } from './switch.ts'

function switchMarkup(checked = false, disabled = false): void {
  document.body.innerHTML = `
    <div data-slot="switch">
      <span data-slot="switch-control-box">
        <span data-slot="switch-track" role="switch" tabindex="0"></span>
        <span data-slot="switch-thumb"></span>
        <input type="checkbox" id="s1"${checked ? ' checked' : ''}${disabled ? ' disabled' : ''} />
      </span>
      <label data-slot="switch-label" for="s1">On</label>
    </div>`
}

describe('enhanceSwitch', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('reflects the initial checked state onto the track and thumb', () => {
    switchMarkup(true)
    enhanceSwitch(document)
    const track = document.querySelector<HTMLElement>('[data-slot="switch-track"]')!
    const thumb = document.querySelector<HTMLElement>('[data-slot="switch-thumb"]')!
    expect(track.getAttribute('aria-checked')).toBe('true')
    expect(track.hasAttribute('data-checked')).toBe(true)
    expect(thumb.hasAttribute('data-checked')).toBe(true)
  })

  it('toggles the native input and mirrors state when the track is clicked', () => {
    switchMarkup(false)
    enhanceSwitch(document)
    const track = document.querySelector<HTMLElement>('[data-slot="switch-track"]')!
    const input = document.querySelector<HTMLInputElement>('input')!
    track.click()
    expect(input.checked).toBe(true)
    expect(track.getAttribute('aria-checked')).toBe('true')
    track.click()
    expect(input.checked).toBe(false)
    expect(track.getAttribute('aria-checked')).toBe('false')
  })

  it('toggles on Space and Enter from the track', () => {
    switchMarkup(false)
    enhanceSwitch(document)
    const track = document.querySelector<HTMLElement>('[data-slot="switch-track"]')!
    const input = document.querySelector<HTMLInputElement>('input')!
    track.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
    expect(input.checked).toBe(true)
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(input.checked).toBe(false)
  })

  it('mirrors external input changes (e.g. the label toggling it)', () => {
    switchMarkup(false)
    enhanceSwitch(document)
    const track = document.querySelector<HTMLElement>('[data-slot="switch-track"]')!
    const input = document.querySelector<HTMLInputElement>('input')!
    input.checked = true
    input.dispatchEvent(new Event('change', { bubbles: true }))
    expect(track.getAttribute('aria-checked')).toBe('true')
  })

  it('does not toggle when the input is disabled', () => {
    switchMarkup(false, true)
    enhanceSwitch(document)
    const track = document.querySelector<HTMLElement>('[data-slot="switch-track"]')!
    const input = document.querySelector<HTMLInputElement>('input')!
    track.click()
    expect(input.checked).toBe(false)
  })
})
