// SPDX-License-Identifier: MIT

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import {
  TimePicker,
  generateTimeOptions,
  minutesToValue,
  parseTimeToMinutes,
} from "@/components/time-picker";
import { FieldProvider } from "@/components/field/context";
import { axeCheck } from "../../../test/setup.js";

function renderPicker(
  props: Partial<React.ComponentProps<typeof TimePicker>> = {},
): React.JSX.Element {
  return <TimePicker aria-label="Appointment time" locale="en-US" {...props} />;
}

function getInput(name = "Appointment time"): HTMLElement {
  return screen.getByRole("combobox", { name });
}

describe("TimePicker option generation", () => {
  it("parses and formats HH:mm values", () => {
    expect(parseTimeToMinutes("09:30")).toBe(570);
    expect(parseTimeToMinutes("00:00")).toBe(0);
    expect(minutesToValue(570)).toBe("09:30");
    expect(minutesToValue(0)).toBe("00:00");
  });

  it("clamps out-of-range input instead of throwing", () => {
    expect(parseTimeToMinutes("99:99")).toBe(1439);
    expect(parseTimeToMinutes("not a time")).toBe(0);
  });

  it("generates every 30 minutes across a full day by default (48 slots)", () => {
    const options = generateTimeOptions("00:00", "23:30", 30, 12, "en-US");
    expect(options).toHaveLength(48);
    expect(options[0]).toEqual({ value: "00:00", label: "12:00 AM" });
    expect(options.at(-1)).toEqual({ value: "23:30", label: "11:30 PM" });
  });

  it("honors startTime, endTime, and step", () => {
    const options = generateTimeOptions("09:00", "10:00", 15, 24, "en-US");
    expect(options.map((option) => option.value)).toEqual([
      "09:00",
      "09:15",
      "09:30",
      "09:45",
      "10:00",
    ]);
  });

  it("labels in 24-hour form when hourCycle is 24", () => {
    const options = generateTimeOptions("13:00", "13:30", 30, 24, "en-US");
    expect(options.map((option) => option.label)).toEqual(["13:00", "13:30"]);
  });
});

describe("TimePicker name, role, and value", () => {
  it("renders an input with role combobox and its accessible name", () => {
    render(renderPicker());
    expect(getInput().tagName).toBe("INPUT");
  });

  it("wraps the control in a time-picker slot", () => {
    const { container } = render(renderPicker());
    expect(
      container.querySelector('[data-slot="time-picker"]'),
    ).toBeInTheDocument();
  });

  it("shows the selected value's label for a controlled 24h value", () => {
    render(renderPicker({ value: "14:30" }));
    expect(getInput()).toHaveValue("2:30 PM");
  });
});

describe("TimePicker keyboard and filtering", () => {
  it("receives focus with Tab", async () => {
    const user = userEvent.setup();
    render(renderPicker());
    await user.tab();
    expect(getInput()).toHaveFocus();
  });

  it("opens on ArrowDown and lists the generated times", async () => {
    const user = userEvent.setup();
    render(renderPicker({ startTime: "09:00", endTime: "10:00", step: 30 }));

    const input = getInput();
    await user.click(input);
    await user.keyboard("{ArrowDown}");

    expect(input).toHaveAttribute("aria-expanded", "true");
    await screen.findByRole("listbox");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("filters by typing the 24-hour value and selects with Enter", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(renderPicker({ onValueChange }));

    const input = getInput();
    await user.click(input);
    // "13:30" only matches the 24-hour value, not any 12-hour label.
    await user.type(input, "13:30");

    await waitFor(() => {
      expect(
        screen.getByRole("option", { name: "1:30 PM" }),
      ).toBeInTheDocument();
    });

    await user.keyboard("{ArrowDown}{Enter}");
    await waitFor(() => {
      expect(onValueChange).toHaveBeenLastCalledWith("13:30");
    });
    expect(input).toHaveValue("1:30 PM");
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(renderPicker());

    const input = getInput();
    await user.click(input);
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(input).toHaveAttribute("aria-expanded", "false");
    });
  });
});

describe("TimePicker Field wiring", () => {
  it("adopts id, describedby, invalid, required, and disabled from the Field", () => {
    render(
      <FieldProvider id="slot" hasHint hasError required disabled>
        <TimePicker aria-label="Appointment time" locale="en-US" />
        <p id="slot-hint">Pick a slot.</p>
        <p id="slot-error">Choose a time.</p>
      </FieldProvider>,
    );

    const input = getInput();
    expect(input).toHaveAttribute("id", "slot");
    expect(input).toHaveAttribute("aria-describedby", "slot-hint slot-error");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
  });

  it("works standalone outside a Field", () => {
    render(renderPicker());
    const input = getInput();
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(input).not.toHaveAttribute("aria-invalid");
  });
});

describe("TimePicker accessibility (axe)", () => {
  it("is axe-clean when closed", async () => {
    const { container } = render(renderPicker({ placeholder: "Select a time" }));
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("is axe-clean when open with options", async () => {
    const user = userEvent.setup();
    render(renderPicker({ startTime: "09:00", endTime: "11:00" }));
    await user.click(getInput());
    await user.keyboard("{ArrowDown}");
    await screen.findByRole("listbox");

    // Base UI portals the popup to document.body; the page-level "region"
    // rule can never pass on a landmark-less test page, so it is disabled
    // here (mirrors the ComboBox suite).
    expect(
      await axeCheck(document.body, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations();
  });

  it("is axe-clean inside a Field in an error state", async () => {
    const { container } = render(
      <FieldProvider id="slot" hasError>
        <TimePicker aria-label="Appointment time" locale="en-US" />
        <p id="slot-error">Choose a time.</p>
      </FieldProvider>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("is axe-clean when disabled", async () => {
    const { container } = render(renderPicker({ disabled: true }));
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});

describe("TimePicker RTL", () => {
  it("renders and opens in a dir=rtl document", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div dir="rtl" lang="ar">
        <TimePicker
          aria-label="وقت الموعد"
          locale="ar"
          startTime="09:00"
          endTime="10:00"
        />
      </div>,
    );

    const input = screen.getByRole("combobox", { name: "وقت الموعد" });
    expect(input).toBeInTheDocument();
    expect(await axeCheck(container)).toHaveNoViolations();

    await user.click(input);
    await user.keyboard("{ArrowDown}");
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });
});
