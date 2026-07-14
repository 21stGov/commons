// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Meter } from '@/components/meter'
import { expectNonInteractive } from '../../../test/keyboard.js'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Meter accessibility (axe)', () => {
  it('a plain determinate meter is axe-clean', async () => {
    const { container } = render(<Meter label="Disk usage" value={72} showValue />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('named only by aria-label is axe-clean', async () => {
    const { container } = render(<Meter aria-label="Sync buffer" value={10} />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('a meter with threshold segments is axe-clean', async () => {
    const { container } = render(
      <Meter
        label="Monthly budget used"
        value={840}
        min={0}
        max={1000}
        showValue
        thresholds={[
          { max: 700, label: 'Under budget', tone: 'success' },
          { max: 900, label: 'On track', tone: 'warning' },
          { max: 1000, label: 'Over budget', tone: 'error' },
        ]}
      />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('a custom min/max meter is axe-clean', async () => {
    const { container } = render(
      <Meter label="Score" value={82} min={0} max={100} showValue />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Meter role, name, and value', () => {
  it('exposes role=meter (not progressbar) named by its visible label', () => {
    render(<Meter label="Disk usage" value={72} />)
    const meter = screen.getByRole('meter', { name: 'Disk usage' })
    expect(meter).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('exposes aria-valuenow/min/max from value/min/max', () => {
    render(<Meter label="Disk usage" value={72} />)
    const meter = screen.getByRole('meter')
    expect(meter).toHaveAttribute('aria-valuenow', '72')
    expect(meter).toHaveAttribute('aria-valuemin', '0')
    expect(meter).toHaveAttribute('aria-valuemax', '100')
  })

  it('honors a custom min/max range', () => {
    render(<Meter label="Storage used" value={640} min={0} max={1000} />)
    const meter = screen.getByRole('meter')
    expect(meter).toHaveAttribute('aria-valuemin', '0')
    expect(meter).toHaveAttribute('aria-valuemax', '1000')
    expect(meter).toHaveAttribute('aria-valuenow', '640')
  })

  it('derives aria-valuetext from the default value template', () => {
    render(<Meter label="Disk usage" value={75} />)
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', '75%')
  })

  it('derives aria-valuetext from a custom value template', () => {
    render(
      <Meter label="Storage used" value={189} max={256} valueTemplate="{value} of {max} GB" />
    )
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', '189 of 256 GB')
  })

  it('renders the visible label and value text', () => {
    render(<Meter label="Disk usage" value={40} showValue />)
    expect(screen.getByText('Disk usage')).toBeInTheDocument()
    const valueText = document.querySelector('[data-slot="meter-value"]')
    expect(valueText).toHaveTextContent('40%')
    expect(valueText).toHaveAttribute('aria-hidden', 'true')
  })

  it('names the meter with aria-label when no visible label is given', () => {
    render(<Meter aria-label="Background sync buffer" value={10} />)
    expect(screen.getByRole('meter', { name: 'Background sync buffer' })).toBeInTheDocument()
  })

  it('has no indeterminate state — value is always required and concrete', () => {
    render(<Meter label="Disk usage" value={0} />)
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByRole('meter')).not.toHaveAttribute('aria-busy')
  })
})

describe('Meter threshold segments', () => {
  const thresholds = [
    { max: 50, label: 'Low', tone: 'error' as const },
    { max: 80, label: 'Optimal', tone: 'success' as const },
    { max: 100, label: 'High', tone: 'warning' as const },
  ]

  it('picks the first segment whose max covers the value', () => {
    render(<Meter label="Battery" value={30} thresholds={thresholds} />)
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('picks the middle segment at a mid-range value', () => {
    render(<Meter label="Battery" value={72} thresholds={thresholds} />)
    expect(screen.getByText('Optimal')).toBeInTheDocument()
  })

  it('picks the last segment for a value at or above its max', () => {
    render(<Meter label="Battery" value={95} thresholds={thresholds} />)
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('falls back to the last segment when the value exceeds every max', () => {
    render(<Meter label="Battery" value={150} thresholds={thresholds} />)
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('applies the active segment tone as the indicator fill color', () => {
    render(<Meter label="Battery" value={30} thresholds={thresholds} />)
    const indicator = document.querySelector('[data-slot="meter-indicator"]')
    expect(indicator?.className).toContain('bg-error')
  })

  it('shows the segment label as text even when showValue is false (non-color cue)', () => {
    render(<Meter label="Battery" value={30} thresholds={thresholds} />)
    const segmentLabel = document.querySelector('[data-slot="meter-segment-label"]')
    expect(segmentLabel).toHaveTextContent('Low')
  })

  it('renders a tick mark at each internal threshold boundary (second non-color cue)', () => {
    render(<Meter label="Battery" value={30} thresholds={thresholds} />)
    const ticks = document.querySelectorAll('[data-slot="meter-threshold-tick"]')
    // Two internal boundaries (50, 80); the final max=100 is the track's own end.
    expect(ticks).toHaveLength(2)
  })

  it('renders no ticks for a single-segment threshold list', () => {
    render(<Meter label="Battery" value={30} thresholds={[{ max: 100, label: 'Any' }]} />)
    expect(document.querySelectorAll('[data-slot="meter-threshold-tick"]')).toHaveLength(0)
  })

  it('renders no segment label or ticks when thresholds are omitted', () => {
    render(<Meter label="Battery" value={30} />)
    expect(document.querySelector('[data-slot="meter-segment-label"]')).not.toBeInTheDocument()
    expect(document.querySelectorAll('[data-slot="meter-threshold-tick"]')).toHaveLength(0)
  })

  it('defaults an unspecified tone to the default indicator color', () => {
    render(<Meter label="Battery" value={30} thresholds={[{ max: 100, label: 'Any' }]} />)
    const indicator = document.querySelector('[data-slot="meter-indicator"]')
    expect(indicator?.className).toContain('bg-primary')
  })
})

describe('Meter forced-colors and reduced-motion safety', () => {
  it('keeps a visible border on both the track and indicator', () => {
    render(<Meter label="Disk usage" value={40} />)
    const track = document.querySelector('[data-slot="meter-track"]')
    const indicator = document.querySelector('[data-slot="meter-indicator"]')
    expect(track?.className).toContain('border')
    expect(track?.className).toContain('forced-colors:border-[CanvasText]')
    expect(indicator?.className).toContain('border')
    expect(indicator?.className).toContain('forced-colors:border-[CanvasText]')
  })

  it('gates the fill width transition behind motion-reduce', () => {
    render(<Meter label="Disk usage" value={40} />)
    const indicator = document.querySelector('[data-slot="meter-indicator"]')
    expect(indicator?.className).toContain('transition-[width]')
    expect(indicator?.className).toContain('motion-reduce:transition-none')
  })
})

describe('Meter RTL (fill grows inline-start to end)', () => {
  it('uses a logical inline-start-anchored fill and stays axe-clean in dir=rtl', async () => {
    const { container } = render(
      <div dir="rtl">
        <Meter label="استخدام القرص" value={40} showValue />
      </div>
    )

    const indicator = container.querySelector(
      '[data-slot="meter-indicator"]'
    ) as HTMLElement | null
    // Base UI anchors the fill with inset-inline-start:0 so it grows from the
    // inline-start edge in both LTR and RTL. Never a physical left/right.
    const style = indicator?.getAttribute('style') ?? ''
    expect(style).toContain('inset-inline-start')
    expect(style).not.toMatch(/(^|[^-])left/)

    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Meter dev guard', () => {
  it('warns in development when no accessible name is given', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Meter value={40} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })

  it('does not warn when a label is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Meter label="Disk usage" value={40} />)
    expect(warn).not.toHaveBeenCalled()
  })

  it('does not warn when only aria-label is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Meter aria-label="Disk usage" value={40} />)
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('Meter keyboard contract (verified)', () => {
  // Verifies accessibility.keyboard: this component adds no tab stop / keyboard behavior.
  it('exposes no keyboard focus surface', () => {
    const { container } = render(
      <Meter label="Disk usage" value={72} showValue />,
    )
    expectNonInteractive(container)
  })
})
