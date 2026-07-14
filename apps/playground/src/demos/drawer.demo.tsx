// SPDX-License-Identifier: MIT

import * as React from 'react'

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

export const title = 'Drawer'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="drawer-filters-heading">
        <h3 id="drawer-filters-heading" className="text-sm font-semibold">
          Filters drawer (inline-end edge — the default)
        </h3>
        <Drawer>
          <DrawerTrigger variant="outline">Filters</DrawerTrigger>
          <DrawerContent side="end">
            <DrawerHeader>
              <DrawerTitle>Filter results</DrawerTitle>
              <DrawerDescription>Narrow the list of public records, then apply.</DrawerDescription>
            </DrawerHeader>
            <form className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="status" value="open" /> Open cases
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="status" value="closed" /> Closed cases
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="year" value="2026" /> Filed this year
              </label>
            </form>
            <DrawerFooter>
              <DrawerClose>Cancel</DrawerClose>
              <Button>Apply filters</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </section>

      <section aria-labelledby="drawer-nav-heading">
        <h3 id="drawer-nav-heading" className="text-sm font-semibold">
          Mobile navigation drawer (inline-start edge)
        </h3>
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
                <li>
                  <a className="text-link underline hover:text-link-hover" href="#trash">
                    Trash and recycling
                  </a>
                </li>
              </ul>
            </nav>
          </DrawerContent>
        </Drawer>
      </section>

      <section aria-labelledby="drawer-rtl-heading">
        <h3 id="drawer-rtl-heading" className="text-sm font-semibold">
          RTL (Arabic — a “start” drawer opens from the visual right edge)
        </h3>
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
      </section>
    </div>
  )
}
