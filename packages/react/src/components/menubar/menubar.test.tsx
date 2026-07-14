// SPDX-License-Identifier: MIT

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/components/menubar'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

// When a menu is open, Base UI bridges the portalled popup back to the
// role=menubar with an internal `<span aria-owns>` focus-guard sibling. axe's
// aria-required-children counts that Base UI-authored span as a disallowed
// menubar child (a menubar "should" contain only menuitem-type children). It is
// framework a11y wiring, not our markup — the closed-bar and RTL tests below
// exercise aria-required-children in full — so we scope only that rule off for
// the open-popup snapshots while keeping every other axe rule live. (Rules are
// replaced wholesale, so color-contrast is re-disabled here too, matching the
// harness default.)
const OPEN_MENU_AXE = {
  rules: {
    'color-contrast': { enabled: false },
    'aria-required-children': { enabled: false },
  },
}

function FileEditView(): React.JSX.Element {
  return (
    <Menubar aria-label="Main">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem shortcut={<MenubarShortcut keys={['mod', 'N']} />}>New</MenubarItem>
          <MenubarItem shortcut={<MenubarShortcut keys={['mod', 'S']} />}>Save</MenubarItem>
          <MenubarSeparator />
          <MenubarItem variant="destructive">Delete</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem disabled>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Zoom in</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

describe('Menubar accessibility (axe)', () => {
  it('closed bar is axe-clean', async () => {
    const { container } = render(<FileEditView />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('an open menu is axe-clean', async () => {
    const { container } = render(
      <Menubar aria-label="Main">
        <MenubarMenu defaultOpen>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem shortcut={<MenubarShortcut keys={['mod', 'S']} />}>Save</MenubarItem>
            <MenubarItem disabled>Print</MenubarItem>
            <MenubarSeparator />
            <MenubarItem variant="destructive">Delete</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )
    // Wait for the popup to mount.
    await screen.findByRole('menu')
    expect(await axeCheck(container, OPEN_MENU_AXE)).toHaveNoViolations()
  })

  it('checkbox and radio items are axe-clean when open', async () => {
    const { container } = render(
      <Menubar aria-label="View">
        <MenubarMenu defaultOpen>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem defaultChecked>Show grid</MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarRadioGroup defaultValue="comfortable">
              <MenubarRadioItem value="comfortable">Comfortable</MenubarRadioItem>
              <MenubarRadioItem value="compact">Compact</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )
    await screen.findByRole('menu')
    expect(await axeCheck(container, OPEN_MENU_AXE)).toHaveNoViolations()
  })

  it('stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <Menubar aria-label="الرئيسية">
          <MenubarMenu>
            <MenubarTrigger>ملف</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>جديد</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Menubar structure and roles', () => {
  it('renders role=menubar with a horizontal orientation by default', () => {
    render(<FileEditView />)
    const bar = screen.getByRole('menubar', { name: 'Main' })
    expect(bar).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('exposes each top menu as a menuitem with a popup', () => {
    render(<FileEditView />)
    const file = screen.getByRole('menuitem', { name: 'File' })
    expect(file).toHaveAttribute('aria-haspopup', 'menu')
    expect(file).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens a top menu on click and reveals its items', async () => {
    const user = userEvent.setup()
    render(<FileEditView />)

    await user.click(screen.getByRole('menuitem', { name: 'File' }))
    const menu = await screen.findByRole('menu')
    expect(within(menu).getByRole('menuitem', { name: /New/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'File' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
  })
})

describe('Menubar keyboard contract', () => {
  it('uses a roving tabindex: only the first top menu is a tab stop', () => {
    render(<FileEditView />)
    const [file, edit, view] = screen.getAllByRole('menuitem')
    expect(file).toHaveAttribute('tabindex', '0')
    expect(edit).toHaveAttribute('tabindex', '-1')
    expect(view).toHaveAttribute('tabindex', '-1')
  })

  it('Left/Right Arrow rove between the top menus', async () => {
    const user = userEvent.setup()
    render(<FileEditView />)

    await user.tab()
    expect(screen.getByRole('menuitem', { name: 'File' })).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus()

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('menuitem', { name: 'File' })).toHaveFocus()
  })

  it('Down Arrow opens the focused top menu onto its first item', async () => {
    const user = userEvent.setup()
    render(<FileEditView />)

    await user.tab()
    await user.keyboard('{ArrowDown}')
    const menu = await screen.findByRole('menu')
    expect(within(menu).getByRole('menuitem', { name: /New/ })).toHaveFocus()
  })

  it('Escape closes the open menu and returns focus to its top menu', async () => {
    const user = userEvent.setup()
    render(<FileEditView />)

    await user.click(screen.getByRole('menuitem', { name: 'File' }))
    await screen.findByRole('menu')
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'File' })).toHaveFocus()
  })
})

describe('Menubar items', () => {
  it('fires onSelect and closes the menu on activation', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <Menubar aria-label="Main">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onSelect={onSelect}>Save</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )

    await user.click(screen.getByRole('menuitem', { name: 'File' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Save' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('does not activate a disabled item', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <Menubar aria-label="Main">
        <MenubarMenu defaultOpen>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled onSelect={onSelect}>
              Redo
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )

    const redo = await screen.findByRole('menuitem', { name: 'Redo' })
    expect(redo).toHaveAttribute('aria-disabled', 'true')
    await user.click(redo)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('keeps the accessible name free of the decorative shortcut', async () => {
    render(
      <Menubar aria-label="Main">
        <MenubarMenu defaultOpen>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem shortcut={<MenubarShortcut keys={['mod', 'S']} />}>Save</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )
    // The Kbd shortcut is aria-hidden, so the name stays the command label.
    expect(await screen.findByRole('menuitem', { name: 'Save' })).toBeInTheDocument()
  })

  it('toggles a checkbox item via aria-checked and stays open', async () => {
    const user = userEvent.setup()
    render(
      <Menubar aria-label="View">
        <MenubarMenu defaultOpen>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem>Show grid</MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )

    const item = await screen.findByRole('menuitemcheckbox', { name: 'Show grid' })
    expect(item).toHaveAttribute('aria-checked', 'false')
    await user.click(item)
    expect(screen.getByRole('menuitemcheckbox', { name: 'Show grid' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    // Checkbox items stay open by default.
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('selects one radio item at a time', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Menubar aria-label="View">
        <MenubarMenu defaultOpen>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup defaultValue="comfortable" onValueChange={onValueChange}>
              <MenubarRadioItem value="comfortable">Comfortable</MenubarRadioItem>
              <MenubarRadioItem value="compact">Compact</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )

    const comfortable = await screen.findByRole('menuitemradio', { name: 'Comfortable' })
    expect(comfortable).toHaveAttribute('aria-checked', 'true')
    await user.click(screen.getByRole('menuitemradio', { name: 'Compact' }))
    expect(onValueChange).toHaveBeenCalledWith('compact', expect.anything())
  })
})

describe('Menubar controlled open state', () => {
  it('honors the controlled open prop and reports close requests', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    function Controlled(): React.JSX.Element {
      const [open, setOpen] = React.useState(true)
      return (
        <>
          <button type="button" onClick={() => setOpen(false)}>
            close externally
          </button>
          <Menubar aria-label="Main">
            <MenubarMenu
              open={open}
              onOpenChange={(next) => {
                onOpenChange(next)
                setOpen(next)
              }}
            >
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>New</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </>
      )
    }

    render(<Controlled />)
    // The controlled `open={true}` renders the menu open without interaction.
    expect(await screen.findByRole('menu')).toBeInTheDocument()

    // Escape is a close request: it fires onOpenChange even under control.
    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    // Driving the controlled prop from outside also closes it (idempotent here).
    await user.click(screen.getByRole('button', { name: 'close externally' }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})

describe('Menubar forced-colors safety', () => {
  it('keeps a border on the bar and pairs the open top menu highlight with a weight bump', () => {
    render(<FileEditView />)
    expect(screen.getByRole('menubar').className).toContain('border')
    const file = screen.getByRole('menuitem', { name: 'File' })
    // Highlight/open state is never color alone: it carries font-medium too.
    expect(file.className).toContain('font-medium')
    expect(file.className).toContain('data-[popup-open]:bg-muted')
  })
})
