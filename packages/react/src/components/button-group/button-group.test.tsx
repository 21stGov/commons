// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/button'
import { ButtonGroup } from '@/components/button-group'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

/** A chevron-only trigger used to model the split-button menu control. */
function ChevronTrigger(props: { 'aria-label': string }): React.JSX.Element {
  return (
    <Button variant="primary" aria-label={props['aria-label']}>
      <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </Button>
  )
}

describe('ButtonGroup accessibility (axe)', () => {
  it('horizontal group is axe-clean', async () => {
    const { container } = render(
      <ButtonGroup aria-label="Text formatting">
        <Button variant="outline">Bold</Button>
        <Button variant="outline">Italic</Button>
        <Button variant="outline">Underline</Button>
      </ButtonGroup>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('vertical group is axe-clean', async () => {
    const { container } = render(
      <ButtonGroup aria-label="View options" orientation="vertical">
        <Button variant="outline">List</Button>
        <Button variant="outline">Grid</Button>
        <Button variant="outline">Map</Button>
      </ButtonGroup>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('split-button demo (primary action + chevron trigger) is axe-clean', async () => {
    const { container } = render(
      <ButtonGroup aria-label="Save options">
        <Button variant="primary">Save</Button>
        <ChevronTrigger aria-label="More save options" />
      </ButtonGroup>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('ButtonGroup role and name', () => {
  it('exposes role=group named by aria-label', () => {
    render(
      <ButtonGroup aria-label="Text formatting">
        <Button variant="outline">Bold</Button>
        <Button variant="outline">Italic</Button>
      </ButtonGroup>
    )
    expect(screen.getByRole('group', { name: 'Text formatting' })).toBeInTheDocument()
  })

  it('supports aria-labelledby instead of aria-label', () => {
    render(
      <>
        <h2 id="fmt-heading">Text formatting</h2>
        <ButtonGroup aria-labelledby="fmt-heading">
          <Button variant="outline">Bold</Button>
          <Button variant="outline">Italic</Button>
        </ButtonGroup>
      </>
    )
    expect(screen.getByRole('group', { name: 'Text formatting' })).toBeInTheDocument()
  })

  it('sets data-slot and data-orientation on the container', () => {
    render(
      <ButtonGroup aria-label="Text formatting" orientation="vertical">
        <Button variant="outline">Bold</Button>
      </ButtonGroup>
    )
    const group = screen.getByRole('group', { name: 'Text formatting' })
    expect(group).toHaveAttribute('data-slot', 'button-group')
    expect(group).toHaveAttribute('data-orientation', 'vertical')
  })

  it('defaults data-orientation to horizontal when unset', () => {
    render(
      <ButtonGroup aria-label="Text formatting">
        <Button variant="outline">Bold</Button>
      </ButtonGroup>
    )
    expect(screen.getByRole('group', { name: 'Text formatting' })).toHaveAttribute(
      'data-orientation',
      'horizontal'
    )
  })

  it('warns once in development when neither aria-label nor aria-labelledby is set', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <ButtonGroup>
        <Button variant="outline">Bold</Button>
      </ButtonGroup>
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('requires an `aria-label`'))
  })

  it('does not warn when aria-label is present', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <ButtonGroup aria-label="Text formatting">
        <Button variant="outline">Bold</Button>
      </ButtonGroup>
    )
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('ButtonGroup outer-corner rounding', () => {
  it('applies the horizontal seam-collapse classes to the container', () => {
    render(
      <ButtonGroup aria-label="Text formatting">
        <Button variant="outline">Bold</Button>
        <Button variant="outline">Italic</Button>
      </ButtonGroup>
    )
    const group = screen.getByRole('group', { name: 'Text formatting' })
    expect(group.className).toContain('flex-row')
    expect(group.className).toContain('[&>*:first-child]:rounded-s-sm!')
    expect(group.className).toContain('[&>*:last-child]:rounded-e-sm!')
  })

  it('applies the vertical seam-collapse classes to the container', () => {
    render(
      <ButtonGroup aria-label="View options" orientation="vertical">
        <Button variant="outline">List</Button>
        <Button variant="outline">Grid</Button>
      </ButtonGroup>
    )
    const group = screen.getByRole('group', { name: 'View options' })
    expect(group.className).toContain('flex-col')
    expect(group.className).toContain('[&>*:first-child]:rounded-t-sm!')
    expect(group.className).toContain('[&>*:last-child]:rounded-b-sm!')
  })
})

describe('ButtonGroup keyboard contract', () => {
  it('is normal Tab order — each button is independently tabbable and focusable (no roving tabindex)', async () => {
    const user = userEvent.setup()
    render(
      <ButtonGroup aria-label="Text formatting">
        <Button variant="outline">Bold</Button>
        <Button variant="outline">Italic</Button>
        <Button variant="outline">Underline</Button>
      </ButtonGroup>
    )
    const [bold, italic, underline] = screen.getAllByRole('button')

    await user.tab()
    expect(bold).toHaveFocus()
    expect(bold).not.toHaveAttribute('tabindex', '-1')

    await user.tab()
    expect(italic).toHaveFocus()
    expect(italic).not.toHaveAttribute('tabindex', '-1')

    await user.tab()
    expect(underline).toHaveFocus()
    expect(underline).not.toHaveAttribute('tabindex', '-1')
  })

  it('each button keeps its own accessible name and activates independently', async () => {
    const user = userEvent.setup()
    const onBold = vi.fn()
    const onItalic = vi.fn()
    render(
      <ButtonGroup aria-label="Text formatting">
        <Button variant="outline" onClick={onBold}>
          Bold
        </Button>
        <Button variant="outline" onClick={onItalic}>
          Italic
        </Button>
      </ButtonGroup>
    )

    await user.click(screen.getByRole('button', { name: 'Bold' }))
    expect(onBold).toHaveBeenCalledTimes(1)
    expect(onItalic).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Italic' }))
    expect(onItalic).toHaveBeenCalledTimes(1)
  })

  it('split-button: primary action and chevron trigger are independently focusable and named', async () => {
    const user = userEvent.setup()
    render(
      <ButtonGroup aria-label="Save options">
        <Button variant="primary">Save</Button>
        <ChevronTrigger aria-label="More save options" />
      </ButtonGroup>
    )

    const save = screen.getByRole('button', { name: 'Save' })
    const more = screen.getByRole('button', { name: 'More save options' })

    await user.tab()
    expect(save).toHaveFocus()
    await user.tab()
    expect(more).toHaveFocus()
  })
})

describe('ButtonGroup RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <ButtonGroup aria-label="تنسيق النص">
          <Button variant="outline">غامق</Button>
          <Button variant="outline">مائل</Button>
        </ButtonGroup>
      </div>
    )
    expect(
      screen.getByRole('group', { name: 'تنسيق النص' })
    ).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
