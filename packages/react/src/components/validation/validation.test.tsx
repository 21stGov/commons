// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import { Validation, ValidationItem, type ValidationCheck } from '@/components/validation'
import { expectNonInteractive } from '../../../test/keyboard.js'
import { axeCheck } from '../../../test/setup.js'

const PASSWORD_CHECKS: ValidationCheck[] = [
  { label: 'At least 8 characters', valid: true },
  { label: 'One number', valid: false },
  { label: 'One symbol', valid: false },
]

describe('Validation accessibility (axe)', () => {
  it('mixed met/unmet checklist is axe-clean', async () => {
    const { container } = render(
      <Validation label="Password requirements" checks={PASSWORD_CHECKS} />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('all-valid checklist is axe-clean', async () => {
    const allValid = PASSWORD_CHECKS.map((check) => ({ ...check, valid: true }))
    const { container } = render(<Validation label="Password requirements" checks={allValid} />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('with a visible heading is axe-clean', async () => {
    const { container } = render(
      <Validation heading="Password must have" checks={PASSWORD_CHECKS} />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('composed from ValidationItem children is axe-clean', async () => {
    const { container } = render(
      <Validation label="Requirements">
        <ValidationItem valid>Not empty</ValidationItem>
        <ValidationItem valid={false}>Matches confirmation</ValidationItem>
      </Validation>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Validation name and role', () => {
  it('names the region with the label prop (aria-label) when there is no heading', () => {
    render(<Validation label="Password requirements" checks={PASSWORD_CHECKS} />)
    expect(screen.getByRole('group', { name: 'Password requirements' })).toBeInTheDocument()
  })

  it('names the region with the visible heading (aria-labelledby) when set', () => {
    render(<Validation heading="Password must have" checks={PASSWORD_CHECKS} />)
    const region = screen.getByRole('group', { name: 'Password must have' })
    expect(region).toBeInTheDocument()
    // The visible heading is the accessible name source.
    expect(screen.getByText('Password must have').tagName).toBe('H3')
  })

  it('renders the heading at the requested level', () => {
    render(<Validation heading="Rules" headingLevel="h2" checks={PASSWORD_CHECKS} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Rules' })).toBeInTheDocument()
  })

  it('exposes the requirements as a list of list items', () => {
    render(<Validation label="Requirements" checks={PASSWORD_CHECKS} />)
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })
})

describe('Validation met/unmet rendering', () => {
  it('renders one item per check with its label', () => {
    render(<Validation label="Requirements" checks={PASSWORD_CHECKS} />)
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument()
    expect(screen.getByText('One number')).toBeInTheDocument()
    expect(screen.getByText('One symbol')).toBeInTheDocument()
  })

  it('marks met items with data-valid and unmet items without it', () => {
    render(<Validation label="Requirements" checks={PASSWORD_CHECKS} />)
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveAttribute('data-valid')
    expect(items[1]).not.toHaveAttribute('data-valid')
  })

  it('provides a non-color indicator: an aria-hidden inline SVG per item', () => {
    const { container } = render(<Validation label="Requirements" checks={PASSWORD_CHECKS} />)
    const icons = container.querySelectorAll('[data-slot="validation-item"] svg')
    expect(icons).toHaveLength(3)
    for (const icon of icons) {
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it('uses a different indicator shape for met vs unmet (not color alone)', () => {
    const { container } = render(
      <Validation label="Requirements">
        <ValidationItem valid>Met one</ValidationItem>
        <ValidationItem valid={false}>Unmet one</ValidationItem>
      </Validation>
    )
    const items = container.querySelectorAll('[data-slot="validation-item"]')
    const metPaths = items[0].querySelectorAll('svg path')
    const unmetPaths = items[1].querySelectorAll('svg path')
    // The met icon draws a checkmark; the unmet icon draws a dash — the path
    // geometry differs, so the state is distinguishable without color.
    expect(metPaths[0].getAttribute('d')).not.toBe(unmetPaths[0].getAttribute('d'))
  })

  it('renders a visually-hidden status word for each item', () => {
    render(<Validation label="Requirements" checks={PASSWORD_CHECKS} />)
    // One met -> "met"; two unmet -> "not met".
    expect(screen.getByText(', met').className).toContain('sr-only')
    expect(screen.getAllByText(', not met')).toHaveLength(2)
    for (const status of screen.getAllByText(', not met')) {
      expect(status.className).toContain('sr-only')
    }
  })

  it('translates the status words via statusLabels', () => {
    render(
      <Validation
        label="Requisitos"
        statusLabels={{ met: 'cumplido', unmet: 'no cumplido' }}
        checks={PASSWORD_CHECKS}
      />
    )
    expect(screen.getByText(', cumplido')).toBeInTheDocument()
    expect(screen.getAllByText(', no cumplido')).toHaveLength(2)
  })
})

describe('Validation live region', () => {
  it('is a polite live region so items announce as they flip', () => {
    const { container } = render(<Validation label="Requirements" checks={PASSWORD_CHECKS} />)
    const region = container.querySelector('[data-slot="validation"]')
    expect(region).toHaveAttribute('aria-live', 'polite')
  })

  it('reflects a flipped check on rerender (met after being unmet)', () => {
    const { rerender } = render(
      <Validation label="Requirements" checks={[{ label: 'One number', valid: false }]} />
    )
    expect(screen.getAllByRole('listitem')[0]).not.toHaveAttribute('data-valid')

    rerender(<Validation label="Requirements" checks={[{ label: 'One number', valid: true }]} />)
    expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('data-valid')
    expect(screen.getByText(', met')).toBeInTheDocument()
  })
})

describe('Validation checks vs children', () => {
  it('prefers the checks prop over children when both are given', () => {
    render(
      <Validation label="Requirements" checks={[{ label: 'From checks', valid: true }]}>
        <ValidationItem valid={false}>From children</ValidationItem>
      </Validation>
    )
    expect(screen.getByText('From checks')).toBeInTheDocument()
    expect(screen.queryByText('From children')).not.toBeInTheDocument()
  })
})

describe('Validation RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl" lang="ar">
        <Validation
          label="متطلبات كلمة المرور"
          statusLabels={{ met: 'مستوفى', unmet: 'غير مستوفى' }}
          checks={[
            { label: '٨ أحرف على الأقل', valid: true },
            { label: 'رقم واحد', valid: false },
          ]}
        />
      </div>
    )
    expect(screen.getByRole('group', { name: 'متطلبات كلمة المرور' })).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Validation keyboard contract (verified)', () => {
  // Verifies accessibility.keyboard: this component adds no tab stop / keyboard behavior.
  it('exposes no keyboard focus surface', () => {
    const { container } = render(
      <Validation label="Password requirements" checks={PASSWORD_CHECKS} />,
    )
    expectNonInteractive(container)
  })
})
