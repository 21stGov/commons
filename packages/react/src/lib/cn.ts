// SPDX-License-Identifier: MIT
// Adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names conditionally, resolving Tailwind CSS utility
 * conflicts so the last conflicting utility wins.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
