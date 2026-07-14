// SPDX-License-Identifier: MIT

'use client'

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

function StaffAvatar({ initials, name }: { initials: string; name: string }): React.JSX.Element {
  return (
    <Avatar>
      <AvatarImage src={`/staff/${name.toLowerCase().replaceAll(' ', '-')}.jpg`} alt="" />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}

export default function AvatarDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Image with a resilient fallback">
        <div className="flex items-center gap-2">
          <Avatar size="lg">
            <AvatarImage src="/staff/maya-chen.jpg" alt="" />
            <AvatarFallback>MC</AvatarFallback>
            <AvatarBadge label="Available" />
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">Maya Chen</p>
            <p className="text-sm text-muted-foreground">Permit specialist · Available</p>
          </div>
        </div>
      </DemoSection>

      <DemoSection title="Sizes">
        <div className="flex items-center gap-2">
          <Avatar size="sm"><AvatarFallback>SM</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>MD</AvatarFallback></Avatar>
          <Avatar size="lg"><AvatarFallback>LG</AvatarFallback></Avatar>
        </div>
      </DemoSection>

      <DemoSection title="Group and overflow count">
        <AvatarGroup ariaLabel="Service team">
          <StaffAvatar initials="MC" name="Maya Chen" />
          <StaffAvatar initials="AR" name="Andre Rivera" />
          <StaffAvatar initials="JL" name="Jordan Lee" />
          <AvatarGroupCount count={4} />
        </AvatarGroup>
      </DemoSection>

      <DemoSection title="RTL-safe overlap and placement">
        <div dir="rtl" lang="ar">
          <AvatarGroup ariaLabel="فريق الخدمة">
            <Avatar><AvatarFallback>سن</AvatarFallback></Avatar>
            <Avatar><AvatarFallback>مخ</AvatarFallback></Avatar>
            <AvatarGroupCount count={3} label="ثلاثة أشخاص آخرين" />
          </AvatarGroup>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
