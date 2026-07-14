// SPDX-License-Identifier: MIT

'use client'

import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function DrawerDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Filters drawer (inline-end edge — the default)">
        <Drawer>
          <DrawerTrigger variant="outline">Filters</DrawerTrigger>
          <DrawerContent side="end">
            <DrawerHeader>
              <DrawerTitle>Filter results</DrawerTitle>
              <DrawerDescription>Narrow the list of public records, then apply.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose>Cancel</DrawerClose>
              <Button>Apply filters</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </DemoSection>

      <DemoSection title="Mobile navigation drawer (inline-start edge)">
        <Drawer>
          <DrawerTrigger variant="ghost">Menu</DrawerTrigger>
          <DrawerContent side="start">
            <DrawerHeader>
              <DrawerTitle>City services</DrawerTitle>
            </DrawerHeader>
            <nav aria-label="City services">
              <ul className="flex flex-col gap-1 text-sm">
                <li>
                  <a className="text-link underline hover:text-link-hover" href="#pay">
                    Pay a bill
                  </a>
                </li>
                <li>
                  <a className="text-link underline hover:text-link-hover" href="#permits">
                    Permits and licenses
                  </a>
                </li>
              </ul>
            </nav>
          </DrawerContent>
        </Drawer>
      </DemoSection>

      <DemoSection title="RTL (Arabic — a “start” drawer opens from the visual right edge)">
        <div dir="rtl">
          <Drawer>
            <DrawerTrigger variant="outline">عوامل التصفية</DrawerTrigger>
            <DrawerContent side="start" dismissLabel="إغلاق">
              <DrawerHeader>
                <DrawerTitle>تصفية النتائج</DrawerTitle>
                <DrawerDescription>تضييق قائمة السجلات العامة.</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <DrawerClose>إلغاء</DrawerClose>
                <Button>تطبيق</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
