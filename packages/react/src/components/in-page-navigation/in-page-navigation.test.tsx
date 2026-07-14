// SPDX-License-Identifier: MIT

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  InPageNavigation,
  useHeadings,
  type InPageNavItem,
} from '@/components/in-page-navigation'
import { axeCheck } from '../../../test/setup.js'

// ---------------------------------------------------------------------------
// Fixtures + IntersectionObserver mock
// ---------------------------------------------------------------------------

const ITEMS: InPageNavItem[] = [
  { id: 'overview', label: 'Overview', level: 2 },
  { id: 'eligibility', label: 'Eligibility', level: 2 },
  { id: 'documents', label: 'Required documents', level: 3 },
  { id: 'apply', label: 'How to apply', level: 2 },
]

/** Renders the nav next to real, id-matched sections so anchors/scrollspy work. */
function Article(props: React.ComponentProps<typeof InPageNavigation>): React.JSX.Element {
  return (
    <div>
      <InPageNavigation {...props} />
      <article>
        {props.items.map((item) => (
          <section key={item.id} id={item.id} aria-labelledby={`${item.id}-h`}>
            <h2 id={`${item.id}-h`}>{item.label}</h2>
            <p>Body copy for {item.id}.</p>
          </section>
        ))}
      </article>
    </div>
  )
}

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []
  callback: IntersectionObserverCallback
  elements: Element[] = []
  rootMargin: string
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.rootMargin = options?.rootMargin ?? ''
    MockIntersectionObserver.instances.push(this)
  }
  observe(element: Element): void {
    this.elements.push(element)
  }
  unobserve(element: Element): void {
    this.elements = this.elements.filter((el) => el !== element)
  }
  disconnect(): void {
    this.elements = []
  }
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
  /** Test helper: fire the callback with a partial entry list. */
  emit(entries: Array<Partial<IntersectionObserverEntry> & { target: Element }>): void {
    this.callback(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver)
  }
  static latest(): MockIntersectionObserver {
    const observer = MockIntersectionObserver.instances.at(-1)
    if (!observer) throw new Error('No IntersectionObserver was created')
    return observer
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  MockIntersectionObserver.instances = []
})

// ---------------------------------------------------------------------------
// Accessibility (axe)
// ---------------------------------------------------------------------------

describe('InPageNavigation accessibility (axe)', () => {
  it('default (no active section) is axe-clean', async () => {
    const { container } = render(<Article items={ITEMS} />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('with a controlled active section is axe-clean', async () => {
    const { container } = render(<Article items={ITEMS} activeId="eligibility" />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('collapsible (mobile disclosure) is axe-clean', async () => {
    const { container } = render(<Article items={ITEMS} collapsible />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('nested h2/h3 levels are axe-clean', async () => {
    const { container } = render(<Article items={ITEMS} activeId="documents" />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

// ---------------------------------------------------------------------------
// Landmark + list semantics
// ---------------------------------------------------------------------------

describe('InPageNavigation semantics', () => {
  it('renders a nav landmark named by its label', () => {
    render(<Article items={ITEMS} />)
    expect(screen.getByRole('navigation', { name: 'On this page' })).toBeInTheDocument()
  })

  it('supports a translated landmark label', () => {
    render(<Article items={ITEMS} label="En esta página" />)
    expect(screen.getByRole('navigation', { name: 'En esta página' })).toBeInTheDocument()
  })

  it('renders an ordered list of anchors to each section', () => {
    render(<Article items={ITEMS} />)
    const nav = screen.getByRole('navigation', { name: 'On this page' })
    const links = within(nav).getAllByRole('link')
    expect(links).toHaveLength(ITEMS.length)
    expect(links[0]).toHaveAttribute('href', '#overview')
    expect(links[2]).toHaveAttribute('href', '#documents')
  })
})

// ---------------------------------------------------------------------------
// Active state (controlled)
// ---------------------------------------------------------------------------

describe('InPageNavigation active state', () => {
  it('marks the active link with aria-current="location" (not "page")', () => {
    render(<Article items={ITEMS} activeId="eligibility" />)
    const active = screen.getByRole('link', { name: 'Eligibility' })
    expect(active).toHaveAttribute('aria-current', 'location')
    expect(active).not.toHaveAttribute('aria-current', 'page')
    // Only one current entry.
    expect(screen.getByRole('link', { name: 'Overview' })).not.toHaveAttribute('aria-current')
  })

  it('signals the active entry with non-color cues (weight + accent bar)', () => {
    render(<Article items={ITEMS} activeId="eligibility" />)
    const active = screen.getByRole('link', { name: 'Eligibility' })
    // Weight and a logical inline-start accent bar survive forced-colors mode.
    expect(active.className).toContain('font-semibold')
    expect(active.className).toContain('border-s-primary')
    // Inactive rows keep a transparent border so every box is identical.
    const inactive = screen.getByRole('link', { name: 'Overview' })
    expect(inactive.className).toContain('border-s-transparent')
  })

  it('meets the 44px target on every row', () => {
    render(<Article items={ITEMS} />)
    for (const link of screen.getAllByRole('link')) {
      expect(link.className).toContain('min-h-11')
    }
  })
})

// ---------------------------------------------------------------------------
// Scrollspy (IntersectionObserver)
// ---------------------------------------------------------------------------

describe('InPageNavigation scrollspy', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  })

  it('does not attach an observer when activeId is controlled', () => {
    render(<Article items={ITEMS} activeId="overview" />)
    expect(MockIntersectionObserver.instances).toHaveLength(0)
  })

  it('highlights the section reported in view by the observer', () => {
    render(<Article items={ITEMS} />)
    const observer = MockIntersectionObserver.latest()

    expect(screen.getByRole('link', { name: 'How to apply' })).not.toHaveAttribute('aria-current')

    const target = document.getElementById('apply') as Element
    React.act(() => {
      observer.emit([{ target, isIntersecting: true }])
    })
    expect(screen.getByRole('link', { name: 'How to apply' })).toHaveAttribute(
      'aria-current',
      'location'
    )
  })

  it('resolves ties to the earliest section in list order', () => {
    render(<Article items={ITEMS} />)
    const observer = MockIntersectionObserver.latest()
    React.act(() => {
      observer.emit([
        { target: document.getElementById('documents') as Element, isIntersecting: true },
        { target: document.getElementById('eligibility') as Element, isIntersecting: true },
      ])
    })
    // Eligibility precedes Documents in ITEMS, so it wins.
    expect(screen.getByRole('link', { name: 'Eligibility' })).toHaveAttribute(
      'aria-current',
      'location'
    )
  })

  it('disconnects the observer on unmount', () => {
    const { unmount } = render(<Article items={ITEMS} />)
    const observer = MockIntersectionObserver.latest()
    const disconnect = vi.spyOn(observer, 'disconnect')
    unmount()
    expect(disconnect).toHaveBeenCalled()
  })
})

describe('InPageNavigation without IntersectionObserver', () => {
  it('renders without crashing when the API is unavailable (SSR/jsdom)', () => {
    // No IntersectionObserver stubbed: the guard must keep the component alive.
    expect(() => render(<Article items={ITEMS} />)).not.toThrow()
    expect(screen.getByRole('navigation', { name: 'On this page' })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Click: focus + hash + smooth scroll
// ---------------------------------------------------------------------------

describe('InPageNavigation activation', () => {
  beforeEach(() => {
    // jsdom does not implement scrollIntoView.
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('moves focus to the target section on click', async () => {
    const user = userEvent.setup()
    render(<Article items={ITEMS} />)
    await user.click(screen.getByRole('link', { name: 'How to apply' }))
    const target = document.getElementById('apply')
    expect(document.activeElement).toBe(target)
    // The section was made programmatically focusable without a positive tabindex.
    expect(target).toHaveAttribute('tabindex', '-1')
  })

  it('updates the hash with a normal history entry (does not hijack Back)', async () => {
    const user = userEvent.setup()
    const pushState = vi.spyOn(window.history, 'pushState')
    render(<Article items={ITEMS} />)
    await user.click(screen.getByRole('link', { name: 'Eligibility' }))
    expect(pushState).toHaveBeenCalledWith(null, '', '#eligibility')
  })

  it('smooth-scrolls to the section by default', async () => {
    const user = userEvent.setup()
    render(<Article items={ITEMS} />)
    await user.click(screen.getByRole('link', { name: 'Overview' }))
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('lets onItemSelect preventDefault take over navigation', async () => {
    const user = userEvent.setup()
    const onItemSelect = vi.fn((_id: string, event: React.MouseEvent) => event.preventDefault())
    render(<Article items={ITEMS} onItemSelect={onItemSelect} />)
    await user.click(screen.getByRole('link', { name: 'Overview' }))
    expect(onItemSelect).toHaveBeenCalledWith('overview', expect.anything())
    // preventDefault short-circuits our scroll/focus handling.
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
  })

  it('does no smooth scroll but still moves focus when smoothScroll is off', async () => {
    const user = userEvent.setup()
    render(<Article items={ITEMS} smoothScroll={false} />)
    await user.click(screen.getByRole('link', { name: 'Overview' }))
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(document.getElementById('overview'))
  })
})

// ---------------------------------------------------------------------------
// Collapsible (mobile disclosure)
// ---------------------------------------------------------------------------

describe('InPageNavigation collapsible', () => {
  it('exposes a disclosure toggle wired with aria-expanded', async () => {
    const user = userEvent.setup()
    render(<Article items={ITEMS} collapsible />)
    const toggle = screen.getByRole('button', { name: 'On this page' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('does not render a toggle button when not collapsible', () => {
    render(<Article items={ITEMS} />)
    expect(screen.queryByRole('button', { name: 'On this page' })).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// useHeadings (opt-in DOM derivation)
// ---------------------------------------------------------------------------

describe('useHeadings', () => {
  function Derived(): React.JSX.Element {
    const ref = React.useRef<HTMLElement>(null)
    const items = useHeadings({ containerRef: ref })
    return (
      <div>
        <InPageNavigation items={items} />
        <article ref={ref}>
          <h2 id="intro">Introduction</h2>
          <h3 id="details">Details</h3>
          <h2>Missing id</h2>
        </article>
      </div>
    )
  }

  it('derives items from headings that carry an id, after mount', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Derived />)
    // Filled in after mount via effect.
    expect(await screen.findByRole('link', { name: 'Introduction' })).toHaveAttribute(
      'href',
      '#intro'
    )
    expect(screen.getByRole('link', { name: 'Details' })).toHaveAttribute('href', '#details')
    // The id-less heading is skipped and warned about.
    expect(screen.queryByRole('link', { name: 'Missing id' })).not.toBeInTheDocument()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('id'), expect.anything())
  })
})

// ---------------------------------------------------------------------------
// RTL
// ---------------------------------------------------------------------------

describe('InPageNavigation RTL', () => {
  it('stays axe-clean and uses logical indentation in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <Article items={ITEMS} activeId="documents" />
      </div>
    )
    expect(screen.getByRole('navigation', { name: 'On this page' })).toBeInTheDocument()
    // The nested (h3) item indents with a logical property that mirrors in RTL.
    const nestedItem = container.querySelector(
      '[data-slot="in-page-navigation-item"]:nth-child(3)'
    )
    expect(nestedItem?.className).toContain('ps-3')
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
