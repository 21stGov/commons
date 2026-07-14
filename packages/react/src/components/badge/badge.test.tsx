// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Badge, RemovableTag, Tag } from '@/components/badge'
import { axeCheck } from '../../../test/setup.js'

describe('Badge accessibility', () => {
  it.each(['neutral', 'primary', 'info', 'success', 'warning', 'error', 'outline'] as const)(
    'variant %s is axe-clean with visible meaning',
    async (variant) => {
      const { container } = render(<Badge variant={variant}>Application received</Badge>)
      expect(await axeCheck(container)).toHaveNoViolations()
    }
  )

  it('renders in RTL without adding interaction', async () => {
    const { container } = render(
      <div dir="rtl"><Badge variant="success">مكتمل</Badge></div>
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Badge contract', () => {
  it('is a neutral span with variant, size, custom attributes, class, and ref', () => {
    const ref = React.createRef<HTMLSpanElement>()
    render(
      <Badge ref={ref} variant="info" size="lg" lang="es" className="custom-badge">
        En revisión
      </Badge>
    )
    expect(ref.current?.tagName).toBe('SPAN')
    expect(ref.current).not.toHaveAttribute('role')
    expect(ref.current).not.toHaveAttribute('tabindex')
    expect(ref.current).toHaveAttribute('data-slot', 'badge')
    expect(ref.current).toHaveAttribute('data-variant', 'info')
    expect(ref.current).toHaveAttribute('data-size', 'lg')
    expect(ref.current).toHaveAttribute('lang', 'es')
    expect(ref.current).toHaveClass('custom-badge', 'bg-info', 'text-base')
  })
})

describe('Tag contract', () => {
  it('stays visually and programmatically non-interactive', () => {
    render(<Tag data-testid="tag">Permits</Tag>)
    const tag = screen.getByTestId('tag')
    expect(tag.tagName).toBe('SPAN')
    expect(tag).not.toHaveAttribute('role')
    expect(tag).not.toHaveAttribute('tabindex')
    expect(tag.className).not.toMatch(/hover:|focus:|active:/)
  })

  it('supports the larger USWDS-style emphasis size', () => {
    render(<Tag size="big" data-testid="tag">New</Tag>)
    expect(screen.getByTestId('tag')).toHaveClass('min-h-5', 'text-base')
  })

  it('optically centers badge and tag text without moving their outer geometry', () => {
    render(<><Badge>Draft</Badge><Tag>Permits</Tag></>)
    expect(screen.getByText('Draft')).toHaveAttribute('data-slot', 'badge-label')
    expect(screen.getByText('Draft')).toHaveClass('[inset-block-start:0.0625em]')
    expect(screen.getByText('Permits')).toHaveAttribute('data-slot', 'tag-label')
    expect(screen.getByText('Permits')).toHaveClass('[inset-block-start:0.0625em]')
  })
})

describe('RemovableTag', () => {
  it('is axe-clean with a visible label and named remove button', async () => {
    const { container } = render(<RemovableTag label="Open data" />)
    expect(screen.getByRole('button', { name: 'Remove Open data' })).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('uses a native 44px button and activates with pointer, Enter, and Space', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(<RemovableTag label="Road closures" onRemove={onRemove} />)
    const button = screen.getByRole('button', { name: 'Remove Road closures' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('min-h-11', 'min-w-11')

    await user.click(button)
    button.focus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    expect(onRemove).toHaveBeenCalledTimes(3)
  })

  it('accepts a localized button name and forwards root attributes and ref', () => {
    const ref = React.createRef<HTMLSpanElement>()
    render(
      <RemovableTag
        ref={ref}
        label="تصاريح"
        removeLabel="إزالة تصاريح"
        dir="rtl"
        className="custom-token"
      />
    )
    expect(ref.current).toHaveAttribute('dir', 'rtl')
    expect(ref.current).toHaveClass('custom-token', 'ps-2')
    expect(screen.getByText('تصاريح')).toHaveClass('[inset-block-start:0.0625em]')
    expect(screen.getByRole('button', { name: 'إزالة تصاريح' })).toBeInTheDocument()
  })

  it('suppresses removal while disabled', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(<RemovableTag label="Archived" disabled onRemove={onRemove} />)
    const button = screen.getByRole('button', { name: 'Remove Archived' })
    expect(button).toBeDisabled()
    await user.click(button)
    expect(onRemove).not.toHaveBeenCalled()
  })
})
