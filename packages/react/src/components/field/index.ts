// SPDX-License-Identifier: MIT

// Visual Field wrappers only. The wiring contract (FieldProvider,
// useFieldControl, …) is exported from the package root via
// "@/components/field/context" — do not re-export it here.

export {
  Field,
  FieldGroup,
  type FieldProps,
  type FieldGroupProps,
} from "@/components/field/field";
