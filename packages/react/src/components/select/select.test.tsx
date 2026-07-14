// SPDX-License-Identifier: MIT

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { FieldProvider } from "@/components/field/context";
import { Select, type SelectProps } from "@/components/select";
import { axeCheck } from "../../../test/setup.js";

const SIZES = ["sm", "md", "lg"] as const satisfies readonly NonNullable<
  SelectProps["size"]
>[];

function FruitSelect(props: SelectProps): React.JSX.Element {
  return (
    <Select aria-label="Fruit" {...props}>
      <option value="apple">Apple</option>
      <option value="banana">Banana</option>
      <option value="cherry">Cherry</option>
    </Select>
  );
}

describe("Select accessibility (axe)", () => {
  for (const size of SIZES) {
    it(`size "${size}" is axe-clean`, async () => {
      const { container } = render(<FruitSelect size={size} />);
      expect(await axeCheck(container)).toHaveNoViolations();
    });
  }

  it("disabled state is axe-clean", async () => {
    const { container } = render(<FruitSelect disabled />);
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("placeholder + required state is axe-clean", async () => {
    const { container } = render(
      <FruitSelect placeholder="Choose a fruit" required />,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("error state inside a Field is axe-clean", async () => {
    const { container } = render(
      <FieldProvider id="fruit" hasError>
        <FruitSelect />
        <p id="fruit-error">Choose a fruit.</p>
      </FieldProvider>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("labelled via <label htmlFor> is axe-clean", async () => {
    const { container } = render(
      <>
        <label htmlFor="fruit">Fruit</label>
        <Select id="fruit">
          <option value="apple">Apple</option>
        </Select>
      </>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});

describe("Select name, role, and value", () => {
  it("renders a native select with role combobox and its accessible name", () => {
    render(<FruitSelect />);

    const select = screen.getByRole("combobox", { name: "Fruit" });
    expect(select.tagName).toBe("SELECT");
    expect(select).toHaveAttribute("data-slot", "select");
  });

  it("renders its options with role option", () => {
    render(<FruitSelect />);

    const options = screen.getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      "Apple",
      "Banana",
      "Cherry",
    ]);
  });

  it("takes its accessible name from an associated <label>", () => {
    render(
      <>
        <label htmlFor="fruit">Favorite fruit</label>
        <Select id="fruit">
          <option value="apple">Apple</option>
        </Select>
      </>,
    );

    expect(
      screen.getByRole("combobox", { name: "Favorite fruit" }),
    ).toBeInTheDocument();
  });

  it("hides the chevron from assistive technology", () => {
    const { container } = render(<FruitSelect />);

    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("omits the chevron for multiple selects", () => {
    const { container } = render(
      <Select aria-label="Fruits" multiple>
        <option value="apple">Apple</option>
      </Select>,
    );

    expect(container.querySelector("svg")).toBeNull();
  });
});

describe("Select value selection (user-event)", () => {
  it("updates value with selectOptions", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FruitSelect defaultValue="apple" onChange={onChange} />);

    const select = screen.getByRole("combobox", { name: "Fruit" });
    await user.selectOptions(select, "banana");

    expect(select).toHaveValue("banana");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("option", { name: "Banana", selected: true }),
    ).toBeInTheDocument();
  });

  it("can select by visible option label", async () => {
    const user = userEvent.setup();
    render(<FruitSelect />);

    const select = screen.getByRole("combobox", { name: "Fruit" });
    await user.selectOptions(select, screen.getByRole("option", { name: "Cherry" }));

    expect(select).toHaveValue("cherry");
  });

  it("does not change value when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FruitSelect disabled defaultValue="apple" onChange={onChange} />);

    const select = screen.getByRole("combobox", { name: "Fruit" });
    await user.selectOptions(select, "banana");
    expect(select).toHaveValue("apple");
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("Select keyboard contract", () => {
  it("receives focus with Tab", async () => {
    const user = userEvent.setup();
    render(<FruitSelect />);

    await user.tab();
    expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveFocus();
  });

  it("is skipped by Tab when disabled", async () => {
    const user = userEvent.setup();
    render(
      <>
        <FruitSelect disabled />
        <button type="button">After</button>
      </>,
    );

    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
  });

  it("stays in the natural tab order between other controls", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <FruitSelect />
        <button type="button">After</button>
      </>,
    );

    await user.tab();
    await user.tab();
    expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
  });
});

describe("Select Field wiring", () => {
  it("adopts id, describedby, invalid, required, and disabled from the Field", () => {
    render(
      <FieldProvider id="fruit" hasHint hasError required disabled>
        <FruitSelect />
        <p id="fruit-hint">Pick one.</p>
        <p id="fruit-error">Choose a fruit.</p>
      </FieldProvider>,
    );

    const select = screen.getByRole("combobox", { name: "Fruit" });
    expect(select).toHaveAttribute("id", "fruit");
    expect(select).toHaveAttribute(
      "aria-describedby",
      "fruit-hint fruit-error",
    );
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select).toBeRequired();
    expect(select).toBeDisabled();
  });

  it("omits state attributes the Field does not set", () => {
    render(
      <FieldProvider id="fruit">
        <FruitSelect />
      </FieldProvider>,
    );

    const select = screen.getByRole("combobox", { name: "Fruit" });
    expect(select).not.toHaveAttribute("aria-describedby");
    expect(select).not.toHaveAttribute("aria-invalid");
    expect(select).not.toBeRequired();
    expect(select).not.toBeDisabled();
  });

  it("lets explicit props win over Field wiring", () => {
    render(
      <FieldProvider id="fruit" hasHint>
        <FruitSelect id="custom" aria-describedby="elsewhere" />
      </FieldProvider>,
    );

    const select = screen.getByRole("combobox", { name: "Fruit" });
    expect(select).toHaveAttribute("id", "custom");
    expect(select).toHaveAttribute("aria-describedby", "elsewhere");
  });

  it("works standalone outside a FieldProvider", () => {
    render(<FruitSelect />);

    const select = screen.getByRole("combobox", { name: "Fruit" });
    expect(select).not.toHaveAttribute("aria-describedby");
    expect(select).not.toHaveAttribute("aria-invalid");
  });
});

describe("Select placeholder", () => {
  it("renders a disabled placeholder option selected by default", () => {
    render(<FruitSelect placeholder="Choose a fruit" />);

    const select = screen.getByRole("combobox", { name: "Fruit" });
    expect(select).toHaveValue("");

    const placeholder = screen.getByRole("option", { name: "Choose a fruit" });
    expect(placeholder).toBeDisabled();
    expect(placeholder).toHaveValue("");
  });

  it("cannot be re-selected once a real option is chosen (documented trade-off)", async () => {
    const user = userEvent.setup();
    render(<FruitSelect placeholder="Choose a fruit" />);

    const select = screen.getByRole("combobox", { name: "Fruit" });
    await user.selectOptions(select, "banana");
    expect(select).toHaveValue("banana");

    const placeholder = screen.getByRole("option", { name: "Choose a fruit" });
    await user.selectOptions(select, placeholder);
    expect(select).toHaveValue("banana");
  });

  it("fails native required validation while the placeholder is selected", () => {
    render(<FruitSelect placeholder="Choose a fruit" required />);

    const select = screen.getByRole<HTMLSelectElement>("combobox", {
      name: "Fruit",
    });
    expect(select.checkValidity()).toBe(false);
  });

  it("does not override an explicit defaultValue", () => {
    render(<FruitSelect placeholder="Choose a fruit" defaultValue="cherry" />);

    expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveValue(
      "cherry",
    );
  });
});

describe("Select RTL", () => {
  it("renders and stays axe-clean in a dir=rtl document", async () => {
    const { container } = render(
      <div dir="rtl">
        <Select aria-label="فاكهة" defaultValue="apple">
          <option value="apple">تفاح</option>
          <option value="banana">موز</option>
        </Select>
      </div>,
    );

    expect(
      screen.getByRole("combobox", { name: "فاكهة" }),
    ).toBeInTheDocument();
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("selects options in RTL", async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        <Select aria-label="فاكهة" defaultValue="apple">
          <option value="apple">تفاح</option>
          <option value="banana">موز</option>
        </Select>
      </div>,
    );

    const select = screen.getByRole("combobox", { name: "فاكهة" });
    await user.selectOptions(select, "banana");
    expect(select).toHaveValue("banana");
  });
});
