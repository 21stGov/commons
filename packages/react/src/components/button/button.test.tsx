// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Button, type ButtonProps } from '@/components/button'
import { axeCheck } from '../../../test/setup.js'

const VARIANTS = [
  'primary',
  'secondary',
  'outline',
  'ghost',
  'danger',
] as const satisfies readonly NonNullable<ButtonProps['variant']>[]

const SIZES = ['sm', 'md', 'lg'] as const satisfies readonly NonNullable<ButtonProps['size']>[]

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Button accessibility (axe)', () => {
  for (const variant of VARIANTS) {
    it(`variant "${variant}" is axe-clean`, async () => {
      const { container } = render(<Button variant={variant}>Save</Button>)
      expect(await axeCheck(container)).toHaveNoViolations()
    })
  }

  for (const size of SIZES) {
    it(`size "${size}" is axe-clean`, async () => {
      const { container } = render(<Button size={size}>Save</Button>)
      expect(await axeCheck(container)).toHaveNoViolations()
    })
  }

  it('loading state is axe-clean', async () => {
    const { container } = render(<Button loading>Save</Button>)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('disabled state is axe-clean', async () => {
    const { container } = render(<Button disabled>Save</Button>)
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Button name, role, and value', () => {
  it('renders a native button with role button and its accessible name', () => {
    render(<Button>Save changes</Button>)

    const button = screen.getByRole('button', { name: 'Save changes' })
    expect(button.tagName).toBe('BUTTON')
    expect(button).toHaveAttribute('data-slot', 'button')
  })

  it('defaults type to button so it never submits a form accidentally', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('respects an explicit type', () => {
    render(<Button type="submit">Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('optically centers text while leaving icon-only artwork geometrically centered', () => {
    const { rerender } = render(<Button>Submit request</Button>)
    expect(screen.getByText('Submit request')).toHaveClass('[inset-block-start:0.0625em]')

    rerender(<Button aria-label="Search"><svg aria-hidden="true" /></Button>)
    expect(screen.getByRole('button', { name: 'Search' }).querySelector('[data-slot="button-content"]'))
      .toHaveClass('[&:has(>svg:only-child)]:[inset-block-start:0]')
  })

  it('supports icon-only usage via aria-label without warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <Button aria-label="Search">
        <svg aria-hidden="true" />
      </Button>
    )

    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
    expect(warn).not.toHaveBeenCalled()
  })

  it('warns in development when a button has no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <Button>
        <svg aria-hidden="true" />
      </Button>
    )

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })
})

describe('Button keyboard contract', () => {
  it('activates with Enter', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)

    await user.tab()
    expect(screen.getByRole('button')).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('activates with Space', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)

    await user.tab()
    await user.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('activates on click', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)

    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('Button loading state', () => {
  it('sets aria-busy and aria-disabled but not disabled', () => {
    render(<Button loading>Save</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).not.toBeDisabled()
    expect(button).toHaveAttribute('data-loading')
  })

  it('remains focusable while loading', async () => {
    const user = userEvent.setup()
    render(<Button loading>Save</Button>)

    await user.tab()
    expect(screen.getByRole('button')).toHaveFocus()
  })

  it('suppresses click activation while loading', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>
    )

    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('suppresses Enter and Space activation while loading', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>
    )

    await user.tab()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('announces the default visually hidden loading label', () => {
    render(<Button loading>Save</Button>)
    expect(screen.getByText('Loading')).toHaveClass('sr-only')
  })

  it('accepts a translated loading label', () => {
    render(
      <Button loading loadingLabel="Cargando">
        Guardar
      </Button>
    )
    expect(screen.getByText('Cargando')).toHaveClass('sr-only')
  })

  it('keeps the accessible name while loading', () => {
    render(<Button loading>Save</Button>)
    expect(screen.getByRole('button', { name: /Save/ })).toBeInTheDocument()
  })

  it('overlays the spinner without adding it to the intrinsic button width', () => {
    const { container } = render(<Button loading>Save</Button>)
    const spinner = container.querySelector('[data-slot="button-spinner"]')
    const content = container.querySelector('[data-slot="button-content"]')

    expect(spinner).toHaveClass('absolute', 'inset-0')
    expect(content).toHaveClass('invisible')
    expect(content).toHaveTextContent('Save')
  })
})

describe('Button RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <Button variant="primary">حفظ</Button>
      </div>
    )

    expect(screen.getByRole('button', { name: 'حفظ' })).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
