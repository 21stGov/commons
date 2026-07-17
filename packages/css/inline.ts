// SPDX-License-Identifier: MIT

/**
 * Extract inline component-part styling that isn't driven by `cva`.
 *
 * Every meaningful element in a Commons component carries a `data-slot="name"`
 * and styles itself with an inline `className` — a plain string, a
 * `cn('…static…', conditional, className)` call, or a module-scope `const` that
 * holds one of those. We read the *static* class literals off each `data-slot`
 * element (resolving `const` references) and map them to a `.cui-<slot>` class.
 * This covers sub-parts (alert-icon, checkbox-control-box, meter-track, …) and
 * the components that use no `cva` at all (meter, form, tooltip, …).
 *
 * Dynamic bits (prop-driven conditionals, the passed-through `className`) are
 * skipped — they are state/variant styling, a Level-2 concern.
 */

import { readFileSync } from 'node:fs'

import ts from 'typescript'

interface Resolvers {
  /** Resolve a `const` identifier to its class tokens. */
  const: (name: string) => string[]
  /** Base classes for a captured `*Variants` cva export, keyed by export name. */
  cva: Map<string, string[]>
}

/** Static class tokens from a class-valued expression, resolving `const` + cva refs. */
function staticClasses(expr: ts.Expression, r: Resolvers): string[] {
  if (ts.isStringLiteralLike(expr)) {
    return expr.text.split(/\s+/).filter(Boolean)
  }
  if (ts.isIdentifier(expr)) {
    return r.const(expr.text)
  }
  if (ts.isArrayLiteralExpression(expr)) {
    // ['a b', cond && 'c', SHARED] — take the static elements.
    return expr.elements.flatMap((el) => staticClasses(el, r))
  }
  if (ts.isParenthesizedExpression(expr)) {
    return staticClasses(expr.expression, r)
  }
  if (ts.isConditionalExpression(expr)) {
    // `flag ? on : off` — take the else branch, i.e. the default/off state, so a
    // component's resting look (alert-body gap-105, …) isn't lost. The opt-in
    // state is a variant the runtime/authored markup handles.
    return staticClasses(expr.whenFalse, r)
  }
  if (ts.isCallExpression(expr)) {
    // `xVariants()` — a cva call whose data-slot differs from the export name
    // (input-otp-cell ← inputOTPVariants, file-input-dropzone ← fileInputVariants).
    // Resolve it to the cva's base classes so the slot gets styled.
    if (ts.isIdentifier(expr.expression) && r.cva.has(expr.expression.text)) {
      return r.cva.get(expr.expression.text)!
    }
    // `[…].join(' ')` — resolve the array being joined.
    if (
      ts.isPropertyAccessExpression(expr.expression) &&
      expr.expression.name.text === 'join'
    ) {
      return staticClasses(expr.expression.expression, r)
    }
    // cn(...) / clsx(...) — take the static parts of every argument.
    return expr.arguments.flatMap((arg) => staticClasses(arg as ts.Expression, r))
  }
  return []
}

function findAttr(attrs: ts.JsxAttributes, name: string): ts.JsxAttribute | undefined {
  return attrs.properties.find(
    (p): p is ts.JsxAttribute => ts.isJsxAttribute(p) && p.name.getText() === name,
  )
}

const kebab = (s: string): string =>
  s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/_/g, '-').toLowerCase()

/** A `data-slot` placed on another cva component (e.g. `<Link data-slot="breadcrumb-link">`). */
export interface SlotAlias {
  /** The renamed slot, e.g. `breadcrumb-link`. */
  slot: string
  /** The base component it renders, e.g. `link` (from tag `Link`). */
  base: string
  /** Literal variant props on the tag, e.g. `{ variant: 'subtle' }`. */
  props: Record<string, string>
}

/**
 * Find slots that are actually another cva component rendered under a renamed
 * `data-slot` — `<Link data-slot="breadcrumb-link">`, `<Button
 * data-slot="toolbar-button">`, … These carry no inline classes (the styling
 * lives in the rendered component), so we alias `.cui-<slot>` onto that
 * component's base + resolved default variant. `knownBases` is the set of
 * captured cva component names (link, button, input, …).
 */
export function extractSlotAliases(file: string, knownBases: Set<string>): SlotAlias[] {
  const sf = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX,
  )
  const aliases: SlotAlias[] = []

  function visit(node: ts.Node): void {
    const el = ts.isJsxElement(node)
      ? node.openingElement
      : ts.isJsxSelfClosingElement(node)
        ? node
        : undefined
    if (el) {
      const tag = el.tagName.getText()
      const base = kebab(tag)
      // Only Capitalized component tags that map to a captured cva base.
      if (/^[A-Z]/.test(tag) && knownBases.has(base)) {
        const slotAttr = findAttr(el.attributes, 'data-slot')
        const slot =
          slotAttr?.initializer && ts.isStringLiteralLike(slotAttr.initializer)
            ? slotAttr.initializer.text
            : undefined
        if (slot && slot !== base) {
          const props: Record<string, string> = {}
          for (const p of el.attributes.properties) {
            if (
              ts.isJsxAttribute(p) &&
              p.initializer &&
              ts.isStringLiteralLike(p.initializer) &&
              p.name.getText() !== 'data-slot'
            ) {
              props[p.name.getText()] = p.initializer.text
            }
          }
          aliases.push({ slot, base, props })
        }
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sf)
  return aliases
}

/** Export names of `*Variants` cva calls found anywhere in an expression. */
function cvaCallsIn(expr: ts.Expression, cvaBases: Map<string, string[]>): string[] {
  const found: string[] = []
  const walk = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && cvaBases.has(node.expression.text)) {
      found.push(node.expression.text)
    }
    ts.forEachChild(node, walk)
  }
  walk(expr)
  return found
}

export interface InlineSlots {
  /** data-slot → its static class list. */
  slots: Map<string, string[]>
  /**
   * cva export name → every data-slot its `xVariants()` call styles, when that
   * differs from the export-name kebab (input-otp-cell ← inputOTPVariants). A
   * cva can style more than one slot (navigationMenuTriggerVariants dresses both
   * the trigger and a plain bar link), so the generator emits it under each.
   */
  cvaOnSlot: Map<string, Set<string>>
}

/**
 * Map every `data-slot` in a component file to its static class list.
 * `cvaBases` maps captured `*Variants` export names to their base classes, so a
 * `className={xVariants()}` on a differently-named slot still gets styled.
 */
export function extractInlineSlots(
  file: string,
  cvaBases: Map<string, string[]> = new Map(),
): InlineSlots {
  const sf = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX,
  )

  // Pass 1: collect `const name = <class expr>` initializers so identifier
  // classNames (className={controlBoxClasses}) can be resolved.
  const bindings = new Map<string, ts.Expression>()
  const collectBindings = (node: ts.Node): void => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      !bindings.has(node.name.text)
    ) {
      bindings.set(node.name.text, node.initializer)
    }
    ts.forEachChild(node, collectBindings)
  }
  collectBindings(sf)

  const cache = new Map<string, string[]>()
  const resolving = new Set<string>()
  const resolveConst = (name: string): string[] => {
    if (cache.has(name)) return cache.get(name)!
    const init = bindings.get(name)
    if (!init || resolving.has(name)) return []
    resolving.add(name)
    const classes = staticClasses(init, resolvers)
    resolving.delete(name)
    cache.set(name, classes)
    return classes
  }
  const resolvers: Resolvers = { const: resolveConst, cva: cvaBases }

  const slots = new Map<string, string[]>()
  const cvaOnSlot = new Map<string, Set<string>>()

  function visit(node: ts.Node): void {
    const attrs = ts.isJsxElement(node)
      ? node.openingElement.attributes
      : ts.isJsxSelfClosingElement(node)
        ? node.attributes
        : undefined

    if (attrs) {
      const slotAttr = findAttr(attrs, 'data-slot')
      const slot =
        slotAttr?.initializer && ts.isStringLiteralLike(slotAttr.initializer)
          ? slotAttr.initializer.text
          : undefined
      if (slot) {
        const classAttr = findAttr(attrs, 'className')
        let classes: string[] = []
        if (classAttr?.initializer) {
          if (ts.isStringLiteralLike(classAttr.initializer)) {
            classes = classAttr.initializer.text.split(/\s+/).filter(Boolean)
          } else if (
            ts.isJsxExpression(classAttr.initializer) &&
            classAttr.initializer.expression
          ) {
            classes = staticClasses(classAttr.initializer.expression, resolvers)
            for (const cva of cvaCallsIn(classAttr.initializer.expression, cvaBases)) {
              const styled = cvaOnSlot.get(cva) ?? new Set<string>()
              styled.add(slot)
              cvaOnSlot.set(cva, styled)
            }
          }
        }
        if (classes.length > 0) {
          const prev = slots.get(slot) ?? []
          slots.set(slot, [...new Set([...prev, ...classes])])
        }
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sf)
  return { slots, cvaOnSlot }
}
