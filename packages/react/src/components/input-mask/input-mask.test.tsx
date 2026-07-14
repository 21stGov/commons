// SPDX-License-Identifier: MIT

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { InputMask, applyMask, maskToPattern } from "@/components/input-mask";
import { FieldProvider } from "@/components/field/context";
import { axeCheck } from "../../../test/setup.js";

describe("InputMask masking helpers", () => {
  it("applies a mask by inserting separators around entered digits", () => {
    expect(applyMask("5551234567", "(###) ###-####")).toBe("(555) 123-4567");
    expect(applyMask("123456789", "###-##-####")).toBe("123-45-6789");
    expect(applyMask("12345", "#####-####")).toBe("12345");
    expect(applyMask("123456789", "#####-####")).toBe("12345-6789");
  });

  it("never emits a trailing separator (keeps editing forgiving)", () => {
    // Three digits stop before the ") " group; four cross into it.
    expect(applyMask("555", "(###) ###-####")).toBe("(555");
    expect(applyMask("5551", "(###) ###-####")).toBe("(555) 1");
  });

  it("ignores non-digits and caps at the mask's digit capacity", () => {
    expect(applyMask("a5b5c5!!!!!!!!!!", "###")).toBe("555");
    expect(applyMask("", "(###) ###-####")).toBe("");
  });

  it("builds a full-value pattern with escaped separators", () => {
    expect(maskToPattern("(###) ###-####")).toBe("\\(\\d\\d\\d\\) \\d\\d\\d-\\d\\d\\d\\d");
    expect(maskToPattern("##/##/####")).toBe("\\d\\d/\\d\\d/\\d\\d\\d\\d");
  });
});

describe("InputMask name, role, and value", () => {
  it("renders a textbox with its accessible name and mask attributes", () => {
    render(<InputMask mask="phone" aria-label="Phone number" />);
    const input = screen.getByRole("textbox", { name: "Phone number" });
    expect(input).toHaveAttribute("inputmode", "tel");
    expect(input).toHaveAttribute("maxlength", "14");
    expect(input).toHaveAttribute("pattern", "\\(\\d\\d\\d\\) \\d\\d\\d-\\d\\d\\d\\d");
  });

  it("derives inputMode, maxLength, and placeholder per preset", () => {
    render(<InputMask mask="ssn" aria-label="SSN" />);
    const input = screen.getByRole("textbox", { name: "SSN" });
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("maxlength", "11");
    expect(input).toHaveAttribute("placeholder", "555-55-5555");
  });

  it("shows a re-masked controlled value", () => {
    render(<InputMask mask="date" aria-label="Date" value="12252026" />);
    expect(screen.getByRole("textbox", { name: "Date" })).toHaveValue(
      "12/25/2026",
    );
  });
});

describe("InputMask typing behavior", () => {
  it("inserts separators as the user types (uncontrolled)", async () => {
    const user = userEvent.setup();
    render(<InputMask mask="phone" aria-label="Phone number" />);

    const input = screen.getByRole("textbox", { name: "Phone number" });
    await user.type(input, "5551234567");
    expect(input).toHaveValue("(555) 123-4567");
  });

  it("keeps Backspace forgiving — one digit removed, no trap", async () => {
    const user = userEvent.setup();
    render(<InputMask mask="phone" aria-label="Phone number" />);

    const input = screen.getByRole("textbox", { name: "Phone number" });
    await user.type(input, "5551234567");
    await user.type(input, "{Backspace}");
    expect(input).toHaveValue("(555) 123-456");
  });

  it("re-masks pasted input", async () => {
    const user = userEvent.setup();
    render(<InputMask mask="phone" aria-label="Phone number" />);

    const input = screen.getByRole("textbox", { name: "Phone number" });
    await user.click(input);
    await user.paste("555.123.4567");
    expect(input).toHaveValue("(555) 123-4567");
  });

  it("reports the masked value through onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <InputMask mask="zip" aria-label="ZIP code" onChange={onChange} />,
    );

    const input = screen.getByRole("textbox", { name: "ZIP code" });
    await user.type(input, "12345");
    expect(onChange).toHaveBeenLastCalledWith("12345", expect.anything());
  });

  it("leaves the raw value unformatted when formatOnType is off", async () => {
    const user = userEvent.setup();
    render(
      <InputMask
        mask="phone"
        aria-label="Phone number"
        formatOnType={false}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Phone number" });
    await user.type(input, "5551234567");
    expect(input).toHaveValue("5551234567");
  });

  it("supports a custom mask template", async () => {
    const user = userEvent.setup();
    render(<InputMask mask="###-###" aria-label="Code" />);

    const input = screen.getByRole("textbox", { name: "Code" });
    expect(input).toHaveAttribute("maxlength", "7");
    await user.type(input, "123456");
    expect(input).toHaveValue("123-456");
  });
});

describe("InputMask secure entry", () => {
  it("renders a password field with a reveal toggle by default", () => {
    const { container } = render(
      <InputMask mask="ssn" aria-label="SSN" secure />,
    );
    // A password input has no textbox role, so query the element directly.
    const input = container.querySelector("input");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("autocomplete", "off");

    const toggle = screen.getByRole("button", { name: "Show" });
    expect(toggle).toHaveAttribute("type", "button");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("reveals the value as plain text when the toggle is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <InputMask mask="ssn" aria-label="SSN" secure />,
    );

    await user.click(screen.getByRole("button", { name: "Show" }));

    // Now a text input, findable as a textbox, with the toggle showing "Hide".
    const input = screen.getByRole("textbox", { name: "SSN" });
    expect(input).toHaveAttribute("type", "text");
    const toggle = screen.getByRole("button", { name: "Hide" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    await user.click(toggle);
    expect(container.querySelector("input")).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("toggles reveal with the keyboard (Tab then Enter/Space)", async () => {
    const user = userEvent.setup();
    render(<InputMask mask="ssn" aria-label="SSN" secure />);

    // The field is first in the tab order, then the reveal toggle.
    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: "Show" })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Hide" })).toHaveFocus();
    await user.keyboard(" ");
    expect(screen.getByRole("button", { name: "Show" })).toBeInTheDocument();
  });

  it("keeps masking the value while secure", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <InputMask mask="ssn" aria-label="SSN" secure />,
    );

    const input = container.querySelector("input")!;
    await user.type(input, "123456789");
    // The underlying value is masked even though it renders as bullets.
    expect(input).toHaveValue("123-45-6789");
  });

  it("uses custom translatable show/hide labels", async () => {
    const user = userEvent.setup();
    render(
      <InputMask
        mask="ssn"
        aria-label="NSS"
        secure
        showLabel="Mostrar"
        hideLabel="Ocultar"
      />,
    );

    const toggle = screen.getByRole("button", { name: "Mostrar" });
    await user.click(toggle);
    expect(screen.getByRole("button", { name: "Ocultar" })).toBeInTheDocument();
  });

  it("is axe-clean secure inside a Field, hidden and revealed", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <FieldProvider id="ssn" hasHint>
        <label htmlFor="ssn">Social Security number</label>
        <InputMask mask="ssn" secure />
        <p id="ssn-hint">Format: 555-55-5555.</p>
      </FieldProvider>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();

    await user.click(screen.getByRole("button", { name: "Show" }));
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});

describe("InputMask Field wiring", () => {
  it("adopts id, describedby, invalid, required, and disabled from the Field", () => {
    render(
      <FieldProvider id="phone" hasHint hasError required disabled>
        <InputMask mask="phone" />
        <p id="phone-hint">Format: (555) 555-5555.</p>
        <p id="phone-error">Enter a phone number.</p>
      </FieldProvider>,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("id", "phone");
    expect(input).toHaveAttribute(
      "aria-describedby",
      "phone-hint phone-error",
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
  });

  it("associates the format hint so screen readers announce it", () => {
    render(
      <FieldProvider id="ssn" hasHint>
        <InputMask mask="ssn" />
        <p id="ssn-hint">Format: 555-55-5555.</p>
      </FieldProvider>,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby", "ssn-hint");
    expect(screen.getByText("Format: 555-55-5555.")).toHaveAttribute(
      "id",
      "ssn-hint",
    );
  });
});

describe("InputMask accessibility (axe)", () => {
  it("is axe-clean standalone with an accessible name", async () => {
    const { container } = render(
      <InputMask mask="phone" aria-label="Phone number" />,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("is axe-clean inside a Field with a hint", async () => {
    const { container } = render(
      <FieldProvider id="date" hasHint>
        <label htmlFor="date">Date of birth</label>
        <InputMask mask="date" />
        <p id="date-hint">Format: MM/DD/YYYY.</p>
      </FieldProvider>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("is axe-clean in an error state", async () => {
    const { container } = render(
      <FieldProvider id="zip" hasError>
        <label htmlFor="zip">ZIP code</label>
        <InputMask mask="zip" />
        <p id="zip-error">Enter a ZIP code.</p>
      </FieldProvider>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("is axe-clean when disabled", async () => {
    const { container } = render(
      <InputMask mask="phone" aria-label="Phone number" disabled />,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});

describe("InputMask RTL", () => {
  it("renders and masks inside a dir=rtl document", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div dir="rtl" lang="ar">
        <InputMask mask="phone" aria-label="رقم الهاتف" />
      </div>,
    );

    const input = screen.getByRole("textbox", { name: "رقم الهاتف" });
    expect(input).toBeInTheDocument();
    expect(await axeCheck(container)).toHaveNoViolations();

    await user.type(input, "5551234567");
    expect(input).toHaveValue("(555) 123-4567");
  });
});
