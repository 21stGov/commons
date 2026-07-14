# @21stgov/commons-core

Framework-agnostic CSS foundation for [Commons](https://commonsui.com), the accessibility-first design system for U.S. local governments by 21st Gov. No JavaScript, no framework — a legacy server-rendered city site can adopt it as-is.

## Usage

Import tokens first, then the core (order matters — core consumes `--cui-*` custom properties):

```css
@import "@21stgov/commons-tokens/index.css";
@import "@21stgov/commons-core/index.css";
```

Individual layers are available at `@21stgov/commons-core/css/reset.css`, `css/base.css`, and `css/a11y.css`. Ships a modern reset, accessible base styles (underlined links, user-controlled root font-size), skip link, `.cui-sr-only`, global `:focus-visible` rings, forced-colors hardening, and 44px `.cui-target` sizing. MIT licensed.
