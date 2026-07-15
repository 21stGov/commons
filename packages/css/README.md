# @21stgov/commons-css

`commons.css` — the framework-agnostic component classes for [Commons](https://commonsui.com), the accessibility-first design system for U.S. local governments by 21st Gov. The `.cui-*` classes are generated 1:1 from the React components' own style configs, so plain HTML looks identical to the React version — no React, no build step.

## Usage

Load the token + core foundation first, then `commons.css` (order matters — the classes consume the `--cui-*` custom properties):

```css
@import "@21stgov/commons-tokens/index.css";
@import "@21stgov/commons-core/index.css";
@import "@21stgov/commons-css"; /* the .cui-* component classes */
```

Then write Commons components as plain HTML:

```html
<button type="button" class="cui-button cui-button--primary">Submit application</button>
```

Interactive components (dialog, menu, tabs, accordion…) need their behavior wired up — add [`@21stgov/commons-js`](https://www.npmjs.com/package/@21stgov/commons-js). Exports: `.` / `./commons.css` for the stylesheet, and `./components.css` for just the `.cui-*` rules. Also served, versioned, from `cdn.commonsui.com`. See [Using Commons without React](https://commonsui.com/docs/without-react). MIT licensed.
