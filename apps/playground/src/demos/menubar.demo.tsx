// SPDX-License-Identifier: MIT

import * as React from 'react'

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@21stgov/commons-react'

export const title = 'Menubar'

export default function Demo(): React.JSX.Element {
  const [showGrid, setShowGrid] = React.useState(true)
  const [density, setDensity] = React.useState('comfortable')

  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="menubar-app-heading">
        <h3 id="menubar-app-heading" className="mb-2 text-sm font-semibold">
          Application menu bar
        </h3>
        <Menubar aria-label="Document">
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem shortcut={<MenubarShortcut keys={['mod', 'N']} />}>
                New document
              </MenubarItem>
              <MenubarItem shortcut={<MenubarShortcut keys={['mod', 'S']} />}>Save</MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Export as</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>PDF</MenubarItem>
                  <MenubarItem>CSV</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarItem variant="destructive">Delete document</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem shortcut={<MenubarShortcut keys={['mod', 'Z']} />}>Undo</MenubarItem>
              <MenubarItem disabled>Redo</MenubarItem>
              <MenubarSeparator />
              <MenubarItem shortcut={<MenubarShortcut keys={['mod', 'C']} />}>Copy</MenubarItem>
              <MenubarItem shortcut={<MenubarShortcut keys={['mod', 'V']} />}>Paste</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarLabel>Layout</MenubarLabel>
              <MenubarCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
                Show grid
              </MenubarCheckboxItem>
              <MenubarSeparator />
              <MenubarLabel>Density</MenubarLabel>
              <MenubarRadioGroup value={density} onValueChange={setDensity}>
                <MenubarRadioItem value="comfortable">Comfortable</MenubarRadioItem>
                <MenubarRadioItem value="compact">Compact</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </section>

      <section aria-labelledby="menubar-rtl-heading">
        <h3 id="menubar-rtl-heading" className="mb-2 text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl">
          <Menubar aria-label="مستند">
            <MenubarMenu>
              <MenubarTrigger>ملف</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>جديد</MenubarItem>
                <MenubarItem>حفظ</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>تحرير</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>تراجع</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </section>
    </div>
  )
}
