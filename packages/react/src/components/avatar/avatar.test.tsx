// SPDX-License-Identifier: MIT

import { fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/components/avatar'
import { axeCheck } from '../../../test/setup.js'

describe('Avatar accessibility', () => {
  it('is axe-clean with visible identity text and a decorative image', async () => {
    const { container } = render(
      <div>
        <Avatar>
          <AvatarImage src="/maya.jpg" alt="" />
          <AvatarFallback>MC</AvatarFallback>
        </Avatar>
        <span>Maya Chen</span>
      </div>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean as a labelled group with a localized overflow count in RTL', async () => {
    const { container } = render(
      <div dir="rtl">
        <AvatarGroup ariaLabel="فريق الخدمة">
          <Avatar><AvatarFallback>سن</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>مخ</AvatarFallback></Avatar>
          <AvatarGroupCount count={3} label="ثلاثة أشخاص آخرين" />
        </AvatarGroup>
      </div>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Avatar contract', () => {
  it('renders a neutral span, fallback, size, attributes, custom classes, and ref', () => {
    const ref = React.createRef<HTMLSpanElement>()
    render(
      <Avatar ref={ref} size="lg" lang="es" className="custom-avatar">
        <AvatarFallback>AM</AvatarFallback>
      </Avatar>
    )

    expect(ref.current?.tagName).toBe('SPAN')
    expect(ref.current).not.toHaveAttribute('role')
    expect(ref.current).toHaveAttribute('data-slot', 'avatar')
    expect(ref.current).toHaveAttribute('data-size', 'lg')
    expect(ref.current).toHaveAttribute('lang', 'es')
    expect(ref.current).toHaveClass('custom-avatar', 'size-6')
    expect(screen.getByText('AM')).toHaveAttribute('data-slot', 'avatar-fallback')
    expect(screen.getByText('AM')).toHaveClass('items-center', 'justify-center', 'leading-none')
  })

  it('forwards required image alt text and loading state callbacks', async () => {
    const OriginalImage = window.Image
    class LoadedImage {
      complete = true
      naturalWidth = 64
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      referrerPolicy = ''
      crossOrigin: string | null = null
      sizes = ''
      srcset = ''

      set src(_value: string) {
        queueMicrotask(() => this.onload?.())
      }
    }
    Object.defineProperty(window, 'Image', {
      configurable: true,
      value: LoadedImage,
    })
    const statuses: string[] = []
    try {
      render(
        <Avatar>
          <AvatarImage
            src="/alex.jpg"
            alt="Alex Morgan"
            onLoadingStatusChange={(status) => statuses.push(status)}
          />
          <AvatarFallback>AM</AvatarFallback>
        </Avatar>
      )

      const image = await screen.findByAltText('Alex Morgan')
      expect(image).toHaveAttribute('data-slot', 'avatar-image')
      fireEvent.load(image)
      expect(statuses.at(-1)).toBe('loaded')
    } finally {
      Object.defineProperty(window, 'Image', {
        configurable: true,
        value: OriginalImage,
      })
    }
  })

  it('hides a decorative badge and names a meaningful badge', () => {
    const { rerender } = render(
      <Avatar><AvatarFallback>MC</AvatarFallback><AvatarBadge data-testid="badge" /></Avatar>
    )
    expect(screen.getByTestId('badge')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByTestId('badge')).not.toHaveAttribute('role')
    expect(screen.getByTestId('badge')).toHaveClass('bottom-0', 'end-0')
    expect(screen.getByTestId('badge')).not.toHaveClass('-bottom-0', '-end-0')

    rerender(
      <Avatar>
        <AvatarFallback>MC</AvatarFallback>
        <AvatarBadge label="Available" data-testid="badge" />
      </Avatar>
    )
    expect(screen.getByRole('img', { name: 'Available' })).toBeInTheDocument()
  })

  it('lets native aria-label passthrough override convenience labels', () => {
    render(
      <AvatarGroup ariaLabel="Team" aria-label="Permit reviewers">
        <Avatar><AvatarFallback>MC</AvatarFallback><AvatarBadge label="Online" aria-label="Available" /></Avatar>
        <AvatarGroupCount count={2} label="Two more" aria-label="Two additional reviewers" />
      </AvatarGroup>
    )
    expect(screen.getByRole('group', { name: 'Permit reviewers' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Available' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Two additional reviewers' })).toBeInTheDocument()
  })

  it('adds group semantics only when they provide useful context', () => {
    const { rerender } = render(<AvatarGroup data-testid="group" />)
    expect(screen.getByTestId('group')).not.toHaveAttribute('role')
    expect(screen.getByTestId('group')).toHaveClass('flex', 'items-center')

    rerender(<AvatarGroup ariaLabel="Permit reviewers" data-testid="group" />)
    expect(screen.getByRole('group', { name: 'Permit reviewers' })).toBeInTheDocument()
  })

  it('shows an overflow count while announcing a natural-language label', () => {
    render(<AvatarGroupCount count={7} />)
    const count = screen.getByRole('img', { name: '7 more people' })
    expect(count).toHaveTextContent('+7')
    expect(count.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })

  it.each([0, -1, 1.5, Number.NaN])('rejects invalid group count %s', (count) => {
    expect(() => render(<AvatarGroupCount count={count} />)).toThrow(/positive integer/)
  })
})
