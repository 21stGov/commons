// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/item'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

function SettingsRow(): React.JSX.Element {
  return (
    <Item>
      <ItemMedia>
        <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Email notifications</ItemTitle>
        <ItemDescription>Sends a daily digest at 8am.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <button type="button">Configure</button>
      </ItemActions>
    </Item>
  )
}

describe('Item accessibility (axe)', () => {
  it('default settings row is axe-clean', async () => {
    const { container } = render(<SettingsRow />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('outline surface is axe-clean', async () => {
    const { container } = render(
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Outlined row</ItemTitle>
        </ItemContent>
      </Item>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('muted surface is axe-clean', async () => {
    const { container } = render(
      <Item variant="muted">
        <ItemContent>
          <ItemTitle>Muted row</ItemTitle>
        </ItemContent>
      </Item>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('media row with an avatar image is axe-clean', async () => {
    const { container } = render(
      <Item>
        <ItemMedia>
          <img src="/avatar.png" alt="Jordan Rivera" width={40} height={40} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Jordan Rivera</ItemTitle>
          <ItemDescription>Public Works Department</ItemDescription>
        </ItemContent>
        <ItemActions>
          <button type="button">Message</button>
        </ItemActions>
      </Item>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('grouped list (role=list) is axe-clean', async () => {
    const { container } = render(
      <ItemGroup variant="divided" role="list" aria-label="Departments">
        <Item role="listitem">
          <ItemContent>
            <ItemTitle>Parks & Recreation</ItemTitle>
          </ItemContent>
        </Item>
        <Item role="listitem">
          <ItemContent>
            <ItemTitle>Public Works</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('interactive whole-row (single link) is axe-clean', async () => {
    const { container } = render(
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>
            <a href="/services/permits">Apply for a permit</a>
          </ItemTitle>
          <ItemDescription>Building, electrical, and plumbing permits.</ItemDescription>
        </ItemContent>
      </Item>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Item structure and slots', () => {
  it('marks every structural element with a data-slot', () => {
    const { container } = render(<SettingsRow />)
    expect(container.querySelector('[data-slot="item"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="item-media"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="item-content"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="item-title"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="item-description"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="item-actions"]')).toBeInTheDocument()
  })

  it('adds no role or accessible name to the root by default', () => {
    const { container } = render(
      <Item>
        <ItemContent>
          <ItemTitle>Plain</ItemTitle>
        </ItemContent>
      </Item>
    )
    const root = container.querySelector('[data-slot="item"]')
    expect(root).not.toHaveAttribute('role')
    expect(root).not.toHaveAttribute('aria-label')
  })

  it('pins actions to the inline end with a logical margin', () => {
    const { container } = render(<SettingsRow />)
    expect(container.querySelector('[data-slot="item-actions"]')?.className).toContain('ms-auto')
  })

  it('aligns media to the first line', () => {
    const { container } = render(<SettingsRow />)
    expect(container.querySelector('[data-slot="item-media"]')?.className).toContain('self-start')
  })

  it('lets the content column flex and shrink', () => {
    const { container } = render(<SettingsRow />)
    const content = container.querySelector('[data-slot="item-content"]')
    expect(content?.className).toContain('flex-1')
    expect(content?.className).toContain('min-w-0')
  })
})

describe('Item variants (forced-colors safety)', () => {
  it('keeps a visible border on the outline surface', () => {
    const { container } = render(<Item variant="outline">Row</Item>)
    const root = container.querySelector('[data-slot="item"]')
    expect(root).toHaveAttribute('data-variant', 'outline')
    expect(root?.className).toContain('border-border')
    expect(root?.className).toContain('forced-colors:border-[CanvasText]')
  })

  it('keeps a border on the muted surface so it is not color-only', () => {
    const { container } = render(<Item variant="muted">Row</Item>)
    const root = container.querySelector('[data-slot="item"]')
    expect(root).toHaveAttribute('data-variant', 'muted')
    expect(root?.className).toContain('border')
    expect(root?.className).toContain('forced-colors:border-[CanvasText]')
  })

  it('defaults to the plain variant with no surface', () => {
    const { container } = render(<Item>Row</Item>)
    expect(container.querySelector('[data-slot="item"]')).toHaveAttribute('data-variant', 'default')
  })
})

describe('ItemGroup', () => {
  it('separates rows with hairline dividers in the divided variant', () => {
    const { container } = render(
      <ItemGroup variant="divided">
        <Item>A</Item>
        <Item>B</Item>
      </ItemGroup>
    )
    const group = container.querySelector('[data-slot="item-group"]')
    expect(group).toHaveAttribute('data-variant', 'divided')
    expect(group?.className).toContain('divide-y')
  })

  it('spaces free-standing rows in the plain variant', () => {
    const { container } = render(
      <ItemGroup>
        <Item variant="outline">A</Item>
        <Item variant="outline">B</Item>
      </ItemGroup>
    )
    const group = container.querySelector('[data-slot="item-group"]')
    expect(group).toHaveAttribute('data-variant', 'plain')
    expect(group?.className).toContain('flex-col')
  })

  it('exposes a real list when given list semantics', () => {
    render(
      <ItemGroup variant="divided" role="list" aria-label="Services">
        <Item role="listitem">
          <ItemContent>
            <ItemTitle>Permits</ItemTitle>
          </ItemContent>
        </Item>
        <Item role="listitem">
          <ItemContent>
            <ItemTitle>Licenses</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>
    )
    expect(screen.getByRole('list', { name: 'Services' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})

describe('Item forwarding', () => {
  it('forwards the root ref and merges className and props', () => {
    const ref = React.createRef<HTMLDivElement>()
    const { container } = render(
      <Item ref={ref} className="custom-class" data-testid="row">
        Row
      </Item>
    )
    const root = container.querySelector('[data-slot="item"]')
    expect(ref.current).toBe(root)
    expect(root).toHaveClass('custom-class')
    expect(root).toHaveAttribute('data-testid', 'row')
  })
})
