# @21stgov/commons-fonts

Self-hosted [Atkinson Hyperlegible Next and Atkinson Hyperlegible Mono](https://www.brailleinstitute.org/freefont/) —
the default typefaces of [Commons](https://commonsui.com). Designed by the
Braille Institute of America for maximum legibility for readers with low
vision, and shipped here as two variable WOFF2 files (weight 200–800 with
true italics, ~114 KB total). No third-party font CDN required.

```css
@import "@21stgov/commons-fonts/index.css";
```

The fallback stacks live in `@21stgov/commons-tokens`; if this package is
not installed, Commons renders with system fonts.

## License

The Atkinson Hyperlegible font files contained in `packages/fonts` are
licensed separately under the SIL Open Font License, Version 1.1,
regardless of the license used by the design system.

Copyright 2020, Braille Institute of America, Inc.
Reserved Font Names: "ATKINSON" and "HYPERLEGIBLE".
The complete license is available in [LICENSE.txt](LICENSE.txt).
The CSS in this package is MIT licensed.
