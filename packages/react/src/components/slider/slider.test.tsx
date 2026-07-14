// SPDX-License-Identifier: MIT

import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Slider } from '@/components/slider'
import { FieldProvider } from '@/components/field/context'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Slider accessibility (axe)', () => {
  it('default single-thumb state is axe-clean', async () => {
    const { container } = render(<Slider label="Volume" defaultValue={40} />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('range (two-thumb) state is axe-clean', async () => {
    const { container } = render(<Slider label="Price range" defaultValue={[20, 80]} />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('with description and ticks is axe-clean', async () => {
    const { container } = render(
      <Slider label="Volume" description="Adjusts the master volume." defaultValue={50} ticks step={10} />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('with the exact-value number input is axe-clean', async () => {
    const { container } = render(<Slider label="Volume" defaultValue={30} valueInput />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('disabled state is axe-clean', async () => {
    const { container } = render(<Slider label="Volume" defaultValue={40} disabled />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('error state (inside FieldProvider) is axe-clean', async () => {
    const { container } = render(
      <>
        <p id="vol-error">This value is out of range.</p>
        <FieldProvider id="vol" hasError required>
          <Slider label="Volume" defaultValue={40} />
        </FieldProvider>
      </>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Slider name, role, and value', () => {
  it('exposes a single role=slider named by its visible label', () => {
    render(<Slider label="Volume" defaultValue={40} min={0} max={100} />)
    const slider = screen.getByRole('slider', { name: 'Volume' })
    expect(slider).toHaveAttribute('aria-valuenow', '40')
  })

  it('exposes two distinctly named thumbs in range mode', () => {
    render(<Slider label="Price" defaultValue={[20, 80]} />)
    expect(screen.getByRole('slider', { name: 'Price Minimum' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Price Maximum' })).toBeInTheDocument()
  })

  it('reflects min and max on the thumb input', () => {
    render(<Slider label="Volume" defaultValue={40} min={10} max={90} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '10')
    expect(slider).toHaveAttribute('max', '90')
  })

  it('shows a live value readout', () => {
    render(<Slider label="Volume" defaultValue={[20, 60]} />)
    // The <output> joins the two formatted values with an en dash.
    expect(screen.getByText('20 – 60')).toBeInTheDocument()
  })

  it('links the description via aria-describedby without polluting the name', () => {
    render(<Slider label="Volume" description="Master volume." defaultValue={40} />)
    const slider = screen.getByRole('slider', { name: 'Volume' })
    expect(slider).toHaveAccessibleDescription('Master volume.')
  })

  it('conveys value by fill length and thumb position, keeping borders for forced-colors', () => {
    const { container } = render(<Slider label="Volume" defaultValue={40} />)
    const track = container.querySelector('[data-slot="slider-track"]')
    const indicator = container.querySelector('[data-slot="slider-indicator"]')
    const dot = container.querySelector('[data-slot="slider-thumb-dot"]')
    expect(track?.className).toContain('border')
    expect(indicator?.className).toContain('bg-primary')
    expect(dot?.className).toContain('border-2')
  })
})

describe('Slider keyboard contract', () => {
  it('Arrow keys step by the step value', async () => {
    const user = userEvent.setup()
    render(<Slider label="Volume" defaultValue={40} step={5} />)
    const slider = screen.getByRole('slider')

    await user.tab()
    expect(slider).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(slider).toHaveAttribute('aria-valuenow', '45')
    await user.keyboard('{ArrowLeft}')
    expect(slider).toHaveAttribute('aria-valuenow', '40')
  })

  it('Home and End jump to the bounds', async () => {
    const user = userEvent.setup()
    render(<Slider label="Volume" defaultValue={40} min={0} max={100} />)
    const slider = screen.getByRole('slider')

    await user.tab()
    await user.keyboard('{Home}')
    expect(slider).toHaveAttribute('aria-valuenow', '0')
    await user.keyboard('{End}')
    expect(slider).toHaveAttribute('aria-valuenow', '100')
  })

  it('Page Up and Page Down move by the large step', async () => {
    const user = userEvent.setup()
    render(<Slider label="Volume" defaultValue={40} largeStep={10} />)
    const slider = screen.getByRole('slider')

    await user.tab()
    await user.keyboard('{PageUp}')
    expect(slider).toHaveAttribute('aria-valuenow', '50')
    await user.keyboard('{PageDown}')
    expect(slider).toHaveAttribute('aria-valuenow', '40')
  })

  it('a disabled slider is removed from the tab order', async () => {
    const user = userEvent.setup()
    render(<Slider label="Volume" defaultValue={40} disabled />)
    await user.tab()
    expect(screen.getByRole('slider')).not.toHaveFocus()
  })
})

describe('Slider controlled and uncontrolled', () => {
  it('updates an uncontrolled slider on keyboard input', async () => {
    const user = userEvent.setup()
    render(<Slider label="Volume" defaultValue={40} step={1} />)
    const slider = screen.getByRole('slider')

    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(slider).toHaveAttribute('aria-valuenow', '41')
  })

  it('supports a controlled slider via value + onValueChange', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    function Controlled(): React.JSX.Element {
      const [val, setVal] = React.useState(40)
      return (
        <Slider
          label="Volume"
          value={val}
          step={1}
          onValueChange={(next) => {
            onValueChange(next)
            setVal(next as number)
          }}
        />
      )
    }

    render(<Controlled />)
    const slider = screen.getByRole('slider')

    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenCalledWith(41)
    expect(slider).toHaveAttribute('aria-valuenow', '41')
  })
})

describe('Slider exact-value input', () => {
  it('renders a linked number input per thumb that stays in sync', () => {
    render(<Slider label="Volume" defaultValue={40} valueInput />)

    const number = screen.getByRole('spinbutton', { name: 'Exact value' })
    expect(number).toHaveValue(40)

    // Committing an exact value updates the slider thumb.
    fireEvent.change(number, { target: { value: '70' } })
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '70')
  })

  it('renders one number input per thumb in range mode', () => {
    render(<Slider label="Price" defaultValue={[20, 80]} valueInput />)
    expect(screen.getByRole('spinbutton', { name: 'Minimum' })).toHaveValue(20)
    expect(screen.getByRole('spinbutton', { name: 'Maximum' })).toHaveValue(80)
  })

  it('reflects slider changes back into the number input', async () => {
    const user = userEvent.setup()
    render(<Slider label="Volume" defaultValue={40} step={5} valueInput />)

    const slider = screen.getByRole('slider')
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('spinbutton', { name: 'Exact value' })).toHaveValue(45)
    expect(slider).toHaveAttribute('aria-valuenow', '45')
  })

  it('clamps typed values into the allowed range', () => {
    render(<Slider label="Volume" defaultValue={40} min={0} max={100} valueInput />)

    const number = screen.getByRole('spinbutton', { name: 'Exact value' })
    fireEvent.change(number, { target: { value: '500' } })
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '100')
  })
})

describe('Slider dev guard', () => {
  it('warns in development when label is missing or empty', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Slider label={'' as unknown as string} defaultValue={40} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('label'))
  })

  it('does not warn when a label is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Slider label="Volume" defaultValue={40} />)
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('Slider Field wiring', () => {
  it('inherits describedby, invalid, and disabled from the Field contract', () => {
    render(
      <>
        <p id="vol-hint">Optional.</p>
        <p id="vol-error">Something is wrong.</p>
        <FieldProvider id="vol" hasHint hasError required disabled>
          <Slider label="Volume" defaultValue={40} />
        </FieldProvider>
      </>
    )

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-describedby', 'vol-hint vol-error')
    // Disabled comes through from the Field (Base UI marks the input disabled).
    expect(slider).toBeDisabled()
  })

  it('merges its own description before the Field describedby ids', () => {
    render(
      <>
        <p id="vol-hint">Optional.</p>
        <FieldProvider id="vol" hasHint>
          <Slider label="Volume" description="Own description" defaultValue={40} />
        </FieldProvider>
      </>
    )

    const slider = screen.getByRole('slider')
    const describedBy = slider.getAttribute('aria-describedby') ?? ''
    const [descId, ...rest] = describedBy.split(' ')
    expect(document.getElementById(descId)).toHaveTextContent('Own description')
    expect(rest).toEqual(['vol-hint'])
  })

  it('works standalone with a generated id outside any Field', () => {
    render(<Slider label="Volume" description="Own description" defaultValue={40} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAccessibleDescription('Own description')
  })
})

describe('Slider RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <Slider label="مستوى الصوت" description="مستوى الصوت الرئيسي" defaultValue={[20, 70]} />
      </div>
    )
    expect(screen.getByRole('slider', { name: 'مستوى الصوت Minimum' })).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
