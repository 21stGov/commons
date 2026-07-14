// SPDX-License-Identifier: MIT

import { describe, expect, it } from 'vitest'

import {
  aliasClasses,
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

  const rule = (rules: { selector: string; utilities: string[] }[], sel: string) =>
    rules.find((r) => r.selector === sel)

  it('emits base, enum modifiers, and the boolean-true modifier; folds the boolean default into base', () => {
    const { rules } = emitVariant(cap)
    expect(rule(rules, '.cui-alert')?.utilities).toEqual(['flex', 'border', 'p-3']) // base + folded false
    expect(rule(rules, '.cui-alert--info')?.utilities).toEqual(['bg-info'])
    expect(rule(rules, '.cui-alert--error')?.utilities).toEqual(['bg-error'])
    expect(rule(rules, '.cui-alert--slim')?.utilities).toEqual(['p-1'])
    expect(rule(rules, '.cui-alert--slim-false')).toBeUndefined()
  })

  it('returns a swatch for base and every modifier', () => {
    const { swatches } = emitVariant(cap)
    expect(swatches[0]).toEqual({ classes: 'cui-alert', label: 'base' })
    expect(swatches.map((s) => s.label)).toEqual(['base', 'info', 'error', 'slim'])
    expect(swatches.find((s) => s.label === 'info')?.classes).toBe('cui-alert cui-alert--info')
  })

  it('drops group/peer marker classes from emitted rules', () => {
    const { rules } = emitVariant({
      exportName: 'xVariants',
      base: ['group', 'relative', 'peer'],
      variants: {},
      defaultVariants: {},
    })
    expect(rule(rules, '.cui-x')?.utilities).toEqual(['relative'])
  })

  it('emits a signature per non-empty modifier, tagged with its cva group', () => {
    const { signatures } = emitVariant(cap)
    expect(signatures).toContainEqual({
      modifier: 'cui-alert--info',
      group: 'variant',
      classes: ['bg-info'],
    })
    expect(signatures).toContainEqual({
      modifier: 'cui-alert--slim',
      group: 'slim',
      classes: ['p-1'],
    })
    // The folded boolean default (slim=false) produces no modifier/signature.
    expect(signatures.some((s) => s.modifier === 'cui-alert--slim-false')).toBe(false)
  })
})

describe('aliasClasses', () => {
  const link: CapturedVariant = {
    exportName: 'linkVariants',
    base: ['underline'],
    variants: { variant: { default: ['text-link'], subtle: ['text-muted'] } },
    defaultVariants: { variant: 'default' },
  }

  it('resolves the component default when no prop is given', () => {
    expect(aliasClasses(link, {})).toEqual(['underline', 'text-link'])
  })

  it('honors an explicit variant prop', () => {
    expect(aliasClasses(link, { variant: 'subtle' })).toEqual(['underline', 'text-muted'])
  })
})
