// SPDX-License-Identifier: MIT

/**
 * Input OTP behavior — one-time-code entry across single-character cells.
 *
 * Works on the component's own markup: each `[data-slot="input-otp-cell"]` inside
 * an `[data-slot="input-otp-group"]` is forced to one character; typing a digit
 * advances to the next cell, Backspace on an empty cell steps back, Arrow keys
 * move, and a paste distributes digits across the cells.
 */

import { all, claim } from './dom.ts'

export function enhanceInputOTP(root: ParentNode): void {
  for (const group of claim(root, '[data-slot="input-otp-group"]', 'input-otp')) {
    const cells = all<HTMLInputElement>(group, 'input[data-slot="input-otp-cell"]')
    if (cells.length === 0) continue

    cells.forEach((cell, i) => {
      cell.maxLength = 1
      cell.addEventListener('input', () => {
        if (cell.value.length > 1) cell.value = cell.value.slice(-1)
        if (cell.value && i < cells.length - 1) cells[i + 1]!.focus()
      })
      cell.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace' && cell.value === '' && i > 0) {
          cells[i - 1]!.focus()
        } else if (event.key === 'ArrowLeft' && i > 0) {
          event.preventDefault()
          cells[i - 1]!.focus()
        } else if (event.key === 'ArrowRight' && i < cells.length - 1) {
          event.preventDefault()
          cells[i + 1]!.focus()
        }
      })
      cell.addEventListener('paste', (event) => {
        event.preventDefault()
        const digits = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '')
        for (let j = 0; j < digits.length && i + j < cells.length; j++) cells[i + j]!.value = digits[j]!
        cells[Math.min(i + digits.length, cells.length - 1)]!.focus()
      })
    })
  }
}
