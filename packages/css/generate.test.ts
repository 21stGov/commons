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

  it('scopes BOTH defaults (enum + boolean off-state) against their siblings; emits the non-default modifiers', () => {
    const { rules } = emitVariant(cap)
    // The bare base carries only the always-on classes. Each default (variant=
    // info, slim=false) folds into a `:where(:not(<siblings>))` rule, so a bare
    // `.cui-alert` still renders the default — but choosing another value in the
    // group suppresses it, mirroring cva, which drops the default's classes the
    // moment another value is set (so a sibling that omits a property the
    // default sets doesn't inherit it). `:where()` keeps the base specificity.
    expect(rule(rules, '.cui-alert')?.utilities).toEqual(['flex', 'border'])
    expect(rule(rules, '.cui-alert:where(:not(.cui-alert--error))')?.utilities).toEqual(['bg-info'])
    expect(rule(rules, '.cui-alert:where(:not(.cui-alert--slim))')?.utilities).toEqual(['p-3'])
    expect(rule(rules, '.cui-alert--info')?.utilities).toEqual(['bg-info'])
    expect(rule(rules, '.cui-alert--error')?.utilities).toEqual(['bg-error'])
    expect(rule(rules, '.cui-alert--slim')?.utilities).toEqual(['p-1'])
    expect(rule(rules, '.cui-alert--slim-false')).toBeUndefined()
  })

  it('does not leak an asymmetric default onto a sibling that omits that property', () => {
    // The separator/scroll-area bug: the default value sets a dimension the
    // sibling never resets. Folding the default into the bare base would leak
    // `w-full` onto `--vertical`; scoping it against `--vertical` prevents that.
    const { rules } = emitVariant({
      exportName: 'ruleVariants',
      base: ['flex'],
      variants: { orientation: { horizontal: ['w-full'], vertical: ['self-stretch'] } },
      defaultVariants: { orientation: 'horizontal' },
    })
    // Bare base is only the always-on class — no folded width.
    expect(rule(rules, '.cui-rule')?.utilities).toEqual(['flex'])
    // The default's width lives on the scoped rule, excluded when --vertical is present.
    expect(rule(rules, '.cui-rule:where(:not(.cui-rule--vertical))')?.utilities).toEqual(['w-full'])
    // The vertical sibling carries only its own class — it never inherits w-full.
    expect(rule(rules, '.cui-rule--vertical')?.utilities).toEqual(['self-stretch'])
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

  it('emits a signature per non-default, non-empty modifier, tagged with its cva group', () => {
    const { signatures } = emitVariant(cap)
    expect(signatures).toContainEqual({
      modifier: 'cui-alert--error',
      group: 'variant',
      classes: ['bg-error'],
    })
    expect(signatures).toContainEqual({
      modifier: 'cui-alert--slim',
      group: 'slim',
      classes: ['p-1'],
    })
    // The DEFAULT enum value (variant=info) folds into the scoped default rule,
    // so it is excluded from signatures — else the rewrite, seeing the folded
    // classes on every element, would tag them all as the default.
    expect(signatures.some((s) => s.modifier === 'cui-alert--info')).toBe(false)
    // The folded boolean default (slim=false) likewise produces no signature.
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
