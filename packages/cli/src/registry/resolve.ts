// SPDX-License-Identifier: MIT

import { fetchRegistryItem } from "./client.js";
import type { RegistryItem } from "./schema.js";

/**
 * Resolve the requested item names plus their transitive
 * `registryDependencies` into a deduplicated, topologically ordered list
 * (dependencies before dependents).
 *
 * Cycle-safe: a dependency edge back into an item that is still being
 * resolved is skipped instead of recursing forever, so mutually dependent
 * items each appear exactly once.
 */
export async function resolveItems(registry: string, names: string[]): Promise<RegistryItem[]> {
  const order: RegistryItem[] = [];
  const resolved = new Set<string>();
  const visiting = new Set<string>();

  async function visit(name: string): Promise<void> {
    if (resolved.has(name) || visiting.has(name)) {
      return;
    }
    visiting.add(name);
    const item = await fetchRegistryItem(registry, name);
    for (const dependency of item.registryDependencies ?? []) {
      await visit(dependency);
    }
    visiting.delete(name);
    resolved.add(name);
    order.push(item);
  }

  for (const name of names) {
    await visit(name);
  }

  return order;
}
