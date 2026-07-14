// SPDX-License-Identifier: MIT

import { render, screen } from "@testing-library/react";
import * as React from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FieldProvider } from "@/components/field/context";
import { Textarea } from "@/components/input";
import { axeCheck } from "../../../test/setup.js";

/** A labeled Textarea, since a control without a name is an axe failure. */
function LabeledTextarea(
  props: React.ComponentProps<typeof Textarea>,
): React.JSX.Element {
  return (
    <div>
      <label htmlFor="notes">Notes</label>
      <Textarea id="notes" {...props} />
    </div>
  );
}

describe("Textarea accessibility (axe)", () => {
  it("default is axe-clean", async () => {
    const { container } = render(<LabeledTextarea />);
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("disabled is axe-clean", async () => {
    const { container } = render(<LabeledTextarea disabled />);
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("error state is axe-clean", async () => {
    const { container } = render(
      <div>
        <LabeledTextarea aria-invalid aria-describedby="notes-err" />
        <p id="notes-err">Enter your notes.</p>
      </div>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("inside a Field with hint and error is axe-clean", async () => {
    const { container } = render(
      <FieldProvider id="report" hasHint hasError>
        <label htmlFor="report">Report</label>
        <p id="report-hint">Describe what happened.</p>
        <Textarea />
        <p id="report-error">A description is required.</p>
      </FieldProvider>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});

describe("Textarea name, role, and value", () => {
  it("renders a native textarea with role textbox and its accessible name", () => {
    render(<LabeledTextarea />);

    const textarea = screen.getByRole("textbox", { name: "Notes" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveAttribute("data-slot", "textarea");
  });

  it("defaults to 3 rows and resizes along the block axis", () => {
    render(<LabeledTextarea />);

    const textarea = screen.getByRole("textbox", { name: "Notes" });
    expect(textarea).toHaveAttribute("rows", "3");
    expect(textarea.className).toContain("[resize:block]");
  });

  it("accepts an explicit rows value", () => {
    render(<LabeledTextarea rows={8} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("rows", "8");
  });

  it("passes autocomplete through to the native textarea (WCAG 1.3.5)", () => {
    render(<LabeledTextarea autoComplete="street-address" />);
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "autocomplete",
      "street-address",
    );
  });

  it("exposes aria-invalid in the error state", () => {
    render(<LabeledTextarea aria-invalid />);
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});

describe("Textarea keyboard contract", () => {
  it("receives focus with Tab and accepts multi-line text", async () => {
    const user = userEvent.setup();
    render(<LabeledTextarea />);

    await user.tab();
    const textarea = screen.getByRole("textbox", { name: "Notes" });
    expect(textarea).toHaveFocus();

    await user.keyboard("line one{Enter}line two");
    expect(textarea).toHaveValue("line one\nline two");
  });

  it("is removed from the tab order when disabled", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <LabeledTextarea disabled />
        <button type="button">after</button>
      </div>,
    );

    await user.tab();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });
});

describe("Textarea Field wiring", () => {
  it("inherits id, aria-describedby, aria-invalid, required, and disabled from the Field", () => {
    render(
      <FieldProvider id="report" hasHint hasError required disabled>
        <label htmlFor="report">Report</label>
        <p id="report-hint">Describe what happened.</p>
        <Textarea />
        <p id="report-error">A description is required.</p>
      </FieldProvider>,
    );

    const textarea = screen.getByLabelText("Report");
    expect(textarea).toHaveAttribute("id", "report");
    expect(textarea).toHaveAttribute(
      "aria-describedby",
      "report-hint report-error",
    );
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toBeRequired();
    expect(textarea).toBeDisabled();
  });

  it("lets explicit props win over Field-provided values", () => {
    render(
      <FieldProvider id="report" hasHint hasError required disabled>
        <label htmlFor="custom-id">Report</label>
        <Textarea
          id="custom-id"
          aria-describedby="my-desc"
          aria-invalid={false}
          required={false}
          disabled={false}
        />
      </FieldProvider>,
    );

    const textarea = screen.getByLabelText("Report");
    expect(textarea).toHaveAttribute("id", "custom-id");
    expect(textarea).toHaveAttribute("aria-describedby", "my-desc");
    expect(textarea).toHaveAttribute("aria-invalid", "false");
    expect(textarea).not.toBeRequired();
    expect(textarea).not.toBeDisabled();
  });

  it("renders standalone without Field attributes", () => {
    render(<Textarea aria-label="Comments" />);

    const textarea = screen.getByRole("textbox", { name: "Comments" });
    expect(textarea).not.toHaveAttribute("aria-describedby");
    expect(textarea).not.toHaveAttribute("aria-invalid");
    expect(textarea).not.toBeRequired();
    expect(textarea).not.toBeDisabled();
  });
});

describe("Textarea disabled state", () => {
  it("uses the dedicated disabled contrast tokens, not opacity", () => {
    render(<LabeledTextarea disabled />);

    const textarea = screen.getByLabelText("Notes");
    expect(textarea.className).toContain("disabled:bg-disabled");
    expect(textarea.className).toContain("disabled:text-disabled-foreground");
    expect(textarea.className).toContain("disabled:border-disabled-border");
    expect(textarea.className).not.toContain("opacity");
  });
});

describe("Textarea RTL", () => {
  it("renders and stays axe-clean in a dir=rtl document", async () => {
    const { container } = render(
      <div dir="rtl">
        <label htmlFor="molahazat">ملاحظات</label>
        <Textarea id="molahazat" />
      </div>,
    );

    expect(
      screen.getByRole("textbox", { name: "ملاحظات" }),
    ).toBeInTheDocument();
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});
