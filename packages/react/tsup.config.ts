// SPDX-License-Identifier: MIT

import { fileURLToPath } from "node:url";

import { defineConfig } from "tsup";

// Portable "@/" alias — resolved from a file URL so the build works on
// Windows, macOS, and Linux regardless of the working directory.
const srcDir = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
  // esbuild drops per-file "use client" directives when bundling, so the
  // single-file library build must re-declare the client boundary itself —
  // otherwise React Server Components consumers (Next.js App Router) crash at
  // import time with "createContext is not a function". The component sources
  // keep per-file directives for the CLI copy-into-your-repo path.
  banner: { js: '"use client";' },
  esbuildOptions(options) {
    options.alias = {
      ...options.alias,
      // Published-layout specifiers used by shipped cross-component
      // imports (longest match wins in esbuild). Mirrors tsconfig paths
      // and the vitest resolve aliases.
      "@/components/ui/button": fileURLToPath(
        new URL("./src/components/button/button.tsx", import.meta.url),
      ),
      "@/components/ui/calendar": fileURLToPath(
        new URL("./src/components/calendar/calendar.tsx", import.meta.url),
      ),
      "@/components/ui/checkbox": fileURLToPath(
        new URL("./src/components/checkbox/checkbox.tsx", import.meta.url),
      ),
      "@/components/ui/collapsible": fileURLToPath(
        new URL("./src/components/collapsible/collapsible.tsx", import.meta.url),
      ),
      "@/components/ui/combo-box": fileURLToPath(
        new URL("./src/components/combo-box/combo-box.tsx", import.meta.url),
      ),
      "@/components/ui/context": fileURLToPath(
        new URL("./src/components/field/context.ts", import.meta.url),
      ),
      "@/components/ui/dialog": fileURLToPath(
        new URL("./src/components/dialog/dialog.tsx", import.meta.url),
      ),
      "@/components/ui/drawer": fileURLToPath(
        new URL("./src/components/drawer/drawer.tsx", import.meta.url),
      ),
      "@/components/ui/dropdown-menu": fileURLToPath(
        new URL("./src/components/dropdown-menu/dropdown-menu.tsx", import.meta.url),
      ),
      "@/components/ui/field": fileURLToPath(
        new URL("./src/components/field/field.tsx", import.meta.url),
      ),
      "@/components/ui/icon": fileURLToPath(
        new URL("./src/components/icon/icon.tsx", import.meta.url),
      ),
      "@/components/ui/input": fileURLToPath(
        new URL("./src/components/input/input.tsx", import.meta.url),
      ),
      "@/components/ui/kbd": fileURLToPath(
        new URL("./src/components/kbd/kbd.tsx", import.meta.url),
      ),
      "@/components/ui/link": fileURLToPath(
        new URL("./src/components/link/link.tsx", import.meta.url),
      ),
      "@/components/ui/list": fileURLToPath(
        new URL("./src/components/list/list.tsx", import.meta.url),
      ),
      "@/components/ui/pagination": fileURLToPath(
        new URL("./src/components/pagination/pagination.tsx", import.meta.url),
      ),
      "@/components/ui/popover": fileURLToPath(
        new URL("./src/components/popover/popover.tsx", import.meta.url),
      ),
      "@/components/ui/radio-group": fileURLToPath(
        new URL("./src/components/radio-group/radio-group.tsx", import.meta.url),
      ),
      "@/components/ui/select": fileURLToPath(
        new URL("./src/components/select/select.tsx", import.meta.url),
      ),
      "@/components/ui/separator": fileURLToPath(
        new URL("./src/components/separator/separator.tsx", import.meta.url),
      ),
      "@/components/ui/table": fileURLToPath(
        new URL("./src/components/table/table.tsx", import.meta.url),
      ),
      "@/components/ui/toggle": fileURLToPath(
        new URL("./src/components/toggle/toggle.tsx", import.meta.url),
      ),
      "@": srcDir,
    };
  },
});
