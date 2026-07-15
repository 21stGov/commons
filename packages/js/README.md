# @21stgov/commons-js

The progressive-enhancement runtime for [Commons](https://commonsui.com), the accessibility-first design system for U.S. local governments by 21st Gov. It brings the interactive behavior of the React components — dialogs, menus, tabs, accordions, carousels, combo boxes, data tables, and more — to the framework-agnostic `.cui-*` markup, so vanilla HTML behaves 1:1 with React. No framework required.

## Usage

**With a bundler** — import `enhance` and call it (optionally scoped to a root element):

```js
import { enhance } from "@21stgov/commons-js";
enhance();
```

**Drop-in `<script>`** — the IIFE build (`@21stgov/commons-js/global`) auto-enhances every `.cui-*` region on the page and exposes `window.Commons`:

```html
<script src="/commons.js" defer></script>
```

Pair it with [`@21stgov/commons-css`](https://www.npmjs.com/package/@21stgov/commons-css) for the styles. The behaviors follow the same normative accessibility contract published for each component, so keyboard and screen-reader support matches the React version. Both files are also served, versioned, from `cdn.commonsui.com`. MIT licensed.
