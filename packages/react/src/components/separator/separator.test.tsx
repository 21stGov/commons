// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Separator } from '@/components/separator'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Separator accessibility (axe)', () => {
  it('is axe-clean horizontal, vertical, and decorative', async () => {
    const { container } = render(
      <div>
        <Separator />
        <div className="flex h-6">
          <span>a</span>
          <Separator orientation="vertical" />
          <span>b</span>
        </div>
        <Separator decorative />
      </div>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Separator name, role, and value', () => {
  it('exposes role=separator with aria-orientation=horizontal by default', () => {
    render(<Separator />)
    const sep = screen.getByRole('separator')
    expect(sep).toHaveAttribute('aria-orientation', 'horizontal')
    // Block-axis padding for breathing room; the rule is a full-width top
    // border on the centered ::before (margins are inert under the reset).
    expect(sep).toHaveClass('w-full', 'py-2', 'before:border-t')
  })

  it('sets aria-orientation=vertical when vertical', () => {
    render(<Separator orientation="vertical" />)
    const sep = screen.getByRole('separator')
    expect(sep).toHaveAttribute('aria-orientation', 'vertical')
    // Inline-axis padding; the rule is a start border on the ::before.
    expect(sep).toHaveClass('self-stretch', 'px-2', 'before:border-s')
  })

  it('is hidden from assistive tech and exposes no role when decorative', () => {
    const { container } = render(<Separator decorative data-testid="rule" />)
    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
    const sep = container.querySelector('[data-testid="rule"]')
    expect(sep).toHaveAttribute('aria-hidden', 'true')
    expect(sep).not.toHaveAttribute('role')
    expect(sep).not.toHaveAttribute('aria-orientation')
  })
})

describe('Separator keyboard contract', () => {
  it('is not focusable (a separator carries no interaction)', async () => {
    const user = userEvent.setup()
    render(
      <>
        <button type="button">Before</button>
        <Separator />
        <button type="button">After</button>
      </>
    )

    screen.getByRole('button', { name: 'Before' }).focus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus()
    expect(screen.getByRole('separator')).not.toHaveFocus()
  })
})

describe('Separator RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <span>قبل</span>
        <Separator orientation="vertical" />
        <span>بعد</span>
      </div>
    )
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
