// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Toggle } from '@/components/toggle'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Toggle accessibility (axe)', () => {
  it('default (not pressed) state is axe-clean', async () => {
    const { container } = render(<Toggle>Bold</Toggle>)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('pressed state is axe-clean', async () => {
    const { container } = render(<Toggle defaultPressed>Bold</Toggle>)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('icon-only with aria-label is axe-clean', async () => {
    const { container } = render(
      <Toggle aria-label="Bold">
        <svg viewBox="0 0 16 16" aria-hidden="true" />
      </Toggle>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('disabled state is axe-clean', async () => {
    const { container } = render(<Toggle disabled>Bold</Toggle>)
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Toggle name, role, and value', () => {
  it('exposes a pressable button named by its text content', () => {
    render(<Toggle>Bold</Toggle>)
    const control = screen.getByRole('button', { name: 'Bold' })
    expect(control).toHaveAttribute('aria-pressed', 'false')
  })

  it('reflects the pressed value via aria-pressed', async () => {
    const user = userEvent.setup()
    render(<Toggle>Bold</Toggle>)
    const control = screen.getByRole('button', { name: 'Bold' })

    expect(control).toHaveAttribute('aria-pressed', 'false')
    await user.click(control)
    expect(control).toHaveAttribute('aria-pressed', 'true')
  })

  it('takes its accessible name from aria-label when icon-only', () => {
    render(
      <Toggle aria-label="Bold">
        <svg viewBox="0 0 16 16" aria-hidden="true" />
      </Toggle>
    )
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument()
  })

  it('signals the pressed state by position and border, not color alone', () => {
    render(<Toggle>Bold</Toggle>)
    const control = screen.getByRole('button')
    // Content is nudged in on press (position cue) and the border switches to
    // the primary token, so pressed stays distinguishable when the fill color
    // is overridden in forced-colors mode.
    expect(control.className).toContain('data-[pressed]:[&_[data-slot=toggle-content]]:translate-y-px')
    expect(control.className).toContain('data-[pressed]:border-primary')
    // A visible border in every state keeps the control painted in WHCM.
    expect(control.className).toContain('border')
  })
})

describe('Toggle controlled and uncontrolled', () => {
  it('supports an uncontrolled defaultPressed toggle', async () => {
    const user = userEvent.setup()
    render(<Toggle defaultPressed>Bold</Toggle>)
    const control = screen.getByRole('button')

    expect(control).toHaveAttribute('aria-pressed', 'true')
    await user.click(control)
    expect(control).toHaveAttribute('aria-pressed', 'false')
  })

  it('supports a controlled toggle via pressed + onPressedChange', async () => {
    const user = userEvent.setup()
    const onPressedChange = vi.fn()

    function Controlled(): React.JSX.Element {
      const [on, setOn] = React.useState(false)
      return (
        <Toggle
          pressed={on}
          onPressedChange={(next) => {
            onPressedChange(next)
            setOn(next)
          }}
        >
          Bold
        </Toggle>
      )
    }

    render(<Controlled />)
    const control = screen.getByRole('button')

    expect(control).toHaveAttribute('aria-pressed', 'false')
    await user.click(control)
    expect(onPressedChange).toHaveBeenCalledWith(true)
    expect(control).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('Toggle keyboard contract', () => {
  it('Tab moves focus to the toggle', async () => {
    const user = userEvent.setup()
    render(<Toggle>Bold</Toggle>)

    await user.tab()
    expect(screen.getByRole('button')).toHaveFocus()
  })

  it('Space and Enter toggle the pressed state', async () => {
    const user = userEvent.setup()
    render(<Toggle>Bold</Toggle>)
    const control = screen.getByRole('button')

    await user.tab()
    expect(control).toHaveFocus()
    await user.keyboard(' ')
    expect(control).toHaveAttribute('aria-pressed', 'true')

    await user.keyboard('{Enter}')
    expect(control).toHaveAttribute('aria-pressed', 'false')
  })

  it('a disabled toggle is removed from the tab order and cannot toggle', async () => {
    const user = userEvent.setup()
    const onPressedChange = vi.fn()
    render(
      <Toggle disabled onPressedChange={onPressedChange}>
        Bold
      </Toggle>
    )

    await user.tab()
    expect(screen.getByRole('button')).not.toHaveFocus()
    await user.click(screen.getByRole('button'))
    expect(onPressedChange).not.toHaveBeenCalled()
  })
})

describe('Toggle dev guard', () => {
  it('warns in development when the toggle has no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <Toggle>
        <svg viewBox="0 0 16 16" aria-hidden="true" />
      </Toggle>
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })

  it('does not warn when a text label is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Toggle>Bold</Toggle>)
    expect(warn).not.toHaveBeenCalled()
  })

  it('does not warn when an aria-label is provided on an icon-only toggle', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <Toggle aria-label="Bold">
        <svg viewBox="0 0 16 16" aria-hidden="true" />
      </Toggle>
    )
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('Toggle RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <Toggle>عريض</Toggle>
      </div>
    )
    expect(screen.getByRole('button', { name: 'عريض' })).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
