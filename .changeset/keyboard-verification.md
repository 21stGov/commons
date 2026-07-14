---
"@21stgov/commons": minor
"@21stgov/commons-tokens": minor
"@21stgov/commons-core": minor
"@21stgov/commons-react": minor
"@21stgov/commons-fonts": minor
---

Add automated keyboard-verification evidence to the accessibility contract. Each
registry item's `accessibility` block gains a `keyboardVerified` flag, backed by
a coverage gate that refuses to let a component claim it without a passing
keyboard test. 80 of 81 components are keyboard-verified at this release (only
scroll-area remains — its focusable-viewport behavior needs a real browser to
verify), and the docs surface the status per component.
