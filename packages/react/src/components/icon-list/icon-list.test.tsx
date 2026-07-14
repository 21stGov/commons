// SPDX-License-Identifier: MIT

import { render, screen, within } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import { IconList, IconListItem } from '@/components/icon-list'
import { axeCheck } from '../../../test/setup.js'

function Sample(): React.JSX.Element {
  return (
    <IconList>
      <IconListItem>Free to apply</IconListItem>
      <IconListItem>Decision within 10 business days</IconListItem>
      <IconListItem>Renews automatically each year</IconListItem>
    </IconList>
  )
}

describe('IconList accessibility (axe)', () => {
  it('default (decorative icons) is axe-clean', async () => {
    const { container } = render(<Sample />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('with a meaningful (labelled) item icon is axe-clean', async () => {
    const { container } = render(
      <IconList>
        <IconListItem>Online applications</IconListItem>
        <IconListItem icon="x" iconLabel="Not available">
          Phone applications
        </IconListItem>
      </IconList>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('with a custom default icon is axe-clean', async () => {
    const { container } = render(
      <IconList icon="arrow-right">
        <IconListItem>Submit the form</IconListItem>
        <IconListItem>Wait for review</IconListItem>
      </IconList>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('multi-line item content is axe-clean', async () => {
    const { container } = render(
      <IconList>
        <IconListItem>
          A long benefit description that wraps across more than one line so its
          content flows under the text rather than under the leading icon.
        </IconListItem>
      </IconList>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('IconList semantics', () => {
  it('renders a <ul> that stays announced as a list (role=list despite list-none)', () => {
    render(<Sample />)
    const list = screen.getByRole('list')
    expect(list.tagName).toBe('UL')
    expect(list).toHaveAttribute('data-slot', 'icon-list')
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
  })

  it('renders each child as a real <li>', () => {
    render(<Sample />)
    expect(screen.getByText('Free to apply').closest('li')).not.toBeNull()
  })

  it('forwards the ref to the underlying <ul>', () => {
    const ref = React.createRef<HTMLUListElement>()
    render(
      <IconList ref={ref}>
        <IconListItem>Item</IconListItem>
      </IconList>
    )
    expect(ref.current?.tagName).toBe('UL')
  })
})

describe('IconList leading icons', () => {
  it('leading icons are decorative by default (aria-hidden, not in the a11y tree)', () => {
    const { container } = render(<Sample />)
    const icons = container.querySelectorAll('[data-slot="icon"]')
    expect(icons).toHaveLength(3)
    for (const icon of icons) {
      expect(icon).toHaveAttribute('aria-hidden', 'true')
      expect(icon).not.toHaveAttribute('role')
    }
    // A decorative bullet exposes no accessible image role.
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('iconLabel makes an item icon meaningful: role=img with that accessible name', () => {
    render(
      <IconList>
        <IconListItem icon="x" iconLabel="Not available">
          Phone applications
        </IconListItem>
      </IconList>
    )
    const img = screen.getByRole('img', { name: 'Not available' })
    expect(img).not.toHaveAttribute('aria-hidden')
  })

  it('a per-item icon overrides the list default', () => {
    const { container } = render(
      <IconList icon="check">
        <IconListItem>Included</IconListItem>
        <IconListItem icon="x" iconLabel="Not included">
          Excluded
        </IconListItem>
      </IconList>
    )
    // Two <li>s: the first uses the default check (decorative), the second the
    // overridden x (meaningful). Exactly one accessible image should exist.
    expect(container.querySelectorAll('[data-slot="icon"]')).toHaveLength(2)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(screen.getByRole('img', { name: 'Not included' })).toBeInTheDocument()
  })

  it('keeps item text in its own content slot beside the icon', () => {
    render(<Sample />)
    const item = screen.getByText('Free to apply')
    expect(item).toHaveAttribute('data-slot', 'icon-list-content')
    // The icon lives in a sibling slot, not inside the content.
    const li = item.closest('li')!
    expect(li.querySelector('[data-slot="icon-list-icon"]')).not.toBeNull()
  })

  it('forwards item props (id, className) and the ref to the <li>', () => {
    const ref = React.createRef<HTMLLIElement>()
    render(
      <IconList>
        <IconListItem ref={ref} id="first" className="custom-item">
          First
        </IconListItem>
      </IconList>
    )
    expect(ref.current?.tagName).toBe('LI')
    expect(ref.current).toHaveAttribute('id', 'first')
    expect(ref.current).toHaveClass('custom-item')
  })
})
