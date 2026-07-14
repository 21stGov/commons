// SPDX-License-Identifier: MIT

import { DirectionProvider } from '@base-ui/react/direction-provider'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/dropdown-menu'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

/**
 * Open the menu from its trigger via the keyboard and wait until the roving
 * focus has landed on the first item — the APG "open moves focus to the
 * first item" behavior only fires on an open *event*, not on `defaultOpen`.
 */
async function openMenuFromTrigger(
  user: ReturnType<typeof userEvent.setup>,
  firstItemName: string
): Promise<void> {
  const trigger = screen.getByRole('button', { name: 'Actions' })
  trigger.focus()
  await user.keyboard('{Enter}')
  await screen.findByRole('menu')
  await waitFor(() => {
    expect(screen.getByRole('menuitem', { name: firstItemName })).toHaveFocus()
  })
}

/** An actions menu used across many tests. */
function ActionsMenu(props: {
  defaultOpen?: boolean
  onSelectEdit?: () => void
}): React.JSX.Element {
  return (
    <DropdownMenu defaultOpen={props.defaultOpen}>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={props.onSelectEdit}>Edit</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem disabled>Archive</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

describe('DropdownMenu accessibility (axe)', () => {
  it('is axe-clean while closed (trigger only)', async () => {
    const { container } = render(<ActionsMenu />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean while open, including checkbox and radio items', async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>View</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Columns</DropdownMenuLabel>
            <DropdownMenuCheckboxItem defaultChecked>Status</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Owner</DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup defaultValue="name">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(await screen.findByRole('menu')).toBeInTheDocument()
    // Base UI portals the popup to document.body. The "region" rule is a
    // page-level best-practice check (all content inside a landmark) that an
    // isolated, landmark-less test page can never satisfy — it is not a
    // defect of the menu, whose popup is correctly a role=menu associated to
    // the trigger via aria-controls / aria-expanded.
    expect(
      await axeCheck(document.body, { rules: { region: { enabled: false } } })
    ).toHaveNoViolations()
  })
})

describe('DropdownMenu trigger name/role/value', () => {
  it('exposes aria-haspopup=menu and toggles aria-expanded', async () => {
    const user = userEvent.setup()
    render(<ActionsMenu />)

    const trigger = screen.getByRole('button', { name: 'Actions' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    expect(await screen.findByRole('menu')).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('renders items with the menuitem role', async () => {
    render(<ActionsMenu defaultOpen />)
    await screen.findByRole('menu')
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getAllByRole('menuitem')).toHaveLength(4)
  })
})

describe('DropdownMenu keyboard contract (APG menu button)', () => {
  it('opens on Enter from the trigger and moves focus to the first item', async () => {
    const user = userEvent.setup()
    render(<ActionsMenu />)

    const trigger = screen.getByRole('button', { name: 'Actions' })
    trigger.focus()
    await user.keyboard('{Enter}')

    await screen.findByRole('menu')
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus()
    })
  })

  it('roves with Down/Up across items, including the focusable-but-inert disabled item', async () => {
    const user = userEvent.setup()
    render(<ActionsMenu />)
    await openMenuFromTrigger(user, 'Edit')

    const duplicate = screen.getByRole('menuitem', { name: 'Duplicate' })
    const archive = screen.getByRole('menuitem', { name: 'Archive' })
    const del = screen.getByRole('menuitem', { name: 'Delete' })

    await user.keyboard('{ArrowDown}')
    expect(duplicate).toHaveFocus()

    // Base UI keeps disabled items reachable by the arrow keys (the
    // APG-permitted "focusable disabled" pattern that aids discoverability);
    // they carry aria-disabled and cannot be activated (covered separately).
    await user.keyboard('{ArrowDown}')
    expect(archive).toHaveFocus()
    expect(archive).toHaveAttribute('aria-disabled', 'true')

    await user.keyboard('{ArrowDown}')
    expect(del).toHaveFocus()

    await user.keyboard('{ArrowUp}')
    expect(archive).toHaveFocus()
  })

  it('supports Home and End', async () => {
    const user = userEvent.setup()
    render(<ActionsMenu />)
    await openMenuFromTrigger(user, 'Edit')

    await user.keyboard('{End}')
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus()

    await user.keyboard('{Home}')
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus()
  })

  it('typeahead moves the highlight by first character', async () => {
    const user = userEvent.setup()
    render(<ActionsMenu />)
    await openMenuFromTrigger(user, 'Edit')

    await user.keyboard('d')
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus()
  })

  it('Enter activates the highlighted item and closes the menu', async () => {
    const user = userEvent.setup()
    const onSelectEdit = vi.fn()
    render(<ActionsMenu onSelectEdit={onSelectEdit} />)
    await openMenuFromTrigger(user, 'Edit')

    await user.keyboard('{Enter}')
    expect(onSelectEdit).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  it('Escape closes the menu and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    render(<ActionsMenu />)

    const trigger = screen.getByRole('button', { name: 'Actions' })
    await user.click(trigger)
    await screen.findByRole('menu')

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(trigger).toHaveFocus()
    })
  })

  it('does not activate a disabled item', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled onSelect={onSelect}>
            Archive
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    const archive = await screen.findByRole('menuitem', { name: 'Archive' })
    await user.click(archive)
    expect(onSelect).not.toHaveBeenCalled()
    // Menu stays open — the disabled item never activated.
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })
})

describe('DropdownMenu checkbox items', () => {
  it('exposes menuitemcheckbox with aria-checked and toggles state', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()

    function CheckboxMenu(): React.JSX.Element {
      const [checked, setChecked] = React.useState(false)
      return (
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>View</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={checked}
              onCheckedChange={(next) => {
                onCheckedChange(next)
                setChecked(next)
              }}
            >
              Show status
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    render(<CheckboxMenu />)
    const item = await screen.findByRole('menuitemcheckbox', { name: 'Show status' })
    expect(item).toHaveAttribute('aria-checked', 'false')

    await user.click(item)
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)
    await waitFor(() => {
      expect(
        screen.getByRole('menuitemcheckbox', { name: 'Show status' })
      ).toHaveAttribute('aria-checked', 'true')
    })
    // Stays open by default so several boxes can be flipped in one visit.
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })
})

describe('DropdownMenu radio items', () => {
  it('exposes menuitemradio with aria-checked and selects one value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    function RadioMenu(): React.JSX.Element {
      const [value, setValue] = React.useState('name')
      return (
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Sort</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              value={value}
              onValueChange={(next) => {
                onValueChange(next)
                setValue(next)
              }}
            >
              <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    render(<RadioMenu />)
    const name = await screen.findByRole('menuitemradio', { name: 'Name' })
    const date = screen.getByRole('menuitemradio', { name: 'Date' })
    expect(name).toHaveAttribute('aria-checked', 'true')
    expect(date).toHaveAttribute('aria-checked', 'false')

    await user.click(date)
    expect(onValueChange).toHaveBeenLastCalledWith('date')
    await waitFor(() => {
      expect(screen.getByRole('menuitemradio', { name: 'Date' })).toHaveAttribute(
        'aria-checked',
        'true'
      )
    })
  })
})

describe('DropdownMenu group labelling', () => {
  it('associates the label with its group via aria-labelledby', async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>View</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Columns</DropdownMenuLabel>
            <DropdownMenuCheckboxItem>Owner</DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    await screen.findByRole('menu')
    const group = screen.getByRole('group', { name: 'Columns' })
    expect(group).toBeInTheDocument()
  })
})

describe('DropdownMenu submenus', () => {
  function SubmenuExample(): React.JSX.Element {
    return (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Share</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Copy link</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Send to</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Email</DropdownMenuItem>
              <DropdownMenuItem>Message</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  it('submenu trigger exposes aria-haspopup=menu and aria-expanded', async () => {
    render(<SubmenuExample />)
    await screen.findByRole('menu')
    const subTrigger = screen.getByRole('menuitem', { name: 'Send to' })
    expect(subTrigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(subTrigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('Right Arrow opens the submenu and Left Arrow closes it', async () => {
    const user = userEvent.setup()
    render(<SubmenuExample />)
    await screen.findByRole('menu')

    const subTrigger = screen.getByRole('menuitem', { name: 'Send to' })
    subTrigger.focus()
    await user.keyboard('{ArrowRight}')

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Email' })).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(subTrigger).toHaveAttribute('aria-expanded', 'true')
    })

    await user.keyboard('{ArrowLeft}')
    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: 'Email' })).not.toBeInTheDocument()
    })
  })

  it('is axe-clean with the submenu open', async () => {
    const user = userEvent.setup()
    render(<SubmenuExample />)
    await screen.findByRole('menu')

    const subTrigger = screen.getByRole('menuitem', { name: 'Send to' })
    subTrigger.focus()
    await user.keyboard('{ArrowRight}')
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Email' })).toBeInTheDocument()
    })
    // `region` is disabled for the same portalled-page reason as above. Base
    // UI also injects an `aria-owns` bridge span (flanked by focus guards)
    // between the submenu trigger and its portalled popup to reparent it in
    // the accessibility tree; axe's static `aria-required-children` cannot
    // resolve through that generic bridge in jsdom, so it reports the span as
    // a disallowed menu child. Each menu surface is itself a valid role=menu
    // of menuitems (asserted by role above and by the standalone scans), and
    // real assistive tech follows the aria-owns relationship correctly.
    expect(
      await axeCheck(document.body, {
        rules: { region: { enabled: false }, 'aria-required-children': { enabled: false } },
      })
    ).toHaveNoViolations()
  })
})

describe('DropdownMenu RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document, and the submenu arrow keys flip', async () => {
    const user = userEvent.setup()
    document.documentElement.setAttribute('dir', 'rtl')
    try {
      render(
        // Base UI resolves logical sides and arrow-key direction from its
        // DirectionProvider (not the DOM `dir` alone), so an RTL app wraps
        // its tree in one. With it, the submenu opens toward the inline end
        // (physical left in RTL) and Left Arrow — not Right — opens it.
        <DirectionProvider direction="rtl">
          <div dir="rtl" lang="ar">
            <DropdownMenu defaultOpen>
              <DropdownMenuTrigger>إجراءات</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>تحرير</DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>مشاركة</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>بريد</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DirectionProvider>
      )

      await screen.findByRole('menu')
      expect(
        await axeCheck(document.body, { rules: { region: { enabled: false } } })
      ).toHaveNoViolations()

      // In RTL the submenu opens with the mirrored arrow key (Left opens).
      const subTrigger = screen.getByRole('menuitem', { name: 'مشاركة' })
      subTrigger.focus()
      await user.keyboard('{ArrowLeft}')
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: 'بريد' })).toBeInTheDocument()
      })
      const positioner = document.querySelector('[data-slot="dropdown-menu-sub-positioner"]')
      expect(positioner).not.toBeNull()
    } finally {
      document.documentElement.removeAttribute('dir')
    }
  })
})
