// SPDX-License-Identifier: MIT

import { describe, expect, it } from 'vitest'

import { rewrite } from './demos.ts'

const manifest = new Set([
  'cui-button',
  'cui-button--primary',
  'cui-button--sm',
  'cui-badge',
  'cui-badge--success',
  'cui-badge--md',
  'cui-breadcrumb-link',
])

const signatures = {
  button: [
    { modifier: 'cui-button--primary', group: 'variant', classes: ['bg-primary', 'text-primary-foreground'] },
    { modifier: 'cui-button--secondary', group: 'variant', classes: ['bg-muted'] },
    { modifier: 'cui-button--sm', group: 'size', classes: ['h-9', 'px-3'] },
  ],
}

describe('rewrite', () => {
  it('recovers a variant + size from original classes when there is no data-*', () => {
    const html =
      '<button data-slot="button" class="bg-primary text-primary-foreground h-9 px-3">Go</button>'
    const { html: out } = rewrite(html, manifest, signatures)
    expect(out).toContain('class="cui-button cui-button--primary cui-button--sm"')
    // The original Tailwind classes are gone from the component root.
    expect(out).not.toContain('bg-primary')
  })

  it('adds a modifier from a data-* attribute (Badge style)', () => {
    const html =
      '<span data-slot="badge" data-variant="success" data-size="md" class="whatever">Approved</span>'
    const { html: out } = rewrite(html, manifest, {})
    expect(out).toContain('cui-badge')
    expect(out).toContain('cui-badge--success')
    expect(out).toContain('cui-badge--md')
  })

  it('buckets classes: scaffolding outside components, internals inside', () => {
    const html =
      '<div class="flex gap-2"><button data-slot="button" class="bg-primary"><svg class="size-4"></svg></button></div>'
    const { scaffold, internal } = rewrite(html, manifest, signatures)
    // Wrapper outside any component subtree → scaffolding.
    expect(scaffold.has('flex')).toBe(true)
    expect(scaffold.has('gap-2')).toBe(true)
    // Icon inside the component with no data-slot → coverage-gap internal.
    expect(internal.has('size-4')).toBe(true)
    // The component root's own utilities are neither (replaced by .cui-*).
    expect(scaffold.has('bg-primary')).toBe(false)
    expect(internal.has('bg-primary')).toBe(false)
  })

  it('applies a manifest base for an alias slot with no data-* or signature', () => {
    const html = '<a data-slot="breadcrumb-link" class="text-link underline" href="#">Home</a>'
    const { html: out } = rewrite(html, manifest, {})
    expect(out).toContain('class="cui-breadcrumb-link"')
  })
})
