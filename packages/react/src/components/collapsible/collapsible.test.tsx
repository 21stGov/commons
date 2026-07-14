// SPDX-License-Identifier: MIT

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '@/components/collapsible'
import { axeCheck } from '../../../test/setup.js'

const TRIGGER = 'Show eligibility details'
const CONTENT = 'Households under 200% of the federal poverty level qualify.'

function Disclosure(
  props: Omit<React.ComponentProps<typeof Collapsible>, 'children'> & {
    keepMounted?: boolean
    hiddenUntilFound?: boolean
  } = {}
): React.JSX.Element {
  const { keepMounted, hiddenUntilFound, ...rootProps } = props
  return (
    <Collapsible {...rootProps}>
      <CollapsibleTrigger>{TRIGGER}</CollapsibleTrigger>
      <CollapsiblePanel keepMounted={keepMounted} hiddenUntilFound={hiddenUntilFound}>
        {CONTENT}
      </CollapsiblePanel>
    </Collapsible>
  )
}

describe('Collapsible accessibility (axe)', () => {
  it('is axe-clean while closed', async () => {
    const { container } = render(<Disclosure />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean while open', async () => {
    const { container } = render(<Disclosure defaultOpen />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean after opening and closing interactively', async () => {
    const user = userEvent.setup()
    const { container } = render(<Disclosure />)
    const trigger = screen.getByRole('button', { name: TRIGGER })

    await user.click(trigger)
    expect(await axeCheck(container)).toHaveNoViolations()

    await user.click(trigger)
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Collapsible name, role, and value', () => {
  it('renders the trigger as a native button with its accessible name', () => {
    render(<Disclosure />)
    const trigger = screen.getByRole('button', { name: TRIGGER })
    expect(trigger.tagName).toBe('BUTTON')
    expect(trigger).toHaveAttribute('data-slot', 'collapsible-trigger')
  })

  it('sets aria-expanded on the trigger and toggles it', async () => {
    const user = userEvent.setup()
    render(<Disclosure />)
    const trigger = screen.getByRole('button', { name: TRIGGER })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('wires aria-controls to the panel while it is in the DOM', async () => {
    const user = userEvent.setup()
    render(<Disclosure />)
    const trigger = screen.getByRole('button', { name: TRIGGER })

    // Base UI unmounts the closed panel by default, so aria-controls only
    // references an element that exists once the panel is open.
    expect(trigger).not.toHaveAttribute('aria-controls')

    await user.click(trigger)
    const panelId = trigger.getAttribute('aria-controls')
    expect(panelId).toBeTruthy()
    const panel = document.getElementById(panelId as string)
    expect(panel).not.toBeNull()
    expect(panel).toHaveAttribute('data-slot', 'collapsible-panel')
  })

  it('removes the closed content from the DOM by default and shows it when open', async () => {
    const user = userEvent.setup()
    render(<Disclosure />)

    expect(screen.queryByText(CONTENT)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: TRIGGER }))
    expect(screen.getByText(CONTENT)).toBeInTheDocument()
  })

  it('opens on first mount when defaultOpen is set', () => {
    render(<Disclosure defaultOpen />)
    expect(screen.getByRole('button', { name: TRIGGER })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(CONTENT)).toBeInTheDocument()
  })

  it('renders the decorative chevron by default and omits it when showIndicator is false', () => {
    const { rerender } = render(<Disclosure />)
    const trigger = screen.getByRole('button', { name: TRIGGER })
    // eslint-disable-next-line testing-library/no-node-access
    expect(trigger.querySelector('[data-slot="collapsible-chevron"]')).not.toBeNull()

    rerender(
      <Collapsible>
        <CollapsibleTrigger showIndicator={false}>{TRIGGER}</CollapsibleTrigger>
        <CollapsiblePanel>{CONTENT}</CollapsiblePanel>
      </Collapsible>
    )
    const bare = screen.getByRole('button', { name: TRIGGER })
    // eslint-disable-next-line testing-library/no-node-access
    expect(bare.querySelector('[data-slot="collapsible-chevron"]')).toBeNull()
  })

  it('supports the controlled open / onOpenChange API', async () => {
    const user = userEvent.setup()
    const changes: boolean[] = []

    function Controlled(): React.JSX.Element {
      const [open, setOpen] = React.useState(false)
      return (
        <Collapsible
          open={open}
          onOpenChange={(next) => {
            changes.push(next)
            setOpen(next)
          }}
        >
          <CollapsibleTrigger>{TRIGGER}</CollapsibleTrigger>
          <CollapsiblePanel>{CONTENT}</CollapsiblePanel>
        </Collapsible>
      )
    }

    render(<Controlled />)
    await user.click(screen.getByRole('button', { name: TRIGGER }))
    expect(changes).toEqual([true])
    expect(screen.getByText(CONTENT)).toBeInTheDocument()
  })
})

describe('Collapsible keyboard contract', () => {
  it('Tab reaches the trigger', async () => {
    const user = userEvent.setup()
    render(<Disclosure />)
    await user.tab()
    expect(screen.getByRole('button', { name: TRIGGER })).toHaveFocus()
  })

  it('Enter toggles the panel', async () => {
    const user = userEvent.setup()
    render(<Disclosure />)
    const trigger = screen.getByRole('button', { name: TRIGGER })

    await user.tab()
    expect(trigger).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(CONTENT)).toBeInTheDocument()

    await user.keyboard('{Enter}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('Space toggles the panel', async () => {
    const user = userEvent.setup()
    render(<Disclosure />)
    const trigger = screen.getByRole('button', { name: TRIGGER })

    await user.tab()
    await user.keyboard(' ')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard(' ')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('Collapsible find-in-page (hiddenUntilFound)', () => {
  it('keeps the panel content in the DOM while closed when hiddenUntilFound is set', () => {
    render(<Disclosure hiddenUntilFound />)
    // The trigger reports closed, but the text stays in the DOM (hidden
    // until-found) so the browser's find-in-page can reveal it.
    expect(screen.getByRole('button', { name: TRIGGER })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText(CONTENT)).toBeInTheDocument()
  })

  it('keeps the panel content in the DOM while closed when keepMounted is set', () => {
    render(<Disclosure keepMounted />)
    expect(screen.getByRole('button', { name: TRIGGER })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText(CONTENT)).toBeInTheDocument()
  })
})

describe('Collapsible RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <div dir="rtl">
        <Collapsible lang="ar">
          <CollapsibleTrigger>عرض تفاصيل الأهلية</CollapsibleTrigger>
          <CollapsiblePanel>الأسر ذات الدخل المنخفض مؤهلة للحصول على الدعم.</CollapsiblePanel>
        </Collapsible>
      </div>
    )

    const trigger = screen.getByRole('button', { name: 'عرض تفاصيل الأهلية' })
    await user.click(trigger)
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })
    expect(screen.getByText('الأسر ذات الدخل المنخفض مؤهلة للحصول على الدعم.')).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('uses only logical layout classes on the trigger', () => {
    render(<Disclosure />)
    const trigger = screen.getByRole('button', { name: TRIGGER })
    expect(trigger).toHaveClass('text-start')
    expect(trigger.className).not.toMatch(/text-left|text-right|\bmr-|\bml-|\bpl-|\bpr-/)
  })
})
