// SPDX-License-Identifier: MIT

/**
 * Keyboard-verification coverage gate.
 *
 * A component may only claim `accessibility.keyboardVerified: true` in its
 * registry fragment if a test actually exercises its keyboard behavior — this
 * gate fails the build otherwise, so the published accessibility contract can
 * never claim keyboard verification it does not have. It also prints the live
 * coverage picture (verified / tested-but-unflagged / untested) so the sweep to
 * 100% is a visible number, not a vibe.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

// import.meta.dirname resolves to packages/react/test regardless of cwd, and
// avoids fileURLToPath (import.meta.url is not a file: URL under vitest).
const componentsDir = join(import.meta.dirname, "..", "src", "components");

/**
 * Any of these in a component's test files counts as exercising the keyboard:
 * user-event keyboard/tab, fireEvent key events, key literals, or an import of
 * the shared keyboard harness (which covers `expectNonInteractive` too).
 */
const KEYBOARD_SIGNAL =
  /user\.(keyboard|tab)\(|\.tab\(|key(Down|Up|Press)|\{(Escape|Enter|Arrow\w+|Home|End|Space|Tab)\}|key:\s*['"]|\/test\/keyboard/;

interface Coverage {
  name: string;
  verified: boolean;
  hasKeyboardTest: boolean;
  claims: number;
}

function testFileContent(dir: string): string {
  return readdirSync(dir)
    .filter((file) => file.endsWith(".test.tsx") || file.endsWith(".test.ts"))
    .map((file) => readFileSync(join(dir, file), "utf8"))
    .join("\n");
}

const rows: Coverage[] = readdirSync(componentsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const dir = join(componentsDir, entry.name);
    let fragment: { accessibility?: { keyboard?: string[]; keyboardVerified?: boolean } } = {};
    try {
      fragment = JSON.parse(readFileSync(join(dir, "registry.frag.json"), "utf8"));
    } catch {
      // A directory without a fragment (e.g. shared internals) has nothing to verify.
    }
    const a11y = fragment.accessibility ?? {};
    return {
      name: entry.name,
      verified: a11y.keyboardVerified === true,
      hasKeyboardTest: KEYBOARD_SIGNAL.test(testFileContent(dir)),
      claims: (a11y.keyboard ?? []).length,
    };
  })
  .filter((row) => row.claims > 0 || row.verified);

describe("keyboard verification coverage", () => {
  it("every component claiming keyboardVerified:true has a backing keyboard test", () => {
    const unbacked = rows.filter((row) => row.verified && !row.hasKeyboardTest).map((row) => row.name);
    expect(
      unbacked,
      "these fragments claim accessibility.keyboardVerified:true but no keyboard test was found — " +
        "add one (packages/react/test/keyboard.ts) or drop the claim",
    ).toEqual([]);
  });

  it("reports the live coverage picture", () => {
    const verified = rows.filter((row) => row.verified);
    const testedNotFlagged = rows.filter((row) => !row.verified && row.hasKeyboardTest);
    const untested = rows.filter((row) => !row.verified && !row.hasKeyboardTest);

    // eslint-disable-next-line no-console -- this report is the point of the test.
    console.log(
      `\nKeyboard verification: ${verified.length}/${rows.length} formally verified ` +
        `(keyboardVerified:true).\n` +
        `  ${testedNotFlagged.length} have keyboard tests but are not yet flagged: ` +
        `${testedNotFlagged.map((r) => r.name).join(", ") || "none"}\n` +
        `  ${untested.length} have keyboard claims but no keyboard test yet: ` +
        `${untested.map((r) => r.name).join(", ") || "none"}\n`,
    );

    expect(rows.length).toBeGreaterThan(0);
  });
});
