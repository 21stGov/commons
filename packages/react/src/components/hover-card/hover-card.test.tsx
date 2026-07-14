// SPDX-License-Identifier: MIT

import { DirectionProvider } from '@base-ui/react/direction-provider'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/hover-card'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

/**
 * A profile preview whose trigger is a real link. Delays are zeroed so the
 * open/close transitions are synchronous in tests.
 */
function ProfileHoverCard(): React.JSX.Element {
  return (
    <HoverCard>
      <HoverCardTrigger href="/agencies/parks" delay={0} closeDelay={0}>
        Parks Department
      </HoverCardTrigger>
      <HoverCardContent>
        <p>Parks Department</p>
        <p>Maintains the city's parks, trails, and recreation centers.</p>
      </HoverCardContent>
    </HoverCard>
  )
}

describe('HoverCard trigger', () => {
  it('renders a real link with an href', () => {
    render(<ProfileHoverCard />)
    const trigger = screen.getByRole('link', { name: 'Parks Department' })
    expect(trigger).toHaveAttribute('href', '/agencies/parks')
  })

  it('warns in development when the trigger is not focusable', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <HoverCard>
        {/* No href → a non-focusable anchor: the card could never open by keyboard. */}
        <HoverCardTrigger render={<span />}>Parks Department</HoverCardTrigger>
        <HoverCardContent>Preview</HoverCardContent>
      </HoverCard>
    )
    await waitFor(() => expect(warn).toHaveBeenCalledWith(expect.stringContaining('focusable')))
  })

  it('does not warn for a real link trigger', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<ProfileHoverCard />)
    // Give the effect a tick to run.
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('HoverCard opening', () => {
  it('opens on keyboard focus of the trigger', async () => {
    render(<ProfileHoverCard />)
    const trigger = screen.getByRole('link', { name: 'Parks Department' })

    trigger.focus()
    expect(trigger).toHaveFocus()
    await waitFor(() => {
      expect(screen.getByText("Maintains the city's parks, trails, and recreation centers.")).toBeInTheDocument()
    })
  })

  // jsdom has no real pointer, so hover is simulated by dispatching the
  // pointer/mouse events that userEvent fires with `pointerEventsCheck` off.
  // The hover-open path is exercised here; genuine pointer timing is verified
  // in browser testing.
  it('opens on pointer hover of the trigger', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    render(<ProfileHoverCard />)
    const trigger = screen.getByRole('link', { name: 'Parks Department' })

    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByText("Maintains the city's parks, trails, and recreation centers.")).toBeInTheDocument()
    })
  })
})

describe('HoverCard dismissal', () => {
  it('closes on Escape without moving focus from the trigger', async () => {
    const user = userEvent.setup()
    render(<ProfileHoverCard />)
    const trigger = screen.getByRole('link', { name: 'Parks Department' })

    trigger.focus()
    await waitFor(() => {
      expect(screen.getByText(/Maintains the city/)).toBeInTheDocument()
    })

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByText(/Maintains the city/)).not.toBeInTheDocument()
    })
    expect(trigger).toHaveFocus()
  })

  it('closes when focus leaves the trigger (blur)', async () => {
    const user = userEvent.setup()
    render(
      <>
        <ProfileHoverCard />
        <a href="/next">Next link</a>
      </>
    )
    const trigger = screen.getByRole('link', { name: 'Parks Department' })

    trigger.focus()
    await waitFor(() => {
      expect(screen.getByText(/Maintains the city/)).toBeInTheDocument()
    })

    await user.tab()
    await waitFor(() => {
      expect(screen.queryByText(/Maintains the city/)).not.toBeInTheDocument()
    })
  })
})

describe('HoverCard accessibility (axe)', () => {
  it('is axe-clean while closed', async () => {
    const { container } = render(<ProfileHoverCard />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean while open', async () => {
    render(<ProfileHoverCard />)
    screen.getByRole('link', { name: 'Parks Department' }).focus()
    await waitFor(() => {
      expect(screen.getByText(/Maintains the city/)).toBeInTheDocument()
    })
    // Base UI portals the popup to document.body; the page-level `region`
    // best-practice rule can never be satisfied by an isolated, landmark-less
    // test page, so it is disabled.
    expect(
      await axeCheck(document.body, { rules: { region: { enabled: false } } })
    ).toHaveNoViolations()
  })
})

describe('HoverCard RTL', () => {
  it('renders, opens, and stays axe-clean in a dir=rtl document (logical side flips)', async () => {
    render(
      <DirectionProvider direction="rtl">
        <div dir="rtl" lang="ar">
          <HoverCard>
            <HoverCardTrigger href="/agencies/parks" delay={0} closeDelay={0}>
              إدارة الحدائق
            </HoverCardTrigger>
            <HoverCardContent side="inline-end">
              <p>تصون حدائق المدينة ومساراتها.</p>
            </HoverCardContent>
          </HoverCard>
        </div>
      </DirectionProvider>
    )
    const trigger = screen.getByRole('link', { name: 'إدارة الحدائق' })
    trigger.focus()
    await waitFor(() => {
      expect(screen.getByText('تصون حدائق المدينة ومساراتها.')).toBeInTheDocument()
    })
    expect(
      await axeCheck(document.body, { rules: { region: { enabled: false } } })
    ).toHaveNoViolations()
  })
})
