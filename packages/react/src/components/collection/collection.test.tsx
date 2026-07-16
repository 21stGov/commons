// SPDX-License-Identifier: MIT

import { render, screen, within } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import {
  Collection,
  CollectionCalendarDate,
  CollectionContent,
  CollectionDescription,
  CollectionItem,
  CollectionMedia,
  CollectionMeta,
  CollectionMetaItem,
  CollectionTitle,
} from '@/components/collection'
import { expectTabOrder, getFocusable } from '../../../test/keyboard.js'
import userEvent from '@testing-library/user-event'
import { axeCheck } from '../../../test/setup.js'

function Example(): React.JSX.Element {
  return (
    <Collection>
      <CollectionItem>
        <CollectionMedia>
          <CollectionCalendarDate date={new Date('2026-07-15T12:00:00.000Z')} timeZone="UTC" />
        </CollectionMedia>
        <CollectionContent>
          <CollectionTitle href="/meetings/budget">City budget listening session</CollectionTitle>
          <CollectionDescription>Share priorities for the coming fiscal year.</CollectionDescription>
          <CollectionMeta>
            <CollectionMetaItem>6:00 PM</CollectionMetaItem>
            <CollectionMetaItem>City Hall</CollectionMetaItem>
          </CollectionMeta>
        </CollectionContent>
      </CollectionItem>
      <CollectionItem>
        <CollectionContent>
          <CollectionTitle href="/notices/water" headingLevel="h4">Water main work</CollectionTitle>
          <CollectionDescription>Crews will work along Oak Street.</CollectionDescription>
        </CollectionContent>
      </CollectionItem>
    </Collection>
  )
}

describe('Collection accessibility and semantics', () => {
  it('is an axe-clean ul/li content list with nested metadata lists', async () => {
    const { container } = render(<Example />)
    const lists = screen.getAllByRole('list')
    expect(lists[0]?.tagName).toBe('UL')
    expect(within(lists[0]!).getAllByRole('listitem')).toHaveLength(4)
    expect(lists[0]).toHaveStyle({ paddingInlineStart: '0' })
    expect(lists[1]).toHaveStyle({ paddingInlineStart: '0' })
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('uses real headings with unique links and consumer-selected levels', () => {
    render(<Example />)
    expect(screen.getByRole('heading', { level: 3, name: 'City budget listening session' }))
      .toContainElement(screen.getByRole('link', { name: 'City budget listening session' }))
    expect(screen.getByRole('heading', { level: 4, name: 'Water main work' }))
      .toContainElement(screen.getByRole('link', { name: 'Water main work' }))
    expect(screen.getByRole('link', { name: 'Water main work' })).toHaveAttribute('href', '/notices/water')
  })

  it('keeps image semantics with consumer-provided alt text', () => {
    render(
      <Collection><CollectionItem><CollectionMedia><img src="/seal.svg" alt="Springfield city seal" /></CollectionMedia></CollectionItem></Collection>
    )
    expect(screen.getByRole('img', { name: 'Springfield city seal' })).toBeInTheDocument()
  })

  it('is axe-clean and logically flush in RTL', async () => {
    const { container } = render(<div dir="rtl"><Example /></div>)
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Collection presentation contract', () => {
  it('offers condensed spacing without changing semantics', () => {
    render(<Collection condensed><CollectionItem>One</CollectionItem></Collection>)
    expect(screen.getByRole('list')).toHaveAttribute('data-condensed', 'true')
    expect(screen.getByRole('listitem')).toHaveClass('py-105')
  })

  it('formats calendar dates visibly and exposes a machine-readable full date', () => {
    const ref = React.createRef<HTMLTimeElement>()
    const { container } = render(
      <CollectionCalendarDate
        ref={ref}
        date={new Date('2026-07-15T12:00:00.000Z')}
        locale="en-US"
        timeZone="UTC"
      />
    )
    expect(ref.current).toHaveAttribute('datetime', '2026-07-15T12:00:00.000Z')
    expect(ref.current).not.toHaveAttribute('aria-label')
    expect(ref.current).toHaveTextContent('Wednesday, July 15, 2026')
    expect(container).toHaveTextContent('Jul')
    expect(container).toHaveTextContent('15')
  })

  it('warns in development when a short collection grows past six items', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    render(<Collection>{Array.from({ length: 7 }, (_, index) => <CollectionItem key={index}>{index}</CollectionItem>)}</Collection>)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('more than six items'))
    warn.mockRestore()
  })

  it('keeps media beside content at every width, pinned to the top', () => {
    const { container } = render(<Example />)
    // jsdom applies no CSS: assert the layout mechanism. The item is a
    // two-column grid at its BASE (no breakpoint prefix), so a calendar date
    // or thumbnail sits beside the text on phones instead of stacking; the
    // media column hugs content (`self-start`, no fixed width) while images
    // get the fixed thumbnail width so photos can't blow out the column.
    const item = container.querySelector('[data-slot="collection-item"]')
    expect(item).toHaveClass('grid-cols-[auto_minmax(0,1fr)]')
    const media = container.querySelector('[data-slot="collection-media"]')
    expect(media).toHaveClass('self-start')
    expect(media?.className).not.toMatch(/(?:^|\s)(?:(?:sm|md|lg|xl):)?w-\d/) // no fixed column width
    expect(media?.className).toContain('[&_img]:w-24') // images are constrained
  })

  it('forwards root attributes, classes, styles, and refs', () => {
    const ref = React.createRef<HTMLUListElement>()
    render(<Collection ref={ref} aria-label="Notices" className="custom" style={{ paddingInlineStart: '1rem' }} />)
    expect(ref.current).toHaveAttribute('aria-label', 'Notices')
    expect(ref.current).toHaveClass('custom')
    expect(ref.current).toHaveStyle({ paddingInlineStart: '1rem' })
  })
})

describe('Collection keyboard contract (verified)', () => {
  // Verifies accessibility.keyboard: the list structure adds no tab stops; only the item
  // title links are tab stops, reachable in document order.
  it('only the item title links are tab stops, in document order', async () => {
    const user = userEvent.setup()
    const { container } = render(<Example />)
    const links = within(container).getAllByRole('link')
    expect(getFocusable(container)).toEqual(links)
    await expectTabOrder(user, links)
  })
})
