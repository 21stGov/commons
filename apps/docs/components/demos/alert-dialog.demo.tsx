// SPDX-License-Identifier: MIT

'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function AlertDialogDemo(): React.JSX.Element {
  const [open, setOpen] = React.useState(false)

  return (
    <DemoStack>
      <DemoSection title="Destructive confirm (convenience)">
        <AlertDialog
          trigger="Delete permit application"
          triggerProps={{ variant: 'danger' }}
          title="Delete permit application?"
          description="This permanently removes the application and every attachment. Applicants can no longer see it, and it cannot be recovered."
          confirmLabel="Delete application"
          cancelLabel="Keep application"
          destructive
          onConfirm={() => {
            /* run the delete */
          }}
        />
      </DemoSection>

      <DemoSection title="Non-destructive confirm (convenience)">
        <AlertDialog
          trigger="Submit for review"
          title="Submit this application for review?"
          description="A reviewer will be assigned. You can still add comments while it is in review."
          confirmLabel="Submit"
          cancelLabel="Not yet"
          onConfirm={() => {
            /* submit */
          }}
        />
      </DemoSection>

      <DemoSection title="Controlled open (primitives)">
        <div className="flex flex-col gap-2">
          <AlertDialogRoot open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger>Revoke access</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Revoke this user&rsquo;s access?</AlertDialogTitle>
              <AlertDialogDescription>
                They will be signed out immediately and lose access to all department records.
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="danger">Revoke access</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogRoot>
          <p className="text-sm text-muted-foreground">
            The dialog is {open ? 'open' : 'closed'}. It ignores outside clicks and Escape — the
            decision must be made with a button.
          </p>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
