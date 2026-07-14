// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Kbd, KbdGroup } from '@/components/kbd'
import { expectNonInteractive } from '../../../test/keyboard.js'
import { axeCheck } from '../../../test/setup.js'

/**
 * Stubs `navigator.platform` (and clears `userAgentData`) for the duration
 * of one test, matching how `detectPlatform()` reads the environment. Kbd's
 * platform state is set inside a `useEffect`, which React Testing Library's
 * `render()` flushes synchronously (via `act`), so the DOM reflects the
 * stubbed platform immediately after `render()` returns.
 */
function stubPlatform(platform: string): void {
  Object.defineProperty(window.navigator, 'platform', {
    value: platform,
    configurable: true,
  })
  Object.defineProperty(window.navigator, 'userAgentData', {
    value: undefined,
    configurable: true,
  })
}

afterEach(() => {
  vi.restoreAllMocks()
  Object.defineProperty(window.navigator, 'platform', { value: '', configurable: true })
  Object.defineProperty(window.navigator, 'userAgentData', { value: undefined, configurable: true })
})

describe('Kbd accessibility (axe)', () => {
  it('a literal key is axe-clean', async () => {
    const { container } = render(<Kbd>K</Kbd>)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('a semantic token key is axe-clean', async () => {
    stubPlatform('MacIntel')
    const { container } = render(<Kbd token="mod" />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('a KbdGroup shortcut is axe-clean', async () => {
    stubPlatform('MacIntel')
    const { container } = render(<KbdGroup keys={['mod', 'K']} />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('a small-size key is axe-clean', async () => {
    const { container } = render(<Kbd size="sm">Esc</Kbd>)
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Kbd element and content', () => {
  it('renders a non-interactive <kbd> with no role or tab stop', () => {
    render(<Kbd data-testid="key">K</Kbd>)
    const key = screen.getByTestId('key')
    expect(key.tagName).toBe('KBD')
    expect(key).not.toHaveAttribute('role')
    expect(key).not.toHaveAttribute('tabindex')
    expect(key).toHaveAttribute('data-slot', 'kbd')
  })

  it('renders literal children as visible text with no extra label markup', () => {
    render(<Kbd>F5</Kbd>)
    expect(screen.getByText('F5')).toBeInTheDocument()
  })

  it('forwards ref, className, and size', () => {
    const ref = React.createRef<HTMLElement>()
    render(
      <Kbd ref={ref} size="sm" className="custom-kbd">
        A
      </Kbd>
    )
    expect(ref.current?.tagName).toBe('KBD')
    expect(ref.current).toHaveAttribute('data-size', 'sm')
    expect(ref.current).toHaveClass('custom-kbd')
  })
})

describe('Kbd platform-adaptive tokens', () => {
  it('renders the Mac glyph and spoken label for token="mod" on macOS', () => {
    stubPlatform('MacIntel')
    render(<Kbd token="mod" data-testid="key" />)
    const key = screen.getByTestId('key')
    expect(key.querySelector('[data-slot="kbd-glyph"]')).toHaveTextContent('⌘')
    expect(key.querySelector('[data-slot="kbd-glyph"]')).toHaveAttribute('aria-hidden', 'true')
    expect(key).toHaveTextContent('Command')
  })

  it('renders the non-Mac glyph and spoken label for token="mod" elsewhere', () => {
    stubPlatform('Win32')
    render(<Kbd token="mod" data-testid="key" />)
    const key = screen.getByTestId('key')
    expect(key.querySelector('[data-slot="kbd-glyph"]')).toHaveTextContent('Ctrl')
    expect(key).toHaveTextContent('Control')
  })

  it('defaults to the non-Mac rendering before the platform effect settles (SSR-safe)', () => {
    // No stub: jsdom's default navigator.platform does not match /mac/i,
    // matching the SSR-safe "other" default documented on usePlatform().
    render(<Kbd token="mod" data-testid="key" />)
    expect(screen.getByTestId('key').querySelector('[data-slot="kbd-glyph"]')).toHaveTextContent(
      'Ctrl'
    )
  })

  it('renders a literal, platform-invariant token like "cmd" the same on every platform', () => {
    stubPlatform('Win32')
    render(<Kbd token="cmd" data-testid="key" />)
    expect(screen.getByTestId('key').querySelector('[data-slot="kbd-glyph"]')).toHaveTextContent(
      '⌘'
    )
    expect(screen.getByTestId('key')).toHaveTextContent('Command')
  })

  it('token takes precedence over children', () => {
    render(
      <Kbd token="esc" data-testid="key">
        should be ignored
      </Kbd>
    )
    expect(screen.getByTestId('key')).not.toHaveTextContent('should be ignored')
  })
})

describe('KbdGroup composing a shortcut', () => {
  it('composes keys into a labelled group announcing the whole shortcut', () => {
    stubPlatform('MacIntel')
    render(<KbdGroup keys={['mod', 'K']} data-testid="group" />)
    const group = screen.getByRole('group', { name: 'Command K' })
    expect(group).toHaveAttribute('data-slot', 'kbd-group')
    expect(group.tagName).toBe('KBD')
  })

  it('computes a Ctrl-based label on non-Mac platforms from the same keys', () => {
    stubPlatform('Win32')
    render(<KbdGroup keys={['mod', 'K']} />)
    expect(screen.getByRole('group', { name: 'Control K' })).toBeInTheDocument()
  })

  it('renders one Kbd key cap per entry with a decorative, hidden separator between them', () => {
    stubPlatform('MacIntel')
    const { container } = render(<KbdGroup keys={['mod', 'shift', 'K']} />)
    const keyCaps = container.querySelectorAll('[data-slot="kbd"]')
    expect(keyCaps).toHaveLength(3)
    const separators = container.querySelectorAll('[data-slot="kbd-group-separator"]')
    expect(separators).toHaveLength(2)
    separators.forEach((sep) => expect(sep).toHaveAttribute('aria-hidden', 'true'))
  })

  it('composes manually via Kbd children, deriving the same auto-label', () => {
    stubPlatform('MacIntel')
    render(
      <KbdGroup>
        <Kbd token="mod" />
        <Kbd>K</Kbd>
      </KbdGroup>
    )
    expect(screen.getByRole('group', { name: 'Command K' })).toBeInTheDocument()
  })

  it('lets an explicit aria-label override the auto-computed one', () => {
    render(<KbdGroup keys={['mod', 'K']} aria-label="Open quick switcher" />)
    expect(screen.getByRole('group', { name: 'Open quick switcher' })).toBeInTheDocument()
  })

  it('uses a custom separator character while keeping it hidden from assistive tech', () => {
    const { container } = render(<KbdGroup keys={['mod', 'K']} separator="then" />)
    const separator = container.querySelector('[data-slot="kbd-group-separator"]')
    expect(separator).toHaveTextContent('then')
    expect(separator).toHaveAttribute('aria-hidden', 'true')
  })

  it('warns in dev when a part cannot be auto-labelled and no aria-label is given', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <KbdGroup>
        <Kbd>
          <span>icon-only, non-string content</span>
        </Kbd>
      </KbdGroup>
    )
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('could not auto-compute'))
  })

  it('does not warn when an explicit aria-label is supplied even if parts are unlabelable', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <KbdGroup aria-label="Custom shortcut">
        <Kbd>
          <span>non-string content</span>
        </Kbd>
      </KbdGroup>
    )
    expect(warnSpy).not.toHaveBeenCalled()
  })
})

describe('Kbd keyboard contract (verified)', () => {
  // Verifies accessibility.keyboard: static content — no tab stop / keyboard behavior of its own.
  it('exposes no keyboard focus surface', () => {
    const { container } = render(
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>,
    )
    expectNonInteractive(container)
  })
})
