// SPDX-License-Identifier: MIT

import { describe, expect, it } from 'vitest'

import {
  camelToKebab,
  classBase,
  emitVariant,
  isMarker,
  splitUtilities,
  toClasses,
  type CapturedVariant,
} from './generate.ts'

describe('classBase', () => {
  it('strips the Variants suffix and kebab-cases sub-part names', () => {
    expect(classBase('buttonVariants')).toBe('button')
    expect(classBase('accordionTriggerVariants')).toBe('accordion-trigger')
    expect(classBase('alertVariants')).toBe('alert')
  })
})

describe('camelToKebab', () => {
  it('handles camelCase and underscores', () => {
    expect(camelToKebab('slim')).toBe('slim')
    expect(camelToKebab('fullWidth')).toBe('full-width')
    expect(camelToKebab('data_state')).toBe('data-state')
  })
})

describe('toClasses', () => {
  it('flattens strings and nested arrays into a token list', () => {
    expect(toClasses('flex  items-center')).toEqual(['flex', 'items-center'])
    expect(toClasses(['a b', ['c', 'd e']])).toEqual(['a', 'b', 'c', 'd', 'e'])
    expect(toClasses(undefined)).toEqual([])
  })
})

describe('splitUtilities', () => {
  it('extracts [&_x] descendant variants into nested selectors', () => {
    const { self, descendants } = splitUtilities([
      'bg-x',
      '[&_svg]:size-2',
      '[&_svg]:shrink-0',
      'flex',
    ])
    expect(self).toEqual(['bg-x', 'flex'])
    expect([...descendants.entries()]).toEqual([[' svg', ['size-2', 'shrink-0']]])
  })

  it('extracts [&>x] child variants', () => {
    const { descendants } = splitUtilities(['[&>svg]:hidden'])
    expect([...descendants.keys()]).toEqual([' > svg'])
  })

  it('leaves standard/data/state variants for @apply', () => {
    const { self, descendants } = splitUtilities([
      'hover:bg-x',
      'disabled:opacity-50',
      'data-[state=open]:block',
    ])
    expect(self).toEqual(['hover:bg-x', 'disabled:opacity-50', 'data-[state=open]:block'])
    expect(descendants.size).toBe(0)
  })
})

describe('isMarker', () => {
  it('detects group/peer markers and their named forms', () => {
    expect(isMarker('group')).toBe(true)
    expect(isMarker('peer')).toBe(true)
    expect(isMarker('group/item')).toBe(true)
    expect(isMarker('peer/x')).toBe(true)
    expect(isMarker('flex')).toBe(false)
    expect(isMarker('group-hover:bg-x')).toBe(false) // this is a real utility, kept
  })
})

describe('emitVariant', () => {
  const cap: CapturedVariant = {
    exportName: 'alertVariants',
    base: ['flex', 'border'],
    variants: {
      variant: { info: ['bg-info'], error: ['bg-error'] },
      slim: { true: ['p-1'], false: ['p-3'] },
    },
    defaultVariants: { variant: 'info', slim: false },
  }

  it('emits base, enum modifiers, and the boolean-true modifier; folds the boolean default into base', () => {
    const out: string[] = []
    emitVariant(cap, out)
    const css = out.join('\n')
    expect(css).toContain('.cui-alert {')
    expect(css).toContain('.cui-alert--info {')
    expect(css).toContain('.cui-alert--error {')
    expect(css).toContain('.cui-alert--slim {')
    // the default (slim:false -> p-3) is folded into the base rule, not a modifier
    expect(css).toMatch(/\.cui-alert \{\s*@apply flex border p-3;/)
    expect(css).not.toContain('.cui-alert--slim-false')
  })

  it('returns a swatch for base and every modifier', () => {
    const out: string[] = []
    const swatches = emitVariant(cap, out)
    expect(swatches[0]).toEqual({ classes: 'cui-alert', label: 'base' })
    expect(swatches.map((s) => s.label)).toEqual(['base', 'info', 'error', 'slim'])
    expect(swatches.find((s) => s.label === 'info')?.classes).toBe('cui-alert cui-alert--info')
  })

  it('drops group/peer marker classes from emitted rules', () => {
    const out: string[] = []
    emitVariant(
      { exportName: 'xVariants', base: ['group', 'relative', 'peer'], variants: {}, defaultVariants: {} },
      out,
    )
    expect(out.join('\n')).toContain('@apply relative;')
    expect(out.join('\n')).not.toMatch(/@apply[^;]*\bgroup\b/)
  })
})
