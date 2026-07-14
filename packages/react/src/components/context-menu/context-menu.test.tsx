// SPDX-License-Identifier: MIT

import { DirectionProvider } from '@base-ui/react/direction-provider'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/context-menu'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

/**
 * A right-click actions menu whose trigger region wraps a real, focusable,
 * independently-useful button — the pattern the a11y contract requires so
 * the menu only ever *duplicates* reachable actions. `onSelectEdit` mirrors
 * an action the visible button would also perform.
 */
function ActionsContextMenu(props: { onSelectEdit?: () => void }): React.JSX.Element {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <button type="button">Report card</button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={props.onSelectEdit}>Edit</ContextMenuItem>
        <ContextMenuItem>Duplicate</ContextMenuItem>
        <ContextMenuItem disabled>Archive</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

/** Open the menu by firing a `contextmenu` event on the trigger region. */
function openContextMenu(target: HTMLElement): void {
  fireEvent.contextMenu(target)
}

/**
 * Move the roving highlight onto the first item. A pointer-opened context
 * menu opens with no highlighted item, and Base UI attaches the menu's
 * keydown handler in an effect after the popup mounts — so a key pressed the
 * instant the menu appears can be dropped. `Home` always targets the first
 * item and is idempotent, so retrying it inside `waitFor` reliably lands the
 * highlight on the first item once the handler is live.
 */
async function highlightFirstItem(
  user: ReturnType<typeof userEvent.setup>,
  firstItemName: string
): Promise<void> {
  await waitFor(async () => {
    await user.keyboard('{Home}')
    expect(screen.getByRole('menuitem', { name: firstItemName })).toHaveFocus()
  })
}

describe('ContextMenu opening', () => {
  it('opens on the contextmenu event (right click / long press / Shift+F10)', async () => {
    render(<ActionsContextMenu />)
    // No menu until the gesture fires.
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    openContextMenu(screen.getByRole('button', { name: 'Report card' }))
    expect(await screen.findByRole('menu')).toBeInTheDocument()
  })

  // The keyboard path is the browser dispatching a `contextmenu` event at the
  // focused element (Shift+F10 / Menu key), which bubbles to the trigger
  // region's handler. jsdom does not translate those key presses into a
  // contextmenu event, so we assert the equivalent bubbled event here; the
  // real Shift+F10 path is verified in browser/AT testing.
  it('opens from a contextmenu event dispatched at a focused child (keyboard equivalent)', async () => {
    render(<ActionsContextMenu />)
    const control = screen.getByRole('button', { name: 'Report card' })
    control.focus()
    expect(control).toHaveFocus()

    fireEvent.contextMenu(control)
    expect(await screen.findByRole('menu')).toBeInTheDocument()
  })
})

describe('ContextMenu name/role/value', () => {
  it('exposes a menu with menuitem roles', async () => {
    render(<ActionsContextMenu />)
    openContextMenu(screen.getByRole('button', { name: 'Report card' }))
    await screen.findByRole('menu')

    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getAllByRole('menuitem')).toHaveLength(4)
  })

  it('marks the disabled item aria-disabled and never activates it', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <button type="button">Anchor</button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem disabled onSelect={onSelect}>
            Archive
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
    openContextMenu(screen.getByRole('button', { name: 'Anchor' }))
    const archive = await screen.findByRole('menuitem', { name: 'Archive' })
    expect(archive).toHaveAttribute('aria-disabled', 'true')

    await user.click(archive)
    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('renders a destructive item that activates and closes the menu', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <button type="button">Anchor</button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem variant="destructive" onSelect={onDelete}>
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
    openContextMenu(screen.getByRole('button', { name: 'Anchor' }))
    const del = await screen.findByRole('menuitem', { name: 'Delete' })

    await user.click(del)
    expect(onDelete).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  })
})

describe('ContextMenu keyboard contract (APG menu, once open)', () => {
  it('roves with Down/Up across items, including the focusable-but-inert disabled item', async () => {
    const user = userEvent.setup()
    render(<ActionsContextMenu />)
    openContextMenu(screen.getByRole('button', { name: 'Report card' }))
    await screen.findByRole('menu')

    // A pointer-opened context menu opens without a highlighted item; move the
    // roving focus onto the first item, then rove down from there.
    await highlightFirstItem(user, 'Edit')

    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus()

    // Disabled items stay reachable by the arrow keys (APG focusable-disabled).
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Archive' })).toHaveFocus()

    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus()
  })

  it('Enter activates the highlighted item and closes the menu', async () => {
    const user = userEvent.setup()
    const onSelectEdit = vi.fn()
    render(<ActionsContextMenu onSelectEdit={onSelectEdit} />)
    openContextMenu(screen.getByRole('button', { name: 'Report card' }))
    await screen.findByRole('menu')

    await highlightFirstItem(user, 'Edit')

    await user.keyboard('{Enter}')
    expect(onSelectEdit).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  })

  it('Escape closes the menu and returns focus to the trigger region', async () => {
    const user = userEvent.setup()
    render(<ActionsContextMenu />)
    const control = screen.getByRole('button', { name: 'Report card' })
    control.focus()
    openContextMenu(control)
    await screen.findByRole('menu')

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    // Focus returns into the trigger region (the focusable control inside it).
    await waitFor(() => expect(control).toHaveFocus())
  })
})

describe('ContextMenu submenus', () => {
  function SubmenuExample(): React.JSX.Element {
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <button type="button">Anchor</button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy link</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Send to</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Email</ContextMenuItem>
              <ContextMenuItem>Message</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  it('Right Arrow opens the submenu and Left Arrow closes it', async () => {
    const user = userEvent.setup()
    render(<SubmenuExample />)
    openContextMenu(screen.getByRole('button', { name: 'Anchor' }))
    await screen.findByRole('menu')

    const subTrigger = screen.getByRole('menuitem', { name: 'Send to' })
    expect(subTrigger).toHaveAttribute('aria-haspopup', 'menu')
    // Re-focus the submenu trigger on each retry so a keydown dropped before
    // the menu's handler is attached does not overshoot into the submenu.
    await waitFor(async () => {
      screen.getByRole('menuitem', { name: 'Send to' }).focus()
      await user.keyboard('{ArrowRight}')
      expect(screen.getByRole('menuitem', { name: 'Email' })).toBeInTheDocument()
    })

    await user.keyboard('{ArrowLeft}')
    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: 'Email' })).not.toBeInTheDocument()
    })
  })
})

describe('ContextMenu accessibility (axe)', () => {
  it('is axe-clean while closed (trigger region only)', async () => {
    const { container } = render(<ActionsContextMenu />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean while open', async () => {
    render(<ActionsContextMenu />)
    openContextMenu(screen.getByRole('button', { name: 'Report card' }))
    await screen.findByRole('menu')
    // Base UI portals the popup to document.body; the page-level `region`
    // best-practice rule can never be satisfied by an isolated, landmark-less
    // test page, so it is disabled (the popup is a valid role=menu).
    expect(
      await axeCheck(document.body, { rules: { region: { enabled: false } } })
    ).toHaveNoViolations()
  })
})

describe('ContextMenu RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    render(
      <DirectionProvider direction="rtl">
        <div dir="rtl" lang="ar">
          <ContextMenu>
            <ContextMenuTrigger>
              <button type="button">بطاقة</button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>تحرير</ContextMenuItem>
              <ContextMenuItem variant="destructive">حذف</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </DirectionProvider>
    )
    openContextMenu(screen.getByRole('button', { name: 'بطاقة' }))
    await screen.findByRole('menu')
    expect(
      await axeCheck(document.body, { rules: { region: { enabled: false } } })
    ).toHaveNoViolations()
  })
})
