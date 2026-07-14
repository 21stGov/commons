// SPDX-License-Identifier: MIT

/**
 * Keyboard-interaction test harness.
 *
 * A small vocabulary of assertions, built on @testing-library/user-event, for
 * the WCAG keyboard patterns Commons components claim in their
 * `registry.frag.json` `accessibility.keyboard` block. Using these helpers
 * keeps every component's keyboard verification consistent and greppable, and
 * lets a component earn `accessibility.keyboardVerified: true` — a claim the
 * keyboard-coverage test refuses to let ship without a backing test.
 *
 * All helpers operate on the jsdom render; contrast and true layout are not
 * available there (see test/setup.ts), but focus order, roving tabindex,
 * activation keys, focus trapping, and focus return are.
 */

import type { UserEvent } from "@testing-library/user-event";
import { expect } from "vitest";

/** Elements that can receive keyboard focus, in DOM order. */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]",
  "[contenteditable]:not([contenteditable=\"false\"])",
].join(",");

/**
 * Every focusable element inside `container`, in DOM order. Excludes anything
 * explicitly removed from the tab order (`tabindex="-1"`), disabled, or hidden
 * from assistive tech (`aria-hidden`).
 */
export function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) =>
      el.tabIndex >= 0 &&
      !el.hasAttribute("disabled") &&
      !el.hasAttribute("hidden") &&
      el.getAttribute("aria-hidden") !== "true" &&
      // Nothing inside a hidden/inert/aria-hidden subtree is reachable.
      el.closest("[aria-hidden=\"true\"], [hidden], [inert]") === null,
  );
}

/**
 * Assert the component exposes no keyboard focus surface at all — the contract
 * for status/decorative components (skeleton, spinner, meter, …) whose keyboard
 * claim is "never takes focus".
 */
export function expectNonInteractive(container: HTMLElement): void {
  const focusable = getFocusable(container);
  expect(
    focusable,
    focusable.length === 0
      ? undefined
      : `Expected no focusable elements, found: ${focusable.map((el) => el.outerHTML).join(", ")}`,
  ).toHaveLength(0);
}

/**
 * Assert that pressing Tab from a clean start lands focus on each element in
 * `expected`, in order. Call on a fresh render (nothing focused yet).
 */
export async function expectTabOrder(user: UserEvent, expected: HTMLElement[]): Promise<void> {
  for (let i = 0; i < expected.length; i++) {
    await user.tab();
    expect(
      expected[i],
      `Tab stop ${i + 1} of ${expected.length} focused the wrong element`,
    ).toHaveFocus();
  }
}

/**
 * Assert roving tabindex: exactly one element in `items` is in the tab order
 * (`tabindex="0"`), the rest are `tabindex="-1"`. This is what lets a composite
 * widget (menu, toolbar, radio group) be a single Tab stop.
 */
export function expectRovingTabindex(items: HTMLElement[]): void {
  const tabbable = items.filter((el) => el.tabIndex === 0);
  expect(tabbable, "Exactly one item should be in the tab order (tabindex=0)").toHaveLength(1);
  for (const el of items) {
    if (!tabbable.includes(el)) {
      expect(el.tabIndex, "Non-active roving items must be tabindex=-1").toBe(-1);
    }
  }
}

/**
 * Focus `items[0]`, then assert the given arrow key walks focus forward through
 * the list (and, if `prev` is given, backward). Defaults to horizontal arrows.
 */
export async function expectArrowNavigation(
  user: UserEvent,
  items: HTMLElement[],
  options: { next?: string; prev?: string } = {},
): Promise<void> {
  const next = options.next ?? "{ArrowRight}";
  const prev = options.prev ?? "{ArrowLeft}";
  items[0]?.focus();
  expect(items[0]).toHaveFocus();
  for (let i = 1; i < items.length; i++) {
    await user.keyboard(next);
    expect(items[i], `${next} should move focus to item ${i + 1}`).toHaveFocus();
  }
  for (let i = items.length - 2; i >= 0; i--) {
    await user.keyboard(prev);
    expect(items[i], `${prev} should move focus back to item ${i + 1}`).toHaveFocus();
  }
}

/**
 * For each key, focus `element`, press the key, and run `assert`. Verifies a
 * control activates on those keys (e.g. Enter and Space on a button-like
 * control). `reset` runs between keys to restore state.
 */
export async function expectActivatesOn(
  user: UserEvent,
  element: HTMLElement,
  keys: string[],
  assert: () => void | Promise<void>,
  reset?: () => void | Promise<void>,
): Promise<void> {
  for (const key of keys) {
    element.focus();
    expect(element).toHaveFocus();
    await user.keyboard(key);
    await assert();
    if (reset) await reset();
  }
}

/**
 * Assert focus is trapped within `container`: Tab from the last focusable wraps
 * to the first, and Shift+Tab from the first wraps to the last, never escaping.
 */
export async function expectFocusTrap(user: UserEvent, container: HTMLElement): Promise<void> {
  const focusable = getFocusable(container);
  expect(focusable.length, "Focus trap needs at least one focusable element").toBeGreaterThan(0);
  const first = focusable[0]!;
  const last = focusable[focusable.length - 1]!;

  last.focus();
  await user.tab();
  expect(container.contains(document.activeElement), "Tab escaped the trap forward").toBe(true);
  expect(first).toHaveFocus();

  first.focus();
  await user.tab({ shift: true });
  expect(container.contains(document.activeElement), "Shift+Tab escaped the trap backward").toBe(
    true,
  );
  expect(last).toHaveFocus();
}

/**
 * Assert Escape dismisses an open overlay. `isOpen` is polled after the press
 * (Base UI closes asynchronously).
 */
export async function expectEscapeCloses(
  user: UserEvent,
  isOpen: () => boolean,
): Promise<void> {
  expect(isOpen(), "Overlay should be open before pressing Escape").toBe(true);
  await user.keyboard("{Escape}");
  await expect.poll(isOpen, { timeout: 1000 }).toBe(false);
}

/**
 * Assert the open→close cycle returns focus to the trigger. `open` and `close`
 * perform those actions; `isOpen` reports overlay state.
 */
export async function expectFocusReturn(
  trigger: HTMLElement,
  open: () => Promise<void>,
  close: () => Promise<void>,
  isOpen: () => boolean,
): Promise<void> {
  await open();
  await expect.poll(isOpen, { timeout: 1000 }).toBe(true);
  await close();
  await expect.poll(isOpen, { timeout: 1000 }).toBe(false);
  await expect.poll(() => trigger === document.activeElement, { timeout: 1000 }).toBe(true);
}
