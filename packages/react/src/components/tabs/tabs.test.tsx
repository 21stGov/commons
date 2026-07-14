// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Tabs, TabsList, TabsPanel, TabsTab, type TabsProps } from '@/components/tabs'
import { axeCheck } from '../../../test/setup.js'

/** Three-tab fixture used across the suite. */
function ThreeTabs(props: Partial<TabsProps> & { activateOnFocus?: boolean }) {
  const { activateOnFocus, ...rootProps } = props
  return (
    <Tabs defaultValue="overview" {...rootProps}>
      <TabsList aria-label="Permit details" activateOnFocus={activateOnFocus}>
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="documents">Documents</TabsTab>
        <TabsTab value="history">History</TabsTab>
      </TabsList>
      <TabsPanel value="overview">Overview panel content.</TabsPanel>
      <TabsPanel value="documents">Documents panel content.</TabsPanel>
      <TabsPanel value="history">History panel content.</TabsPanel>
    </Tabs>
  )
}

describe('Tabs accessibility (axe)', () => {
  it('is axe-clean with a selected and unselected tabs', async () => {
    const { container } = render(<ThreeTabs />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean with a disabled tab', async () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList aria-label="Sections">
          <TabsTab value="a">Open</TabsTab>
          <TabsTab value="b" disabled>
            Unavailable
          </TabsTab>
        </TabsList>
        <TabsPanel value="a">Open content.</TabsPanel>
        <TabsPanel value="b">Unavailable content.</TabsPanel>
      </Tabs>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean in vertical orientation', async () => {
    const { container } = render(<ThreeTabs orientation="vertical" />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean after keyboard-selecting another tab', async () => {
    const user = userEvent.setup()
    const { container } = render(<ThreeTabs />)
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Documents' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Tabs name / role / value', () => {
  it('renders tablist, tabs, and the open tabpanel with accessible names', () => {
    render(<ThreeTabs />)

    expect(screen.getByRole('tablist', { name: 'Permit details' })).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(3)
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toHaveTextContent(
      'Overview panel content.'
    )
  })

  it('reflects selection in aria-selected', () => {
    render(<ThreeTabs defaultValue="documents" />)

    expect(screen.getByRole('tab', { name: 'Documents' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'false'
    )
    expect(screen.getByRole('tab', { name: 'History' })).toHaveAttribute(
      'aria-selected',
      'false'
    )
  })

  it('associates tab and panel via aria-controls / aria-labelledby', () => {
    render(<ThreeTabs />)

    const tab = screen.getByRole('tab', { name: 'Overview' })
    const panel = screen.getByRole('tabpanel')
    expect(tab).toHaveAttribute('aria-controls', panel.id)
    expect(panel).toHaveAttribute('aria-labelledby', tab.id)
  })

  it('renders tabs as native buttons and marks selection non-color-only (data-active)', () => {
    render(<ThreeTabs />)

    const selected = screen.getByRole('tab', { name: 'Overview' })
    expect(selected.tagName).toBe('BUTTON')
    // data-active drives the 2px block-end border + font-weight change —
    // the non-color selected indicators.
    expect(selected).toHaveAttribute('data-active')
    expect(screen.getByRole('tab', { name: 'Documents' })).not.toHaveAttribute('data-active')
  })

  it('unmounts hidden panels by default and only renders the active one', () => {
    render(<ThreeTabs />)

    expect(screen.getAllByRole('tabpanel')).toHaveLength(1)
    expect(screen.queryByText('Documents panel content.')).not.toBeInTheDocument()
  })

  it('exposes data-slot hooks on every part', () => {
    render(<ThreeTabs />)

    expect(document.querySelector('[data-slot="tabs"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="tabs-list"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="tabs-tab"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="tabs-panel"]')).not.toBeNull()
  })
})

describe('Tabs keyboard contract (APG)', () => {
  it('uses a roving tabindex: only the selected tab is in the tab order', () => {
    render(<ThreeTabs defaultValue="documents" />)

    expect(screen.getByRole('tab', { name: 'Documents' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('tabindex', '-1')
    expect(screen.getByRole('tab', { name: 'History' })).toHaveAttribute('tabindex', '-1')
  })

  it('Tab moves focus to the selected tab, not the first tab in the DOM', async () => {
    const user = userEvent.setup()
    render(<ThreeTabs defaultValue="history" />)

    await user.tab()
    expect(screen.getByRole('tab', { name: 'History' })).toHaveFocus()
  })

  it('ArrowRight moves focus to the next tab and activates it (automatic activation)', async () => {
    const user = userEvent.setup()
    render(<ThreeTabs />)

    await user.tab()
    await user.keyboard('{ArrowRight}')

    const documents = screen.getByRole('tab', { name: 'Documents' })
    expect(documents).toHaveFocus()
    expect(documents).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Documents panel content.')
  })

  it('ArrowLeft moves focus to the previous tab and activates it', async () => {
    const user = userEvent.setup()
    render(<ThreeTabs defaultValue="documents" />)

    await user.tab()
    await user.keyboard('{ArrowLeft}')

    const overview = screen.getByRole('tab', { name: 'Overview' })
    expect(overview).toHaveFocus()
    expect(overview).toHaveAttribute('aria-selected', 'true')
  })

  it('arrow navigation wraps at the ends (loopFocus default)', async () => {
    const user = userEvent.setup()
    render(<ThreeTabs defaultValue="history" />)

    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus()

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'History' })).toHaveFocus()
  })

  it('Home and End jump to the first and last tab', async () => {
    const user = userEvent.setup()
    render(<ThreeTabs defaultValue="documents" />)

    await user.tab()
    await user.keyboard('{End}')
    const history = screen.getByRole('tab', { name: 'History' })
    expect(history).toHaveFocus()
    expect(history).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{Home}')
    const overview = screen.getByRole('tab', { name: 'Overview' })
    expect(overview).toHaveFocus()
    expect(overview).toHaveAttribute('aria-selected', 'true')
  })

  it('arrow navigation skips disabled tabs', async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="Sections">
          <TabsTab value="a">First</TabsTab>
          <TabsTab value="b" disabled>
            Second
          </TabsTab>
          <TabsTab value="c">Third</TabsTab>
        </TabsList>
        <TabsPanel value="a">First content.</TabsPanel>
        <TabsPanel value="b">Second content.</TabsPanel>
        <TabsPanel value="c">Third content.</TabsPanel>
      </Tabs>
    )

    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Third' })).toHaveFocus()
  })

  it('Tab moves from the tab list into the open panel, which is focusable without focusable children', async () => {
    const user = userEvent.setup()
    render(<ThreeTabs />)

    const panel = screen.getByRole('tabpanel')
    // Base UI keeps the open panel in the tab order even though it
    // contains only text — keyboard users can always reach the content.
    expect(panel).toHaveAttribute('tabindex', '0')

    await user.tab()
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus()
    await user.tab()
    expect(panel).toHaveFocus()
  })

  it('with activateOnFocus=false, arrows only move focus; Enter and Space activate', async () => {
    const user = userEvent.setup()
    render(<ThreeTabs activateOnFocus={false} />)

    await user.tab()
    await user.keyboard('{ArrowRight}')

    const documents = screen.getByRole('tab', { name: 'Documents' })
    expect(documents).toHaveFocus()
    expect(documents).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Overview panel content.')

    await user.keyboard('{Enter}')
    expect(documents).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowRight}')
    const history = screen.getByRole('tab', { name: 'History' })
    expect(history).toHaveFocus()
    expect(history).toHaveAttribute('aria-selected', 'false')

    await user.keyboard(' ')
    expect(history).toHaveAttribute('aria-selected', 'true')
  })
})

describe('Tabs controlled usage and pointer', () => {
  it('clicking a tab selects it and fires onValueChange', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Tabs defaultValue="overview" onValueChange={onValueChange}>
        <TabsList aria-label="Permit details">
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="documents">Documents</TabsTab>
        </TabsList>
        <TabsPanel value="overview">Overview panel content.</TabsPanel>
        <TabsPanel value="documents">Documents panel content.</TabsPanel>
      </Tabs>
    )

    await user.click(screen.getByRole('tab', { name: 'Documents' }))
    expect(onValueChange).toHaveBeenCalledWith('documents', expect.anything())
    expect(screen.getByRole('tab', { name: 'Documents' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('a controlled value wins over user intent until the consumer updates it', async () => {
    const user = userEvent.setup()
    render(
      <Tabs value="overview">
        <TabsList aria-label="Permit details">
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="documents">Documents</TabsTab>
        </TabsList>
        <TabsPanel value="overview">Overview panel content.</TabsPanel>
        <TabsPanel value="documents">Documents panel content.</TabsPanel>
      </Tabs>
    )

    await user.click(screen.getByRole('tab', { name: 'Documents' }))
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })
})

describe('Tabs RTL', () => {
  it('with dir="rtl", ArrowLeft moves to the NEXT tab (visually left) and activates it', async () => {
    const user = userEvent.setup()
    render(
      <div dir="rtl">
        <ThreeTabs dir="rtl" />
      </div>
    )

    await user.tab()
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus()

    // RTL reverses the visual order: the next tab sits to the LEFT, so
    // ArrowLeft advances. Base UI derives this from its direction
    // context, which the Tabs root provides when dir is set.
    await user.keyboard('{ArrowLeft}')
    const documents = screen.getByRole('tab', { name: 'Documents' })
    expect(documents).toHaveFocus()
    expect(documents).toHaveAttribute('aria-selected', 'true')

    // And ArrowRight goes back toward the start of the list.
    await user.keyboard('{ArrowRight}')
    const overview = screen.getByRole('tab', { name: 'Overview' })
    expect(overview).toHaveFocus()
    expect(overview).toHaveAttribute('aria-selected', 'true')
  })

  it('renders and stays axe-clean in dir="rtl" with localized labels', async () => {
    const { container } = render(
      <div dir="rtl">
        <Tabs defaultValue="general" dir="rtl">
          <TabsList aria-label="تفاصيل الطلب">
            <TabsTab value="general">نظرة عامة</TabsTab>
            <TabsTab value="documents">المستندات</TabsTab>
          </TabsList>
          <TabsPanel value="general">محتوى النظرة العامة.</TabsPanel>
          <TabsPanel value="documents">محتوى المستندات.</TabsPanel>
        </Tabs>
      </div>
    )

    expect(screen.getByRole('tablist', { name: 'تفاصيل الطلب' })).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
