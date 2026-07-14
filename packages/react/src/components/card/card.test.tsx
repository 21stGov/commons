// SPDX-License-Identifier: MIT

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardGroup,
  CardHeader,
  CardItem,
  CardMedia,
  CardTitle,
} from '@/components/card'
import { axeCheck } from '../../../test/setup.js'

function CivicCard({ title = 'Building permits' }: { title?: string }): React.JSX.Element {
  return (
    <CardItem>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Applications, inspections, and status.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Start or continue a residential permit application.</p>
        </CardContent>
        <CardFooter>
          <a href="/permits">View permit services</a>
        </CardFooter>
      </Card>
    </CardItem>
  )
}

describe('Card accessibility', () => {
  it('is axe-clean as a real list of related cards', async () => {
    const { container } = render(
      <CardGroup aria-label="Popular services">
        <CivicCard />
        <CivicCard title="Trash and recycling" />
      </CardGroup>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean with informative media and actions', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Community meeting</CardTitle>
          <CardDescription>Tuesday at 6 p.m.</CardDescription>
          <CardAction><button type="button">Save event</button></CardAction>
        </CardHeader>
        <CardMedia><img src="/meeting.jpg" alt="Residents in the council chamber" /></CardMedia>
        <CardContent>Agenda and accessibility information.</CardContent>
      </Card>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean in an RTL horizontal layout', async () => {
    const { container } = render(
      <div dir="rtl">
        <Card orientation="horizontal" mediaPosition="end">
          <CardHeader><CardTitle>خدمات المجتمع</CardTitle></CardHeader>
          <CardMedia><div>صورة</div></CardMedia>
          <CardContent>معلومات الخدمة المحلية</CardContent>
          <CardFooter><a href="/ar/services">عرض الخدمة</a></CardFooter>
        </Card>
      </div>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Card structure', () => {
  it('keeps the root neutral and forwards attributes, class, style, and ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <Card ref={ref} size="sm" lang="es" className="custom-card" style={{ opacity: 0.8 }}>
        Contenido
      </Card>
    )
    expect(ref.current?.tagName).toBe('DIV')
    expect(ref.current).not.toHaveAttribute('role')
    expect(ref.current).toHaveAttribute('data-slot', 'card')
    expect(ref.current).toHaveAttribute('data-size', 'sm')
    expect(ref.current).toHaveAttribute('lang', 'es')
    expect(ref.current).toHaveClass('custom-card', 'flex-col')
    expect(ref.current).toHaveStyle({ opacity: '0.8' })
    expect(ref.current?.style.getPropertyValue('--card-padding')).toBe('var(--cui-spacing-105)')
  })

  it('uses a semantic unindented list and list items for collections', () => {
    render(
      <CardGroup columns="two">
        <CivicCard />
        <CivicCard />
      </CardGroup>
    )
    const list = screen.getByRole('list')
    expect(list.tagName).toBe('UL')
    expect(list).toHaveClass('grid', 'sm:grid-cols-2', 'list-none', 'p-0')
    expect(list).toHaveStyle({ paddingInlineStart: '0' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
  })

  it('renders the requested heading level', () => {
    render(<CardTitle headingLevel="h4">Service details</CardTitle>)
    expect(screen.getByRole('heading', { level: 4, name: 'Service details' })).toHaveAttribute(
      'data-slot',
      'card-title'
    )
  })

  it('places header, content, footer, and media in logical grid columns for flag cards', () => {
    const { rerender } = render(
      <Card orientation="horizontal" mediaPosition="start">
        <CardHeader data-testid="header"><CardTitle>Title</CardTitle></CardHeader>
        <CardMedia data-testid="media" />
        <CardContent data-testid="content">Content</CardContent>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>
    )
    expect(screen.getByTestId('media')).toHaveClass('sm:col-start-1', 'sm:row-end-4')
    expect(screen.getByTestId('header')).toHaveClass('sm:col-start-2', 'sm:row-start-1')
    expect(screen.getByTestId('content')).toHaveClass('sm:col-start-2', 'sm:row-start-2')
    expect(screen.getByTestId('footer')).toHaveClass('sm:col-start-2', 'sm:row-start-3')

    rerender(
      <Card orientation="horizontal" mediaPosition="end">
        <CardHeader data-testid="header"><CardTitle>Title</CardTitle></CardHeader>
        <CardMedia data-testid="media" />
        <CardContent data-testid="content">Content</CardContent>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>
    )
    expect(screen.getByTestId('media')).toHaveClass('sm:col-start-2')
    expect(screen.getByTestId('header')).toHaveClass('sm:col-start-1')
  })

  it('supports inset media without inventing image semantics', () => {
    render(<CardMedia inset data-testid="media"><span>Map preview</span></CardMedia>)
    const media = screen.getByTestId('media')
    expect(media).toHaveAttribute('data-inset', '')
    expect(media).toHaveClass('m-[var(--card-padding)]', 'rounded-sm')
    expect(media).not.toHaveAttribute('role')
  })
})

describe('Card interaction ownership', () => {
  it('adds no card-level tab stop and preserves descendant keyboard order', async () => {
    const user = userEvent.setup()
    const action = vi.fn()
    render(
      <Card>
        <CardHeader><CardTitle>Permit</CardTitle></CardHeader>
        <CardContent><a href="/details">View details</a></CardContent>
        <CardFooter><button type="button" onClick={action}>Save</button></CardFooter>
      </Card>
    )
    await user.tab()
    expect(screen.getByRole('link', { name: 'View details' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(action).toHaveBeenCalledOnce()
  })
})
