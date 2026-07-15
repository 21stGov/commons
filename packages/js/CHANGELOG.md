# @21stgov/commons-js

## 0.3.1

### Patch Changes

- Declare the `'use client'` boundary so components work in React Server
  Components consumers (Next.js App Router). Every component source that uses
  client-only React APIs (hooks, `createContext`) now carries the directive —
  54 files — so both the CLI copy-into-your-repo path and the registry ship
  RSC-safe source, and the bundled `@21stgov/commons-react` build re-declares
  the boundary with a `"use client"` banner (esbuild strips per-file directives
  when bundling). Previously, importing components like Button, Card, Header, or
  GovBanner into a Server Component crashed the consumer's build with
  "createContext is not a function". A new test gate fails the suite if a
  component ever uses a client-only API without declaring the directive.
