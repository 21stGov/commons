// SPDX-License-Identifier: MIT

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/tooltip'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

function Example({ closeDelay = 100 }: { closeDelay?: number }) {
  return (
    <TooltipProvider delay={0} closeDelay={closeDelay}>
      <Tooltip>
        <TooltipTrigger>Permit number</TooltipTrigger>
        <TooltipContent>The number printed at the top of your notice.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

describe('Tooltip accessibility', () => {
  it('is axe-clean while closed and open', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    const { container } = render(<Example />)
    expect(await axeCheck(container)).toHaveNoViolations()

    await user.hover(screen.getByRole('button', { name: 'Permit number' }))
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent('printed at the top')
    expect(await axeCheck(tooltip)).toHaveNoViolations()
  })

  it('wires the popup description to the trigger', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    render(<Example />)
    const trigger = screen.getByRole('button', { name: 'Permit number' })
    expect(trigger).not.toHaveAttribute('aria-describedby')

    await user.hover(trigger)
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip.id).not.toBe('')
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id)
  })

  it('dismisses with Escape without moving focus', async () => {
    const user = userEvent.setup()
    render(<Example />)
    const trigger = screen.getByRole('button', { name: 'Permit number' })

    trigger.focus()
    expect(await screen.findByRole('tooltip')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it('stays visible while its trigger remains focused', async () => {
    render(<Example closeDelay={0} />)
    const trigger = screen.getByRole('button', { name: 'Permit number' })
    trigger.focus()
    expect(await screen.findByRole('tooltip')).toBeInTheDocument()
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('stays visible when the pointer crosses onto the popup, then closes after leaving', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    render(<Example />)
    const trigger = screen.getByRole('button', { name: 'Permit number' })

    await user.hover(trigger)
    const tooltip = await screen.findByRole('tooltip')
    await user.hover(tooltip)
    await new Promise((resolve) => setTimeout(resolve, 150))
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    await user.unhover(tooltip)
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument())
  })

  it('warns in development when interactive content is placed inside', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <TooltipProvider delay={0}>
        <Tooltip defaultOpen>
          <TooltipTrigger>Help</TooltipTrigger>
          <TooltipContent>
            <a href="/help">Open help</a>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    await screen.findByRole('tooltip')
    await waitFor(() => expect(warn).toHaveBeenCalledWith(expect.stringContaining('interactive')))
  })

  it('does not warn for brief text content', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Example />)
    screen.getByRole('button', { name: 'Permit number' }).focus()
    await screen.findByRole('tooltip')
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(warn).not.toHaveBeenCalled()
  })
})
