// SPDX-License-Identifier: MIT

// Canary test proving the axe pipeline works end-to-end:
// React render (jsdom) -> axe-core scan -> local toHaveNoViolations matcher.

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { axeCheck } from "./setup.js";

describe("a11y harness canary", () => {
  it("renders an accessible button with no axe violations", async () => {
    const { container } = render(<button type="button">Save</button>);

    const results = await axeCheck(container);

    expect(results).toHaveNoViolations();
  });

  it("catches violations when they exist (matcher is not a no-op)", async () => {
    // An image without alt text is a guaranteed axe violation (image-alt).
    const { container } = render(
      // eslint-disable-next-line jsx-a11y/alt-text
      <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />,
    );

    const results = await axeCheck(container);

    expect(results.violations.length).toBeGreaterThan(0);
    expect(() => expect(results).toHaveNoViolations()).toThrowError(
      /image-alt/,
    );
  });
});
