// SPDX-License-Identifier: MIT

import { render, screen } from "@testing-library/react";
import * as React from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FieldProvider } from "@/components/field/context";
import { Input } from "@/components/input";
import { axeCheck } from "../../../test/setup.js";

/** A labeled Input, since a form control without a name is an axe failure. */
function LabeledInput(
  props: React.ComponentProps<typeof Input>,
): React.JSX.Element {
  return (
    <div>
      <label htmlFor="city">City</label>
      <Input id="city" {...props} />
    </div>
  );
}

describe("Input accessibility (axe)", () => {
  it("default is axe-clean", async () => {
    const { container } = render(<LabeledInput />);
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("with prefix and suffix is axe-clean", async () => {
    const { container } = render(<LabeledInput prefix="$" suffix="USD" />);
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("disabled is axe-clean", async () => {
    const { container } = render(<LabeledInput disabled />);
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("error state is axe-clean", async () => {
    const { container } = render(
      <div>
        <LabeledInput aria-invalid aria-describedby="city-err" />
        <p id="city-err">Enter a city name.</p>
      </div>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("inside a Field with hint and error is axe-clean", async () => {
    const { container } = render(
      <FieldProvider id="town" hasHint hasError>
        <label htmlFor="town">Town</label>
        <p id="town-hint">The town you live in.</p>
        <Input />
        <p id="town-error">Enter a town.</p>
      </FieldProvider>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});

describe("Input name, role, and value", () => {
  it("renders a native input with role textbox and its accessible name", () => {
    render(<LabeledInput />);

    const input = screen.getByRole("textbox", { name: "City" });
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveAttribute("data-slot", "input");
  });

  it("reflects typed text as its value", async () => {
    const user = userEvent.setup();
    render(<LabeledInput />);

    const input = screen.getByRole("textbox", { name: "City" });
    await user.type(input, "Chattanooga");
    expect(input).toHaveValue("Chattanooga");
  });

  it("passes autocomplete through to the native input (WCAG 1.3.5)", () => {
    render(<LabeledInput autoComplete="address-level2" />);
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "autocomplete",
      "address-level2",
    );
  });

  it("exposes aria-invalid on the native input in the error state", () => {
    render(<LabeledInput aria-invalid />);
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});

describe("Input prefix/suffix slots", () => {
  it("renders adornments as aria-hidden decoration", () => {
    const { container } = render(<LabeledInput prefix="$" suffix="USD" />);

    const prefix = container.querySelector('[data-slot="input-prefix"]');
    const suffix = container.querySelector('[data-slot="input-suffix"]');
    expect(prefix).toHaveAttribute("aria-hidden", "true");
    expect(prefix).toHaveTextContent("$");
    expect(suffix).toHaveAttribute("aria-hidden", "true");
    expect(suffix).toHaveTextContent("USD");
  });

  it("keeps the group a single tab stop", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button type="button">before</button>
        <LabeledInput prefix="$" suffix="USD" />
        <button type="button">after</button>
      </div>,
    );

    await user.tab();
    expect(screen.getByRole("button", { name: "before" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("textbox", { name: "City" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });

  it("mirrors error and disabled state onto the group wrapper", () => {
    const { container } = render(
      <LabeledInput prefix="$" aria-invalid disabled />,
    );

    const group = container.querySelector('[data-slot="input-group"]');
    expect(group).toHaveAttribute("data-invalid");
    expect(group).toHaveAttribute("data-disabled");
  });
});

describe("Input keyboard contract", () => {
  it("receives focus with Tab and accepts text", async () => {
    const user = userEvent.setup();
    render(<LabeledInput />);

    await user.tab();
    const input = screen.getByRole("textbox", { name: "City" });
    expect(input).toHaveFocus();

    await user.keyboard("Knoxville");
    expect(input).toHaveValue("Knoxville");
  });

  it("is removed from the tab order when disabled", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <LabeledInput disabled />
        <button type="button">after</button>
      </div>,
    );

    await user.tab();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });
});

describe("Input Field wiring", () => {
  it("inherits id, aria-describedby, aria-invalid, required, and disabled from the Field", () => {
    render(
      <FieldProvider id="zip" hasHint hasError required disabled>
        <label htmlFor="zip">ZIP code</label>
        <p id="zip-hint">Five digits.</p>
        <Input />
        <p id="zip-error">Enter a ZIP code.</p>
      </FieldProvider>,
    );

    const input = screen.getByLabelText("ZIP code");
    expect(input).toHaveAttribute("id", "zip");
    expect(input).toHaveAttribute("aria-describedby", "zip-hint zip-error");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
  });

  it("lets explicit props win over Field-provided values", () => {
    render(
      <FieldProvider id="zip" hasHint hasError required disabled>
        <label htmlFor="custom-id">ZIP code</label>
        <Input
          id="custom-id"
          aria-describedby="my-desc"
          aria-invalid={false}
          required={false}
          disabled={false}
        />
      </FieldProvider>,
    );

    const input = screen.getByLabelText("ZIP code");
    expect(input).toHaveAttribute("id", "custom-id");
    expect(input).toHaveAttribute("aria-describedby", "my-desc");
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(input).not.toBeRequired();
    expect(input).not.toBeDisabled();
  });

  it("renders standalone without Field attributes", () => {
    render(<Input aria-label="Search" />);

    const input = screen.getByRole("textbox", { name: "Search" });
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toBeRequired();
    expect(input).not.toBeDisabled();
  });
});

describe("Input disabled state", () => {
  it("uses the dedicated disabled contrast tokens, not opacity", () => {
    render(<LabeledInput disabled />);

    const input = screen.getByLabelText("City");
    expect(input.className).toContain("disabled:bg-disabled");
    expect(input.className).toContain("disabled:text-disabled-foreground");
    expect(input.className).toContain("disabled:border-disabled-border");
    expect(input.className).not.toContain("opacity");
  });
});

describe("Input RTL", () => {
  it("renders and stays axe-clean in a dir=rtl document", async () => {
    const { container } = render(
      <div dir="rtl">
        <label htmlFor="madina">المدينة</label>
        <Input id="madina" prefix="$" />
      </div>,
    );

    expect(
      screen.getByRole("textbox", { name: "المدينة" }),
    ).toBeInTheDocument();
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});
