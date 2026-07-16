// SPDX-License-Identifier: MIT

import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Published-layout specifiers used by shipped cross-component imports
      // (files ship verbatim, so imports must match the consumer layout).
      // Exact entries stay above the "@" prefix alias. Mirrors tsconfig
      // paths and the tsup build.
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
      "@/components/ui/header": fileURLToPath(
        new URL("./src/components/header/header.tsx", import.meta.url),
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
      "@/components/ui/navigation-menu": fileURLToPath(
        new URL("./src/components/navigation-menu/navigation-menu.tsx", import.meta.url),
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
      // Portable "@/" alias, mirroring tsconfig paths and the tsup build.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "test/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}"],
    },
  },
});
