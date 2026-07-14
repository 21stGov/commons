// SPDX-License-Identifier: MIT

/**
 * @21stgov/commons-js — the framework-agnostic progressive-enhancement runtime
 * for Commons. It makes the `.cui-*` / `data-slot` markup interactive with no
 * framework: call `enhance()` once (or after inserting markup) and every
 * supported component wires itself up. Safe to call repeatedly — each element
 * is only enhanced once.
 */

import { enhanceDialog } from './dialog.ts'
import { enhanceAccordion, enhanceCollapsible } from './disclosure.ts'
import {
  enhanceContextMenu,
  enhanceDropdownMenu,
  enhanceHoverCard,
  enhancePopover,
  enhanceTooltip,
} from './popup.ts'
import { enhanceCustomSelect } from './select.ts'
import { enhanceTabs } from './tabs.ts'
import { enhanceToggle } from './toggle.ts'

export type Behavior = (root: ParentNode) => void

/** Every behavior, in application order. */
export const behaviors: Behavior[] = [
  enhanceAccordion,
  enhanceCollapsible,
  enhanceDialog,
  enhancePopover,
  enhanceDropdownMenu,
  enhanceContextMenu,
  enhanceTooltip,
  enhanceHoverCard,
  enhanceTabs,
  enhanceToggle,
  enhanceCustomSelect,
]

/** Progressively enhance all Commons components found under `root` (default: document). */
export function enhance(root: ParentNode = document): void {
  for (const behavior of behaviors) behavior(root)
}

export {
  enhanceAccordion,
  enhanceCollapsible,
  enhanceContextMenu,
  enhanceCustomSelect,
  enhanceDialog,
  enhanceDropdownMenu,
  enhanceHoverCard,
  enhancePopover,
  enhanceTabs,
  enhanceToggle,
  enhanceTooltip,
}

// Auto-enhance when loaded as a plain <script> (not when imported by a bundler
// that will call enhance() itself — guarded by the document readiness check).
if (typeof document !== 'undefined' && document.currentScript) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => enhance())
  } else {
    enhance()
  }
}
