// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from '@/components/accordion'
import { axeCheck } from '../../../test/setup.js'

const ITEMS = [
  { value: 'water', question: 'Where do I pay my water bill?', answer: 'Pay online or at City Hall, 100 Main Street.' },
  { value: 'trash', question: 'When is trash collected?', answer: 'Trash is collected every Tuesday morning.' },
  { value: 'permits', question: 'How do I apply for a building permit?', answer: 'Submit the permit application through the online portal.' },
] as const

function FaqAccordion(
  props: Omit<React.ComponentProps<typeof Accordion>, 'children'> = {}
): React.JSX.Element {
  return (
    <Accordion {...props}>
      {ITEMS.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionPanel>{item.answer}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

describe('Accordion accessibility (axe)', () => {
  it('is axe-clean with every panel closed', async () => {
    const { container } = render(<FaqAccordion />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean with panels open', async () => {
    const { container } = render(<FaqAccordion defaultValue={['water', 'trash']} />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean after opening and closing interactively', async () => {
    const user = userEvent.setup()
    const { container } = render(<FaqAccordion />)
    const trigger = screen.getByRole('button', { name: ITEMS[0].question })

    await user.click(trigger)
    expect(await axeCheck(container)).toHaveNoViolations()

    await user.click(trigger)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean in single-open mode', async () => {
    const { container } = render(<FaqAccordion multiple={false} defaultValue={['water']} />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Accordion name, role, and value', () => {
  it('renders each trigger as a native button with its accessible name', () => {
    render(<FaqAccordion />)
    for (const item of ITEMS) {
      const trigger = screen.getByRole('button', { name: item.question })
      expect(trigger.tagName).toBe('BUTTON')
      expect(trigger).toHaveAttribute('data-slot', 'accordion-trigger')
    }
  })

  it('wraps each trigger in a level-3 heading by default', () => {
    render(<FaqAccordion />)
    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings).toHaveLength(ITEMS.length)
    // APG accordion pattern: the heading's only content is the button.
    for (const heading of headings) {
      expect(heading).toHaveAttribute('data-slot', 'accordion-header')
      // eslint-disable-next-line testing-library/no-node-access
      expect(heading.querySelector('button')).not.toBeNull()
    }
  })

  it('respects headingLevel', () => {
    render(
      <Accordion>
        <AccordionItem value="a">
          <AccordionTrigger headingLevel="h2">Section A</AccordionTrigger>
          <AccordionPanel>Content A</AccordionPanel>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger headingLevel="h4">Section B</AccordionTrigger>
          <AccordionPanel>Content B</AccordionPanel>
        </AccordionItem>
      </Accordion>
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Section A' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: 'Section B' })).toBeInTheDocument()
  })

  it('sets aria-expanded on the trigger and toggles it', async () => {
    const user = userEvent.setup()
    render(<FaqAccordion />)
    const trigger = screen.getByRole('button', { name: ITEMS[0].question })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('wires aria-controls to a region labelled by the trigger while open', async () => {
    const user = userEvent.setup()
    render(<FaqAccordion />)
    const trigger = screen.getByRole('button', { name: ITEMS[0].question })

    // Base UI unmounts the closed panel by default, so aria-controls only
    // exists while the panel it references is in the DOM.
    expect(trigger).not.toHaveAttribute('aria-controls')

    await user.click(trigger)
    const panelId = trigger.getAttribute('aria-controls')
    expect(panelId).toBeTruthy()

    const region = screen.getByRole('region', { name: ITEMS[0].question })
    expect(region).toHaveAttribute('id', panelId as string)
    expect(region).toHaveAttribute('aria-labelledby', trigger.id)
  })

  it('removes the closed panel content from the DOM by default', async () => {
    const user = userEvent.setup()
    render(<FaqAccordion />)

    expect(screen.queryByText(ITEMS[0].answer)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: ITEMS[0].question }))
    expect(screen.getByText(ITEMS[0].answer)).toBeInTheDocument()
  })

  it('opens panels listed in defaultValue', () => {
    render(<FaqAccordion defaultValue={['trash']} />)
    expect(screen.getByRole('button', { name: ITEMS[1].question })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    expect(screen.getByText(ITEMS[1].answer)).toBeInTheDocument()
  })

  it('renders the decorative +/− indicator on every trigger (aria-hidden)', () => {
    render(<FaqAccordion />)
    for (const item of ITEMS) {
      const trigger = screen.getByRole('button', { name: item.question })
      // eslint-disable-next-line testing-library/no-node-access
      const indicator = trigger.querySelector('[data-slot="accordion-indicator"]')
      expect(indicator).not.toBeNull()
      expect(indicator).toHaveAttribute('aria-hidden', 'true')
    }
  })
})

describe('Accordion keyboard contract', () => {
  it('Tab reaches each trigger in order (every trigger is a tab stop)', async () => {
    const user = userEvent.setup()
    render(<FaqAccordion />)

    await user.tab()
    expect(screen.getByRole('button', { name: ITEMS[0].question })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: ITEMS[1].question })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: ITEMS[2].question })).toHaveFocus()
  })

  it('Enter toggles the focused panel', async () => {
    const user = userEvent.setup()
    render(<FaqAccordion />)
    const trigger = screen.getByRole('button', { name: ITEMS[0].question })

    await user.tab()
    expect(trigger).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(ITEMS[0].answer)).toBeInTheDocument()

    await user.keyboard('{Enter}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('Space toggles the focused panel', async () => {
    const user = userEvent.setup()
    render(<FaqAccordion />)
    const trigger = screen.getByRole('button', { name: ITEMS[0].question })

    await user.tab()
    await user.keyboard(' ')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard(' ')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('arrow keys do not move focus between triggers (no roving focus, per current APG)', async () => {
    const user = userEvent.setup()
    render(<FaqAccordion />)
    const first = screen.getByRole('button', { name: ITEMS[0].question })

    await user.tab()
    expect(first).toHaveFocus()

    await user.keyboard('{ArrowDown}')
    expect(first).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(first).toHaveFocus()
  })
})

describe('Accordion open behavior', () => {
  it('keeps several panels open at once by default (multiple)', async () => {
    const user = userEvent.setup()
    render(<FaqAccordion />)
    const first = screen.getByRole('button', { name: ITEMS[0].question })
    const second = screen.getByRole('button', { name: ITEMS[1].question })

    await user.click(first)
    await user.click(second)

    expect(first).toHaveAttribute('aria-expanded', 'true')
    expect(second).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(ITEMS[0].answer)).toBeInTheDocument()
    expect(screen.getByText(ITEMS[1].answer)).toBeInTheDocument()
  })

  it('closes the open panel when another opens in single mode (multiple={false})', async () => {
    const user = userEvent.setup()
    render(<FaqAccordion multiple={false} />)
    const first = screen.getByRole('button', { name: ITEMS[0].question })
    const second = screen.getByRole('button', { name: ITEMS[1].question })

    await user.click(first)
    expect(first).toHaveAttribute('aria-expanded', 'true')

    await user.click(second)
    expect(first).toHaveAttribute('aria-expanded', 'false')
    expect(second).toHaveAttribute('aria-expanded', 'true')
    expect(screen.queryByText(ITEMS[0].answer)).not.toBeInTheDocument()
    expect(screen.getByText(ITEMS[1].answer)).toBeInTheDocument()
  })

  it('supports the controlled value / onValueChange API', async () => {
    const user = userEvent.setup()
    const changes: unknown[] = []

    function Controlled(): React.JSX.Element {
      const [value, setValue] = React.useState<string[]>([])
      return (
        <Accordion
          value={value}
          onValueChange={(next) => {
            changes.push(next)
            setValue(next as string[])
          }}
        >
          <AccordionItem value="a">
            <AccordionTrigger>Section A</AccordionTrigger>
            <AccordionPanel>Content A</AccordionPanel>
          </AccordionItem>
        </Accordion>
      )
    }

    render(<Controlled />)
    await user.click(screen.getByRole('button', { name: 'Section A' }))
    expect(changes).toEqual([['a']])
    expect(screen.getByText('Content A')).toBeInTheDocument()
  })
})

describe('Accordion RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <div dir="rtl">
        <Accordion lang="ar">
          <AccordionItem value="hours">
            <AccordionTrigger>ما هي ساعات عمل البلدية؟</AccordionTrigger>
            <AccordionPanel>من الأحد إلى الخميس، من ٨ صباحًا حتى ٤ مساءً.</AccordionPanel>
          </AccordionItem>
        </Accordion>
      </div>
    )

    const trigger = screen.getByRole('button', { name: 'ما هي ساعات عمل البلدية؟' })
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('من الأحد إلى الخميس، من ٨ صباحًا حتى ٤ مساءً.')).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('uses only logical layout classes so the chevron flips sides in RTL', () => {
    render(<FaqAccordion />)
    const trigger = screen.getByRole('button', { name: ITEMS[0].question })
    // justify-between + text-start are direction-agnostic: the +/− indicator
    // (last flex child) lands on the inline-end edge in both directions.
    expect(trigger).toHaveClass('justify-between', 'text-start')
    expect(trigger.className).not.toMatch(/text-left|mr-|ml-|pl-|pr-/)
  })
})
