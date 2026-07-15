// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { all, claim } from './dom.ts'

describe('claim', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('returns matching elements and marks each enhanced for the key', () => {
    document.body.innerHTML = '<div class="x"></div><div class="x"></div>'
    const claimed = claim(document, '.x', 'k')
    expect(claimed).toHaveLength(2)
    for (const el of claimed) expect(el.getAttribute('data-cui-enhanced')).toBe('k')
  })

  it('does not re-claim an element already claimed for the same key (idempotent)', () => {
    document.body.innerHTML = '<div class="x"></div>'
    expect(claim(document, '.x', 'k')).toHaveLength(1)
    expect(claim(document, '.x', 'k')).toHaveLength(0)
  })

  it('namespaces the guard by key so a second behavior can still claim the element', () => {
    document.body.innerHTML = '<div class="x"></div>'
    expect(claim(document, '.x', 'a')).toHaveLength(1)
    expect(claim(document, '.x', 'b')).toHaveLength(1)
    expect(document.querySelector('.x')!.getAttribute('data-cui-enhanced')).toBe('a b')
  })

  it('all() returns a typed array of every match', () => {
    document.body.innerHTML = '<i></i><i></i><i></i>'
    expect(all(document, 'i')).toHaveLength(3)
  })
})
