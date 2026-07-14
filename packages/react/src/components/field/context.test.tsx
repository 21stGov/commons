// SPDX-License-Identifier: MIT

import { render, renderHook, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";

import { FieldProvider, useFieldControl } from "@/components/field/context";
import type { FieldProviderProps } from "@/components/field/context";

function wrapperWith(props: Omit<FieldProviderProps, "children">) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <FieldProvider {...props}>{children}</FieldProvider>;
  };
}

describe("useFieldControl", () => {
  it("returns an empty object outside a FieldProvider (standalone-safe)", () => {
    const { result } = renderHook(() => useFieldControl());

    expect(result.current).toEqual({});
  });

  it("returns the provided id and omits absent keys inside a bare FieldProvider", () => {
    const { result } = renderHook(() => useFieldControl(), {
      wrapper: wrapperWith({ id: "email" }),
    });

    expect(result.current).toEqual({ id: "email" });
    expect(result.current).not.toHaveProperty("aria-describedby");
    expect(result.current).not.toHaveProperty("aria-invalid");
    expect(result.current).not.toHaveProperty("required");
    expect(result.current).not.toHaveProperty("disabled");
  });

  it("generates a stable id via React.useId when none is provided", () => {
    const { result, rerender } = renderHook(() => useFieldControl(), {
      wrapper: wrapperWith({}),
    });

    const first = result.current.id;
    expect(first).toBeTruthy();

    rerender();
    expect(result.current.id).toBe(first);
  });

  it("describes the control by the hint id when only a hint is rendered", () => {
    const { result } = renderHook(() => useFieldControl(), {
      wrapper: wrapperWith({ id: "email", hasHint: true }),
    });

    expect(result.current["aria-describedby"]).toBe("email-hint");
    expect(result.current["aria-invalid"]).toBeUndefined();
  });

  it("describes the control by the error id and sets aria-invalid when only an error is rendered", () => {
    const { result } = renderHook(() => useFieldControl(), {
      wrapper: wrapperWith({ id: "email", hasError: true }),
    });

    expect(result.current["aria-describedby"]).toBe("email-error");
    expect(result.current["aria-invalid"]).toBe(true);
  });

  it("orders aria-describedby hint id first, then error id", () => {
    const { result } = renderHook(() => useFieldControl(), {
      wrapper: wrapperWith({ id: "email", hasHint: true, hasError: true }),
    });

    expect(result.current["aria-describedby"]).toBe("email-hint email-error");
  });

  it("allows invalid to be forced on without a rendered error message", () => {
    const { result } = renderHook(() => useFieldControl(), {
      wrapper: wrapperWith({ id: "email", invalid: true }),
    });

    expect(result.current["aria-invalid"]).toBe(true);
    expect(result.current).not.toHaveProperty("aria-describedby");
  });

  it("passes required and disabled through only when true", () => {
    const { result } = renderHook(() => useFieldControl(), {
      wrapper: wrapperWith({ id: "email", required: true, disabled: true }),
    });

    expect(result.current.required).toBe(true);
    expect(result.current.disabled).toBe(true);

    const { result: offResult } = renderHook(() => useFieldControl(), {
      wrapper: wrapperWith({ id: "email", required: false, disabled: false }),
    });

    expect(offResult.current).not.toHaveProperty("required");
    expect(offResult.current).not.toHaveProperty("disabled");
  });

  it("spreads cleanly onto a native input", () => {
    function Input() {
      const control = useFieldControl();
      return <input type="text" {...control} />;
    }

    render(
      <FieldProvider id="name" hasHint hasError required>
        <Input />
      </FieldProvider>,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("id", "name");
    expect(input).toHaveAttribute("aria-describedby", "name-hint name-error");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toBeRequired();
  });
});
