// SPDX-License-Identifier: MIT

import { render, screen, within } from "@testing-library/react";
import * as React from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MemorableDate } from "@/components/memorable-date";
import type { MemorableDateValue } from "@/components/memorable-date";
import { axeCheck } from "../../../test/setup.js";

describe("MemorableDate accessibility (axe)", () => {
  it("default is axe-clean", async () => {
    const { container } = render(<MemorableDate legend="Date of birth" />);
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("with hint is axe-clean", async () => {
    const { container } = render(
      <MemorableDate legend="Date of birth" hint="For example: January 19 2000" />,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("error state is axe-clean", async () => {
    const { container } = render(
      <MemorableDate legend="Date of birth" error="Enter a complete date." />,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("required and disabled are axe-clean", async () => {
    const { container } = render(
      <MemorableDate legend="Date of birth" required disabled />,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});

describe("MemorableDate structure", () => {
  it("renders a fieldset with the legend as the group name", () => {
    render(<MemorableDate legend="Date of birth" />);

    const group = screen.getByRole("group", { name: "Date of birth" });
    expect(group.tagName).toBe("FIELDSET");
    expect(within(group).getByText("Date of birth").tagName).toBe("LEGEND");
  });

  it("renders three sub-fields, each with its own visible label", () => {
    render(<MemorableDate legend="Date of birth" />);

    // Month is a select (combobox); Day and Year are numeric text inputs.
    expect(screen.getByRole("combobox", { name: "Month" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Day" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Year" })).toBeInTheDocument();
  });

  it("renders custom translatable sub-labels", () => {
    render(
      <MemorableDate
        legend="Fecha de nacimiento"
        subLabels={{ month: "Mes", day: "Día", year: "Año" }}
      />,
    );
    expect(screen.getByRole("combobox", { name: "Mes" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Día" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Año" })).toBeInTheDocument();
  });
});

describe("MemorableDate month select", () => {
  it("renders a placeholder plus twelve month options with 1-based values", () => {
    render(<MemorableDate legend="Date of birth" />);

    const month = screen.getByRole("combobox", { name: "Month" });
    const options = within(month).getAllByRole("option");
    // 1 placeholder + 12 months
    expect(options).toHaveLength(13);
    expect(options[0]).toHaveValue("");
    expect(options[1]).toHaveTextContent("January");
    expect(options[1]).toHaveValue("1");
    expect(options[12]).toHaveTextContent("December");
    expect(options[12]).toHaveValue("12");
  });

  it("uses a custom placeholder and translated month names", () => {
    render(
      <MemorableDate
        legend="Date de naissance"
        monthPlaceholderLabel="- Choisir -"
        monthLabels={[
          "Janvier",
          "Février",
          "Mars",
          "Avril",
          "Mai",
          "Juin",
          "Juillet",
          "Août",
          "Septembre",
          "Octobre",
          "Novembre",
          "Décembre",
        ]}
      />,
    );
    const month = screen.getByRole("combobox", { name: "Month" });
    const options = within(month).getAllByRole("option");
    expect(options[0]).toHaveTextContent("- Choisir -");
    expect(options[1]).toHaveTextContent("Janvier");
  });
});

describe("MemorableDate numeric inputs", () => {
  it("exposes inputmode numeric and digit-limited maxlength on Day and Year", () => {
    render(<MemorableDate legend="Date of birth" />);

    const day = screen.getByRole("textbox", { name: "Day" });
    const year = screen.getByRole("textbox", { name: "Year" });

    expect(day).toHaveAttribute("inputmode", "numeric");
    expect(day).toHaveAttribute("maxlength", "2");
    expect(year).toHaveAttribute("inputmode", "numeric");
    expect(year).toHaveAttribute("maxlength", "4");
  });

  it("passes per-field autocomplete tokens through (WCAG 1.3.5)", () => {
    render(
      <MemorableDate
        legend="Date of birth"
        autoComplete={{ month: "bday-month", day: "bday-day", year: "bday-year" }}
      />,
    );
    expect(screen.getByRole("combobox", { name: "Month" })).toHaveAttribute(
      "autocomplete",
      "bday-month",
    );
    expect(screen.getByRole("textbox", { name: "Day" })).toHaveAttribute(
      "autocomplete",
      "bday-day",
    );
    expect(screen.getByRole("textbox", { name: "Year" })).toHaveAttribute(
      "autocomplete",
      "bday-year",
    );
  });
});

describe("MemorableDate hint and error wiring at the group level", () => {
  it("links the hint to the fieldset via aria-describedby", () => {
    render(<MemorableDate legend="Date of birth" hint="Month, day, year" />);

    const group = screen.getByRole("group", { name: "Date of birth" });
    const describedBy = group.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const hint = document.getElementById(describedBy!.split(" ")[0]!);
    expect(hint).toHaveTextContent("Month, day, year");
  });

  it("links the error to the fieldset and marks each sub-field invalid", () => {
    render(
      <MemorableDate legend="Date of birth" error="Enter a complete date." />,
    );

    const group = screen.getByRole("group", { name: "Date of birth" });
    const describedBy = group.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!.split(" ").at(-1)!)).toHaveTextContent(
      "Enter a complete date.",
    );

    // Non-color error indicator surfaces on each control (aria-invalid).
    expect(screen.getByRole("combobox", { name: "Month" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByRole("textbox", { name: "Day" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByRole("textbox", { name: "Year" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});

describe("MemorableDate value handling", () => {
  it("works uncontrolled from a defaultValue", async () => {
    const user = userEvent.setup();
    render(
      <MemorableDate
        legend="Date of birth"
        defaultValue={{ month: "1", day: "", year: "" }}
      />,
    );

    const day = screen.getByRole("textbox", { name: "Day" });
    await user.type(day, "19");
    expect(day).toHaveValue("19");
    expect(screen.getByRole("combobox", { name: "Month" })).toHaveValue("1");
  });

  it("is controlled: reports the full next value and reflects the prop", async () => {
    const user = userEvent.setup();

    function Controlled(): React.JSX.Element {
      const [value, setValue] = React.useState<MemorableDateValue>({
        month: "",
        day: "",
        year: "",
      });
      return (
        <MemorableDate legend="Date of birth" value={value} onChange={setValue} />
      );
    }

    render(<Controlled />);
    const year = screen.getByRole("textbox", { name: "Year" });
    await user.type(year, "2000");
    expect(year).toHaveValue("2000");
  });

  it("calls onChange with the complete value object on each edit", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MemorableDate legend="Date of birth" onChange={onChange} />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Month" }),
      "3",
    );
    expect(onChange).toHaveBeenLastCalledWith({ month: "3", day: "", year: "" });
  });
});

describe("MemorableDate keyboard order (no auto-advance)", () => {
  it("tabs Month -> Day -> Year in reading order", async () => {
    const user = userEvent.setup();
    render(<MemorableDate legend="Date of birth" />);

    await user.tab();
    expect(screen.getByRole("combobox", { name: "Month" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("textbox", { name: "Day" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("textbox", { name: "Year" })).toHaveFocus();
  });

  it("does not move focus off Day after two digits (no auto-advance)", async () => {
    const user = userEvent.setup();
    render(<MemorableDate legend="Date of birth" />);

    const day = screen.getByRole("textbox", { name: "Day" });
    day.focus();
    await user.keyboard("12");
    // Focus stays on Day; the user decides when to leave the field.
    expect(day).toHaveFocus();
    expect(screen.getByRole("textbox", { name: "Year" })).not.toHaveFocus();
  });

  it("removes all sub-fields from the tab order when disabled", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <MemorableDate legend="Date of birth" disabled />
        <button type="button">after</button>
      </div>,
    );

    await user.tab();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });
});

describe("MemorableDate RTL", () => {
  it("renders and stays axe-clean in a dir=rtl document", async () => {
    const { container } = render(
      <div dir="rtl" lang="ar">
        <MemorableDate
          legend="تاريخ الميلاد"
          subLabels={{ month: "الشهر", day: "اليوم", year: "السنة" }}
        />
      </div>,
    );

    const group = screen.getByRole("group", { name: "تاريخ الميلاد" });
    expect(group).toBeInTheDocument();
    // Sub-fields are in DOM (reading) order; the inline axis mirrors via CSS.
    expect(within(group).getByRole("combobox", { name: "الشهر" })).toBeInTheDocument();
    expect(within(group).getByRole("textbox", { name: "اليوم" })).toBeInTheDocument();
    expect(within(group).getByRole("textbox", { name: "السنة" })).toBeInTheDocument();
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});
