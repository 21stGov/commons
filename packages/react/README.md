# @21stgov/commons-react

Accessible React components for [Commons](https://commonsui.com), the
accessibility-first design system for U.S. local governments by 21st Gov.

80+ components built on [Base UI](https://base-ui.com) primitives, each with a
normative accessibility contract (WCAG 2.2 AA baseline, selected AAA defaults),
an axe test suite, RTL support, forced-colors safety, and 44px touch targets.

## Install

```sh
npm install @21stgov/commons-react
```

Requires **React 19+**. Import the token, core, and font CSS once in your app
(see the [installation guide](https://commonsui.com/docs/installation)):

```css
@import "@21stgov/commons-tokens/index.css";
@import "@21stgov/commons-core/index.css";
@import "@21stgov/commons-fonts/index.css";
```

## Usage

```tsx
import { Button, Field, Input } from "@21stgov/commons-react";

export function Example() {
  return (
    <Field label="Full name" hint="As it appears on your ID">
      <Input name="name" />
    </Field>
  );
}
```

## Own your code

You can also copy component **source** into your repository with the Commons CLI
instead of depending on this package as a black box — the recommended path for
long-lived government systems:

```sh
npx @21stgov/commons add button
```

Browse the full catalog at [commonsui.com/docs/components](https://commonsui.com/docs/components).

MIT licensed. Source: [21stgov/commons](https://github.com/21stgov/commons).
