// SPDX-License-Identifier: MIT

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CharacterCount } from '@/components/character-count'
import { FieldProvider } from '@/components/field/context'
import { Input } from '@/components/input'
import { Textarea } from '@/components/input/textarea'
import { getFocusable } from '../../../test/keyboard.js'
import { axeCheck } from '../../../test/setup.js'

/**
 * The visible count and the sr-only live region hold the same text, so
 * queries must target the visible message by its slot to stay unambiguous.
 */
const MESSAGE = { selector: '[data-slot="character-count-message"]' } as const

/** A labeled Textarea wrapped in a CharacterCount, since a control without a name is an axe failure. */
function LabeledCount(
  props: Partial<React.ComponentProps<typeof CharacterCount>> & { maxLength?: number }
): React.JSX.Element {
  const { maxLength = 20, children, ...rest } = props
  return (
    <div>
      <label htmlFor="comment">Comment</label>
      <CharacterCount maxLength={maxLength} {...rest}>
        {children ?? <Textarea id="comment" />}
      </CharacterCount>
    </div>
  )
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('CharacterCount accessibility (axe)', () => {
  it('default (under limit) is axe-clean', async () => {
    const { container } = render(<LabeledCount />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('over the limit is axe-clean', async () => {
    const { container } = render(<LabeledCount maxLength={5} value="way too long" />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('wrapping an Input is axe-clean', async () => {
    const { container } = render(
      <div>
        <label htmlFor="title">Title</label>
        <CharacterCount maxLength={10}>
          <Input id="title" />
        </CharacterCount>
      </div>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('inside a Field is axe-clean', async () => {
    const { container } = render(
      <FieldProvider id="bio" hasHint>
        <label htmlFor="bio">Bio</label>
        <p id="bio-hint">Tell us about yourself.</p>
        <CharacterCount maxLength={30}>
          <Textarea />
        </CharacterCount>
      </FieldProvider>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('CharacterCount name, role, and value', () => {
  it('keeps the wrapped control a native textbox with its accessible name', () => {
    render(<LabeledCount />)
    const control = screen.getByRole('textbox', { name: 'Comment' })
    expect(control.tagName).toBe('TEXTAREA')
  })

  it('links the visible count to the control via aria-describedby', () => {
    render(<LabeledCount />)
    const control = screen.getByRole('textbox', { name: 'Comment' })
    const message = screen.getByText('20 characters left', MESSAGE)
    const describedBy = control.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(describedBy!.split(' ')).toContain(message.id)
  })

  it('preserves the control existing aria-describedby and appends the count id', () => {
    render(
      <div>
        <label htmlFor="c">Comment</label>
        <p id="c-hint">Keep it short.</p>
        <CharacterCount maxLength={20}>
          <Textarea id="c" aria-describedby="c-hint" />
        </CharacterCount>
      </div>
    )
    const control = screen.getByRole('textbox', { name: 'Comment' })
    const ids = control.getAttribute('aria-describedby')!.split(' ')
    expect(ids).toContain('c-hint')
    expect(ids.length).toBe(2)
  })
})

describe('CharacterCount count behavior', () => {
  it('updates the remaining count as the user types (uncontrolled)', async () => {
    const user = userEvent.setup()
    render(<LabeledCount maxLength={10} />)

    expect(screen.getByText('10 characters left', MESSAGE)).toBeInTheDocument()
    await user.type(screen.getByRole('textbox'), 'abc')
    expect(screen.getByText('7 characters left', MESSAGE)).toBeInTheDocument()
  })

  it('seeds the count from defaultValue', () => {
    render(<LabeledCount maxLength={10} defaultValue="abcd" />)
    expect(screen.getByText('6 characters left', MESSAGE)).toBeInTheDocument()
  })

  it('derives the count from a controlled value prop', () => {
    render(<LabeledCount maxLength={10} value="hello" />)
    expect(screen.getByText('5 characters left', MESSAGE)).toBeInTheDocument()
  })

  it('calls the wrapped control own onChange as well as onValueChange', async () => {
    const user = userEvent.setup()
    const childOnChange = vi.fn()
    const onValueChange = vi.fn()
    render(
      <div>
        <label htmlFor="c">Comment</label>
        <CharacterCount maxLength={10} onValueChange={onValueChange}>
          <Textarea id="c" onChange={childOnChange} />
        </CharacterCount>
      </div>
    )
    await user.type(screen.getByRole('textbox'), 'x')
    expect(childOnChange).toHaveBeenCalled()
    expect(onValueChange).toHaveBeenCalledWith('x')
  })
})

describe('CharacterCount over-limit state', () => {
  it('switches to the over-limit message past the limit', () => {
    render(<LabeledCount maxLength={5} value="abcdefgh" />)
    expect(screen.getByText('3 characters over limit', MESSAGE)).toBeInTheDocument()
  })

  it('marks the wrapped control aria-invalid when over the limit', () => {
    render(<LabeledCount maxLength={5} value="abcdefgh" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not mark the control invalid while within the limit', () => {
    render(<LabeledCount maxLength={5} value="abc" />)
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
  })

  it('signals over-limit with more than color (error token plus font weight on the message)', () => {
    render(<LabeledCount maxLength={5} value="abcdefgh" />)
    const message = screen.getByText('3 characters over limit', MESSAGE)
    expect(message).toHaveAttribute('data-invalid')
    // Non-color redundancy: weight change on the message and aria-invalid on
    // the control (the control's error ring), not color alone.
    expect(message.className).toContain('font-semibold')
    expect(message.className).toContain('text-error-foreground')
  })
})

describe('CharacterCount template overrides', () => {
  it('honors a custom messageTemplate with {remaining} and {max} tokens', () => {
    render(
      <LabeledCount
        maxLength={100}
        value="hi"
        messageTemplate="{remaining} of {max} characters remaining"
      />
    )
    expect(screen.getByText('98 of 100 characters remaining', MESSAGE)).toBeInTheDocument()
  })

  it('honors a custom overMessageTemplate with the {over} token', () => {
    render(
      <LabeledCount maxLength={3} value="abcde" overMessageTemplate="Remove {over} characters" />
    )
    expect(screen.getByText('Remove 2 characters', MESSAGE)).toBeInTheDocument()
  })
})

describe('CharacterCount live-region announcement', () => {
  it('renders a polite live region that is present before content changes', () => {
    const { container } = render(<LabeledCount maxLength={10} />)
    const status = container.querySelector('[data-slot="character-count-status"]')
    expect(status).not.toBeNull()
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveClass('sr-only')
  })

  it('debounces the announced count: it settles only after the delay, not per keystroke', () => {
    vi.useFakeTimers()
    const { container, rerender } = render(
      <LabeledCount maxLength={10} value="" announceDelay={500} />
    )
    const status = container.querySelector('[data-slot="character-count-status"]')!

    // Type "abc" via a controlled value change.
    rerender(<LabeledCount maxLength={10} value="abc" announceDelay={500} />)

    // The visible message updates immediately…
    expect(screen.getByText('7 characters left', MESSAGE)).toBeInTheDocument()
    // …but the polite region has not re-announced yet (still the initial text).
    expect(status).toHaveTextContent('10 characters left')

    // After the pause, the live region catches up to the final value.
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(status).toHaveTextContent('7 characters left')
  })
})

describe('CharacterCount soft vs hard limit', () => {
  it('does not set the native maxlength by default (soft limit)', () => {
    render(<LabeledCount maxLength={5} />)
    expect(screen.getByRole('textbox')).not.toHaveAttribute('maxlength')
  })

  it('sets the native maxlength when enforce is set (hard limit)', () => {
    render(<LabeledCount maxLength={5} enforce />)
    expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '5')
  })
})

describe('CharacterCount RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <label htmlFor="rtl-comment">تعليق</label>
        <CharacterCount maxLength={10} value="مرحبا">
          <Textarea id="rtl-comment" />
        </CharacterCount>
      </div>
    )
    expect(screen.getByRole('textbox', { name: 'تعليق' })).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('CharacterCount keyboard contract (verified)', () => {
  // Verifies accessibility.keyboard: the wrapper adds no tab stop; the wrapped control is the only one.
  it('adds no tab stop of its own — the wrapped control is the single tab stop', () => {
    const { container } = render(<LabeledCount />)
    const focusable = getFocusable(container)
    expect(focusable).toHaveLength(1)
    expect(focusable[0]).toHaveAttribute('id', 'comment')
  })
})
