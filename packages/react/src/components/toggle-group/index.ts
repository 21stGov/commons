// SPDX-License-Identifier: MIT

// `Toggle` is intentionally NOT re-exported here: it is owned by the `toggle`
// barrel, and re-exporting it from both would make the name ambiguous (and
// silently dropped) under the two `export *` lines in the package root.
export {
  ToggleGroup,
  toggleGroupVariants,
  type ToggleGroupProps,
} from "@/components/toggle-group/toggle-group";
