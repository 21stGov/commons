// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import { ThemeImage } from '@/components/theme-image'
import { axeCheck } from '../../../test/setup.js'

function imgs(container: HTMLElement): HTMLImageElement[] {
  return [...container.querySelectorAll<HTMLImageElement>('[data-slot="theme-image"]')]
}

describe('ThemeImage', () => {
  it('renders one variant per theme with the matching source', () => {
    const { container } = render(
      <ThemeImage light="/seal-color.svg" dark="/seal-white.svg" highContrast="/seal-black.svg" />
    )
    const [light, dark, hc] = imgs(container)
    expect(light).toHaveClass('cui-theme-image', 'cui-theme-image--light')
    expect(light).toHaveAttribute('src', '/seal-color.svg')
    expect(dark).toHaveClass('cui-theme-image', 'cui-theme-image--dark')
    expect(dark).toHaveAttribute('src', '/seal-white.svg')
    expect(hc).toHaveClass('cui-theme-image', 'cui-theme-image--high-contrast')
    expect(hc).toHaveAttribute('src', '/seal-black.svg')
  })

  it('falls back: dark reuses light; high contrast reuses dark, then light', () => {
    const { container } = render(<ThemeImage light="/only.svg" />)
    for (const img of imgs(container)) expect(img).toHaveAttribute('src', '/only.svg')

    const { container: withDark } = render(<ThemeImage light="/l.svg" dark="/d.svg" />)
    const [, dark, hc] = imgs(withDark)
    expect(dark).toHaveAttribute('src', '/d.svg')
    // High contrast is light-based, but without an explicit source the safest
    // documented fallback chain is dark → light.
    expect(hc).toHaveAttribute('src', '/d.svg')
  })

  it('is decorative by default and repeats a real alt on every variant', () => {
    const { container } = render(<ThemeImage light="/seal.svg" />)
    for (const img of imgs(container)) expect(img).toHaveAttribute('alt', '')

    const { container: named } = render(<ThemeImage light="/seal.svg" alt="Town of Springfield seal" />)
    for (const img of imgs(named)) expect(img).toHaveAttribute('alt', 'Town of Springfield seal')
  })

  it('spreads consumer classes and attributes onto every variant', () => {
    const { container } = render(
      <ThemeImage light="/seal.svg" className="size-4" loading="lazy" data-testid="seal" />
    )
    for (const img of imgs(container)) {
      expect(img).toHaveClass('size-4')
      expect(img).toHaveAttribute('loading', 'lazy')
      expect(img).toHaveAttribute('data-testid', 'seal')
    }
  })

  it('is never a tab stop — an image carries no interaction (keyboard contract)', async () => {
    const user = userEvent.setup()
    render(
      <>
        <button>Before</button>
        <ThemeImage light="/seal.svg" alt="Town seal" />
        <button>After</button>
      </>
    )
    screen.getByRole('button', { name: 'Before' }).focus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus()
  })

  it('is axe-clean, decorative and named', async () => {
    const { container } = render(
      <div>
        <ThemeImage light="/decorative.svg" />
        <ThemeImage light="/seal.svg" alt="Town seal" />
      </div>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
