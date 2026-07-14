// SPDX-License-Identifier: MIT

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanels,
} from '@/components/resizable-panels'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
  // The stacking test stubs `matchMedia`; unstub so it never leaks into a
  // later test and silently removes the separators.
  vi.unstubAllGlobals()
})

/** A two-pane horizontal split used across the behavior tests. */
function TwoPane(
  props: Partial<React.ComponentProps<typeof ResizablePanels>> & {
    handleProps?: React.ComponentProps<typeof ResizableHandle>
    panelProps?: Partial<React.ComponentProps<typeof ResizablePanel>>
  } = {}
): React.JSX.Element {
  const { handleProps, panelProps, ...groupProps } = props
  return (
    <ResizablePanels aria-label="Editor" {...groupProps}>
      <ResizablePanel defaultSize={40} minSize={20} maxSize={70} {...panelProps}>
        List
      </ResizablePanel>
      <ResizableHandle label="Resize list" {...handleProps} />
      <ResizablePanel defaultSize={60}>Detail</ResizablePanel>
    </ResizablePanels>
  )
}

describe('ResizablePanels accessibility (axe)', () => {
  it('horizontal two-pane split is axe-clean', async () => {
    const { container } = render(<TwoPane />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('vertical split is axe-clean', async () => {
    const { container } = render(
      <ResizablePanels direction="vertical" aria-label="Rows">
        <ResizablePanel defaultSize={50}>Top</ResizablePanel>
        <ResizableHandle label="Resize top row" />
        <ResizablePanel defaultSize={50}>Bottom</ResizablePanel>
      </ResizablePanels>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('three-pane layout is axe-clean', async () => {
    const { container } = render(
      <ResizablePanels aria-label="Workspace">
        <ResizablePanel defaultSize={25}>Nav</ResizablePanel>
        <ResizableHandle label="Resize nav" />
        <ResizablePanel defaultSize={50}>Main</ResizablePanel>
        <ResizableHandle label="Resize main" />
        <ResizablePanel defaultSize={25}>Aside</ResizablePanel>
      </ResizablePanels>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('disabled group is axe-clean', async () => {
    const { container } = render(<TwoPane disabled />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('ResizablePanels separator semantics', () => {
  it('exposes role=separator with orientation, values, and aria-controls', () => {
    render(<TwoPane />)
    const sep = screen.getByRole('separator', { name: 'Resize list' })
    // Horizontal group => the divider bar is vertical.
    expect(sep).toHaveAttribute('aria-orientation', 'vertical')
    expect(sep).toHaveAttribute('aria-valuenow', '40')
    expect(sep).toHaveAttribute('aria-valuemin', '20')
    expect(sep).toHaveAttribute('aria-valuemax', '70')
    expect(sep).toHaveAttribute('aria-valuetext', '40%')
    expect(sep).toHaveAttribute('tabindex', '0')
    // aria-controls references a real panel node.
    const controlledId = sep.getAttribute('aria-controls')
    expect(controlledId).toBeTruthy()
    expect(document.getElementById(controlledId as string)).toHaveTextContent('List')
  })

  it('a vertical group renders a horizontal separator', () => {
    render(
      <ResizablePanels direction="vertical">
        <ResizablePanel defaultSize={50}>Top</ResizablePanel>
        <ResizableHandle label="Resize top" />
        <ResizablePanel defaultSize={50}>Bottom</ResizablePanel>
      </ResizablePanels>
    )
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal')
  })
})

describe('ResizablePanels keyboard resize', () => {
  it('Arrow keys move the boundary by the step and update aria-valuenow + panel size', async () => {
    const user = userEvent.setup()
    render(<TwoPane step={10} />)
    const sep = screen.getByRole('separator', { name: 'Resize list' })
    const listPanel = document.getElementById(sep.getAttribute('aria-controls') as string)

    sep.focus()
    expect(sep).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(sep).toHaveAttribute('aria-valuenow', '50')
    expect(listPanel?.style.flexBasis).toBe('50%')

    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(sep).toHaveAttribute('aria-valuenow', '30')
    expect(listPanel?.style.flexBasis).toBe('30%')
  })

  it('Home jumps to the panel minimum and End to the maximum', async () => {
    const user = userEvent.setup()
    render(<TwoPane />)
    const sep = screen.getByRole('separator', { name: 'Resize list' })

    sep.focus()
    await user.keyboard('{Home}')
    expect(sep).toHaveAttribute('aria-valuenow', '20')

    await user.keyboard('{End}')
    expect(sep).toHaveAttribute('aria-valuenow', '70')
  })

  it('clamps to min/max of both neighbours (never overflows)', async () => {
    const user = userEvent.setup()
    render(<TwoPane step={100} />)
    const sep = screen.getByRole('separator', { name: 'Resize list' })

    sep.focus()
    // A huge step is clamped: the list caps at its own maxSize of 70.
    await user.keyboard('{ArrowRight}')
    expect(sep).toHaveAttribute('aria-valuenow', '70')

    // And cannot shrink below its minSize of 20.
    await user.keyboard('{ArrowLeft}')
    expect(sep).toHaveAttribute('aria-valuenow', '20')
  })

  it('mirrors Arrow direction under dir=rtl', async () => {
    const user = userEvent.setup()
    render(
      <div dir="rtl">
        <TwoPane step={10} />
      </div>
    )
    const sep = screen.getByRole('separator', { name: 'Resize list' })
    sep.focus()

    // In RTL, ArrowLeft grows the leading panel (mirrored).
    await user.keyboard('{ArrowLeft}')
    expect(sep).toHaveAttribute('aria-valuenow', '50')
    await user.keyboard('{ArrowRight}')
    expect(sep).toHaveAttribute('aria-valuenow', '40')
  })

  it('does not resize when the group is disabled', async () => {
    const user = userEvent.setup()
    render(<TwoPane disabled />)
    const sep = screen.getByRole('separator', { name: 'Resize list' })
    expect(sep).toHaveAttribute('aria-disabled', 'true')
    expect(sep).toHaveAttribute('tabindex', '-1')

    sep.focus()
    await user.keyboard('{ArrowRight}')
    expect(sep).toHaveAttribute('aria-valuenow', '40')
  })
})

describe('ResizablePanels collapse and reset', () => {
  it('Enter toggles a collapsible handle to the minimum and back', async () => {
    const user = userEvent.setup()
    render(<TwoPane handleProps={{ label: 'Resize list', collapsible: true }} />)
    const sep = screen.getByRole('separator', { name: 'Resize list' })

    sep.focus()
    await user.keyboard('{Enter}')
    expect(sep).toHaveAttribute('aria-valuenow', '20') // collapsed to minSize

    await user.keyboard('{Enter}')
    expect(sep).toHaveAttribute('aria-valuenow', '40') // restored
  })

  it('Enter does nothing when the handle is not collapsible', async () => {
    const user = userEvent.setup()
    render(<TwoPane handleProps={{ label: 'Resize list' }} />)
    const sep = screen.getByRole('separator', { name: 'Resize list' })

    sep.focus()
    await user.keyboard('{Enter}')
    expect(sep).toHaveAttribute('aria-valuenow', '40')
  })

  it('double-click resets to the default size', async () => {
    const user = userEvent.setup()
    render(<TwoPane step={10} />)
    const sep = screen.getByRole('separator', { name: 'Resize list' })

    sep.focus()
    await user.keyboard('{ArrowRight}')
    expect(sep).toHaveAttribute('aria-valuenow', '50')

    await user.dblClick(sep)
    expect(sep).toHaveAttribute('aria-valuenow', '40')
  })
})

describe('ResizablePanels controlled and uncontrolled', () => {
  it('supports uncontrolled defaultSizes', () => {
    render(
      <ResizablePanels defaultSizes={[30, 70]}>
        <ResizablePanel minSize={10}>A</ResizablePanel>
        <ResizableHandle label="Resize A" />
        <ResizablePanel minSize={10}>B</ResizablePanel>
      </ResizablePanels>
    )
    expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '30')
  })

  it('supports controlled sizes via sizes + onResize', async () => {
    const user = userEvent.setup()
    const onResize = vi.fn()

    function Controlled(): React.JSX.Element {
      const [sizes, setSizes] = React.useState([50, 50])
      return (
        <ResizablePanels
          sizes={sizes}
          step={10}
          onResize={(next) => {
            onResize(next)
            setSizes(next)
          }}
        >
          <ResizablePanel minSize={10}>A</ResizablePanel>
          <ResizableHandle label="Resize A" />
          <ResizablePanel minSize={10}>B</ResizablePanel>
        </ResizablePanels>
      )
    }

    render(<Controlled />)
    const sep = screen.getByRole('separator', { name: 'Resize A' })
    expect(sep).toHaveAttribute('aria-valuenow', '50')

    sep.focus()
    await user.keyboard('{ArrowRight}')
    expect(onResize).toHaveBeenCalledWith([60, 40])
    expect(sep).toHaveAttribute('aria-valuenow', '60')
  })

  it('fires both onResize and onLayout', async () => {
    const user = userEvent.setup()
    const onResize = vi.fn()
    const onLayout = vi.fn()
    render(<TwoPane step={10} onResize={onResize} onLayout={onLayout} />)

    screen.getByRole('separator', { name: 'Resize list' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(onResize).toHaveBeenCalledWith([50, 50])
    expect(onLayout).toHaveBeenCalledWith([50, 50])
  })
})

describe('ResizablePanels reflow (stacking)', () => {
  it('removes the separators from the tree when stacked below the breakpoint', () => {
    // Mock matchMedia so the max-width query matches (narrow viewport / zoom).
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    )
    render(<TwoPane stackAt="md" />)
    // Inert: the separator is removed from the DOM entirely when stacked, so it
    // leaves the tab order and the accessibility tree and the panes reflow.
    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
  })

  it('keeps the separator operable when stacking is disabled', () => {
    render(<TwoPane stackAt={false} />)
    expect(screen.getByRole('separator', { name: 'Resize list' })).toBeInTheDocument()
  })
})

describe('ResizablePanels structure and forced-colors', () => {
  it('sizes panels via flex-basis percentages that sum to 100', () => {
    render(<TwoPane />)
    const panels = document.querySelectorAll('[data-slot="resizable-panel"]')
    expect(panels).toHaveLength(2)
    expect((panels[0] as HTMLElement).style.flexBasis).toBe('40%')
    expect((panels[1] as HTMLElement).style.flexBasis).toBe('60%')
  })

  it('keeps a visible border/grip on the separator for forced-colors mode', () => {
    render(<TwoPane />)
    const grip = document.querySelector('[data-slot="resizable-handle-grip"]')
    expect(grip?.className).toContain('border')
    const track = document.querySelector('[data-slot="resizable-handle-track"]')
    expect(track?.className).toContain('bg-border-strong')
  })

  it('mirrors the hit-area transform for RTL', () => {
    render(<TwoPane />)
    const sep = screen.getByRole('separator', { name: 'Resize list' })
    expect(sep.className).toContain('-translate-x-1/2')
    expect(sep.className).toContain('rtl:translate-x-1/2')
  })
})

describe('ResizablePanels distribution', () => {
  it('splits the remainder evenly across panels without a defaultSize', () => {
    render(
      <ResizablePanels>
        <ResizablePanel>A</ResizablePanel>
        <ResizableHandle label="Resize A" />
        <ResizablePanel>B</ResizablePanel>
        <ResizableHandle label="Resize B" />
        <ResizablePanel>C</ResizablePanel>
      </ResizablePanels>
    )
    const panels = document.querySelectorAll('[data-slot="resizable-panel"]')
    const bases = Array.from(panels).map((p) => (p as HTMLElement).style.flexBasis)
    // 100 / 3, rounded to 4 dp.
    expect(bases).toEqual(['33.3333%', '33.3333%', '33.3334%'])
  })

  it('renders three real separators in a three-pane layout', () => {
    render(
      <ResizablePanels aria-label="Workspace">
        <ResizablePanel defaultSize={25}>Nav</ResizablePanel>
        <ResizableHandle label="Resize nav" />
        <ResizablePanel defaultSize={50}>Main</ResizablePanel>
        <ResizableHandle label="Resize main" />
        <ResizablePanel defaultSize={25}>Aside</ResizablePanel>
      </ResizablePanels>
    )
    const group = screen.getByRole('group', { name: 'Workspace' })
    expect(within(group).getAllByRole('separator')).toHaveLength(2)
  })
})

describe('ResizablePanels context guard', () => {
  it('throws when parts render outside the group', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<ResizableHandle label="Orphan" />)).toThrow(/ResizablePanels/)
    spy.mockRestore()
  })
})
