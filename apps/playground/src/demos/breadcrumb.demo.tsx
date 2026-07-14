// SPDX-License-Identifier: MIT

import * as React from 'react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from '@21stgov/commons-react'

export const title = 'Breadcrumb'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="breadcrumb-basic-heading">
        <h3 id="breadcrumb-basic-heading" className="text-sm font-semibold">
          Service hierarchy
        </h3>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#home">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="#services">Services</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>Building permits</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </section>

      <section aria-labelledby="breadcrumb-rtl-heading">
        <h3 id="breadcrumb-rtl-heading" className="text-sm font-semibold">
          RTL (separators mirror)
        </h3>
        <div dir="rtl" lang="ar">
          <Breadcrumb label="مسار التنقل">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#home">الرئيسية</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="#services">الخدمات</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage>التصاريح</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>
    </div>
  )
}
