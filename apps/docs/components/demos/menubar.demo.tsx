// SPDX-License-Identifier: MIT

'use client'

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
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function MenubarDemo(): React.JSX.Element {
  const [showGrid, setShowGrid] = React.useState(true)
  const [density, setDensity] = React.useState('comfortable')

  return (
    <DemoStack>
      <DemoSection title="Application menu bar">
        <Menubar aria-label="Document">
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem shortcut={<MenubarShortcut keys={['mod', 'N']} />}>
                New document
              </MenubarItem>
              <MenubarItem shortcut={<MenubarShortcut keys={['mod', 'O']} />}>Open…</MenubarItem>
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
              <MenubarItem
                disabled
                shortcut={<MenubarShortcut keys={['mod', 'shift', 'Z']} />}
              >
                Redo
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem shortcut={<MenubarShortcut keys={['mod', 'X']} />}>Cut</MenubarItem>
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
      </DemoSection>
    </DemoStack>
  )
}
