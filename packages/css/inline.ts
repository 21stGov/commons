// SPDX-License-Identifier: MIT

/**
 * Extract inline component-part styling that isn't driven by `cva`.
 *
 * Every meaningful element in a Commons component carries a `data-slot="name"`
 * and styles itself with an inline `className` — either a plain string or
 * `cn('…static…', conditional, className)`. We read the *static* class literals
 * off each `data-slot` element and map them to a `.cui-<slot>` class. This
 * covers sub-parts (alert-icon, alert-heading, meter-track, …) and the
 * components that use no `cva` at all (meter, form, tooltip, …).
 *
 * Dynamic bits (prop-driven conditionals, the passed-through `className`) are
 * skipped — they are state/variant styling, a Level-2 concern.
 */

import { readFileSync } from 'node:fs'

import ts from 'typescript'

/** Static class tokens from a className expression (string literals + cn() string args). */
function staticClasses(expr: ts.Expression): string[] {
  if (ts.isStringLiteralLike(expr)) {
    return expr.text.split(/\s+/).filter(Boolean)
  }
  if (ts.isCallExpression(expr)) {
    // cn(...) / clsx(...) — take only the literal string arguments.
    return expr.arguments.flatMap((arg) =>
      ts.isStringLiteralLike(arg) ? arg.text.split(/\s+/).filter(Boolean) : [],
    )
  }
  return []
}

function findAttr(attrs: ts.JsxAttributes, name: string): ts.JsxAttribute | undefined {
  return attrs.properties.find(
    (p): p is ts.JsxAttribute => ts.isJsxAttribute(p) && p.name.getText() === name,
  )
}

/** Map every `data-slot` in a component file to its static class list. */
export function extractInlineSlots(file: string): Map<string, string[]> {
  const sf = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX,
  )

  const slots = new Map<string, string[]>()

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
            classes = staticClasses(classAttr.initializer.expression)
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
  return slots
}
