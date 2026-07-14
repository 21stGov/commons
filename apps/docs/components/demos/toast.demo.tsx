// SPDX-License-Identifier: MIT

'use client'

import { Button, ToastProvider, toast } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function ToastDemo(): React.JSX.Element {
  return (
    <ToastProvider>
      <DemoStack>
        <DemoSection title="Status variants">
          <div className="flex flex-wrap gap-1">
            <Button
              variant="secondary"
              onClick={() =>
                toast.success({
                  title: 'Application submitted',
                  description: 'A confirmation email is on its way.',
                })
              }
            >
              Success
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toast.warning({ title: 'Session ending soon', description: 'Save your work.' })
              }
            >
              Warning
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toast.error({
                  title: 'Upload failed',
                  description: 'The file could not be processed.',
                })
              }
            >
              Error (stays open)
            </Button>
          </div>
        </DemoSection>

        <DemoSection title="With an action">
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                title: 'Record deleted',
                actionLabel: 'Undo',
                onAction: () => toast.success({ title: 'Restored' }),
              })
            }
          >
            Delete record
          </Button>
        </DemoSection>
      </DemoStack>
    </ToastProvider>
  )
}
