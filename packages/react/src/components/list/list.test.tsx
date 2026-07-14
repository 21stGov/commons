// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import {
  List,
  ListItem,
  DescriptionList,
  DescriptionTerm,
  DescriptionDetails,
} from '@/components/list'
import { expectNonInteractive } from '../../../test/keyboard.js'
import { axeCheck } from '../../../test/setup.js'

describe('List accessibility (axe)', () => {
  it('ordered variant is axe-clean', async () => {
    const { container } = render(
      <List variant="ordered">
        <ListItem>Gather your documents</ListItem>
        <ListItem>Complete the application</ListItem>
        <ListItem>Submit for review</ListItem>
      </List>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('unordered variant is axe-clean', async () => {
    const { container } = render(
      <List variant="unordered">
        <ListItem>A valid photo ID</ListItem>
        <ListItem>Proof of residency</ListItem>
      </List>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('unstyled variant is axe-clean', async () => {
    const { container } = render(
      <nav aria-label="Footer">
        <List variant="unstyled">
          <ListItem>Privacy policy</ListItem>
          <ListItem>Accessibility</ListItem>
        </List>
      </nav>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('description list (stacked) is axe-clean', async () => {
    const { container } = render(
      <DescriptionList>
        <DescriptionTerm>Case number</DescriptionTerm>
        <DescriptionDetails>2026-0142</DescriptionDetails>
        <DescriptionTerm>Status</DescriptionTerm>
        <DescriptionDetails>Under review</DescriptionDetails>
      </DescriptionList>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('description list (inline) is axe-clean', async () => {
    const { container } = render(
      <DescriptionList layout="inline">
        <DescriptionTerm>Property ID</DescriptionTerm>
        <DescriptionDetails>123-456</DescriptionDetails>
      </DescriptionList>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('description list with multiple details per term is axe-clean', async () => {
    const { container } = render(
      <DescriptionList>
        <DescriptionTerm>Phone numbers</DescriptionTerm>
        <DescriptionDetails>(202) 555-0100</DescriptionDetails>
        <DescriptionDetails>(202) 555-0101</DescriptionDetails>
      </DescriptionList>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('List semantics', () => {
  it('renders an <ol> with decimal markers for variant="ordered"', () => {
    render(
      <List variant="ordered" aria-label="Steps">
        <ListItem>First</ListItem>
        <ListItem>Second</ListItem>
      </List>
    )
    const list = screen.getByRole('list', { name: 'Steps' })
    expect(list.tagName).toBe('OL')
    expect(list.className).toContain('list-decimal')
    expect(list).toHaveAttribute('data-slot', 'list')
    expect(list).toHaveAttribute('data-variant', 'ordered')
  })

  it('renders a <ul> with disc markers for variant="unordered" (the default)', () => {
    render(
      <List aria-label="Requirements">
        <ListItem>A valid photo ID</ListItem>
      </List>
    )
    const list = screen.getByRole('list', { name: 'Requirements' })
    expect(list.tagName).toBe('UL')
    expect(list.className).toContain('list-disc')
  })

  it('renders a <ul> with no markers and an explicit role="list" for variant="unstyled"', () => {
    render(
      <List variant="unstyled" aria-label="Footer links">
        <ListItem>Privacy policy</ListItem>
      </List>
    )
    const list = screen.getByRole('list', { name: 'Footer links' })
    expect(list.tagName).toBe('UL')
    expect(list.className).toContain('list-none')
    // Explicit role kept in the DOM (not just implied by the tag) — Safari/
    // VoiceOver drops list semantics from a marker-less <ul> otherwise.
    expect(list).toHaveAttribute('role', 'list')
  })

  it('does not set an explicit role for ordered/unordered variants (native semantics suffice)', () => {
    render(
      <List aria-label="Requirements">
        <ListItem>Item</ListItem>
      </List>
    )
    expect(screen.getByRole('list', { name: 'Requirements' })).not.toHaveAttribute('role')
  })

  it('honors an explicit `as` override', () => {
    render(
      <List variant="unstyled" as="ol" aria-label="Hidden numbering">
        <ListItem>Item</ListItem>
      </List>
    )
    const list = screen.getByRole('list', { name: 'Hidden numbering' })
    expect(list.tagName).toBe('OL')
  })

  it('marks each item with data-slot="list-item"', () => {
    render(
      <List aria-label="Requirements">
        <ListItem>A valid photo ID</ListItem>
      </List>
    )
    expect(screen.getByText('A valid photo ID')).toHaveAttribute('data-slot', 'list-item')
  })
})

describe('DescriptionList semantics', () => {
  it('renders a <dl> containing <dt>/<dd> pairs', () => {
    render(
      <DescriptionList data-testid="dl">
        <DescriptionTerm>Case number</DescriptionTerm>
        <DescriptionDetails>2026-0142</DescriptionDetails>
      </DescriptionList>
    )
    const dl = screen.getByTestId('dl')
    expect(dl.tagName).toBe('DL')
    expect(dl).toHaveAttribute('data-slot', 'description-list')

    const term = screen.getByText('Case number')
    const details = screen.getByText('2026-0142')
    expect(term.tagName).toBe('DT')
    expect(term).toHaveAttribute('data-slot', 'description-term')
    expect(details.tagName).toBe('DD')
    expect(details).toHaveAttribute('data-slot', 'description-details')
  })

  it('defaults to the stacked layout', () => {
    render(
      <DescriptionList data-testid="dl">
        <DescriptionTerm>Term</DescriptionTerm>
        <DescriptionDetails>Detail</DescriptionDetails>
      </DescriptionList>
    )
    expect(screen.getByTestId('dl')).toHaveAttribute('data-layout', 'stacked')
  })

  it('applies the inline two-column layout when requested', () => {
    render(
      <DescriptionList layout="inline" data-testid="dl">
        <DescriptionTerm>Term</DescriptionTerm>
        <DescriptionDetails>Detail</DescriptionDetails>
      </DescriptionList>
    )
    const dl = screen.getByTestId('dl')
    expect(dl).toHaveAttribute('data-layout', 'inline')
    expect(dl.className).toContain('sm:grid')
  })

  it('supports multiple DescriptionDetails for a single DescriptionTerm', () => {
    render(
      <DescriptionList>
        <DescriptionTerm>Phone numbers</DescriptionTerm>
        <DescriptionDetails>(202) 555-0100</DescriptionDetails>
        <DescriptionDetails>(202) 555-0101</DescriptionDetails>
      </DescriptionList>
    )
    expect(screen.getByText('(202) 555-0100')).toBeInTheDocument()
    expect(screen.getByText('(202) 555-0101')).toBeInTheDocument()
  })
})

describe('List RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <List variant="ordered" aria-label="الخطوات">
          <ListItem>اجمع مستنداتك</ListItem>
          <ListItem>أكمل الطلب</ListItem>
        </List>
      </div>
    )
    expect(screen.getByRole('list', { name: 'الخطوات' })).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('description list renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <DescriptionList layout="inline">
          <DescriptionTerm>رقم القضية</DescriptionTerm>
          <DescriptionDetails>2026-0142</DescriptionDetails>
        </DescriptionList>
      </div>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('List keyboard contract (verified)', () => {
  // Verifies accessibility.keyboard: static content — no tab stop / keyboard behavior of its own.
  it('exposes no keyboard focus surface', () => {
    const { container } = render(
      <List variant="ordered">
        <ListItem>Gather your documents</ListItem>
        <ListItem>Complete the application</ListItem>
      </List>,
    )
    expectNonInteractive(container)
  })
})
