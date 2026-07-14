// SPDX-License-Identifier: MIT

'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function BreadcrumbDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Service hierarchy">
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
      </DemoSection>

      <DemoSection title="RTL">
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
      </DemoSection>
    </DemoStack>
  )
}
