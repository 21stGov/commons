// SPDX-License-Identifier: MIT

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

export const title = 'Alert Dialog'

function ControlledExample(): React.JSX.Element {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex flex-col gap-2">
      <AlertDialogRoot open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger>Revoke access</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Revoke this user&rsquo;s access?</AlertDialogTitle>
          <AlertDialogDescription>
            They are signed out immediately and lose access to all department records.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="danger">Revoke access</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogRoot>
      <p className="text-sm text-muted-foreground">The dialog is {open ? 'open' : 'closed'}.</p>
    </div>
  )
}

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="alert-dialog-destructive-heading">
        <h3 id="alert-dialog-destructive-heading" className="text-sm font-semibold">
          Destructive confirm
        </h3>
        <AlertDialog
          trigger="Delete permit application"
          triggerProps={{ variant: 'danger' }}
          title="Delete permit application?"
          description="This permanently removes the application and every attachment. It cannot be recovered."
          confirmLabel="Delete application"
          cancelLabel="Keep application"
          destructive
        />
      </section>

      <section aria-labelledby="alert-dialog-confirm-heading">
        <h3 id="alert-dialog-confirm-heading" className="text-sm font-semibold">
          Non-destructive confirm
        </h3>
        <AlertDialog
          trigger="Submit for review"
          title="Submit this application for review?"
          description="A reviewer will be assigned. You can still add comments while it is in review."
          confirmLabel="Submit"
          cancelLabel="Not yet"
        />
      </section>

      <section aria-labelledby="alert-dialog-controlled-heading">
        <h3 id="alert-dialog-controlled-heading" className="text-sm font-semibold">
          Controlled open
        </h3>
        <ControlledExample />
      </section>

      <section aria-labelledby="alert-dialog-rtl-heading">
        <h3 id="alert-dialog-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl">
          <AlertDialog
            trigger="حذف طلب التصريح"
            triggerProps={{ variant: 'danger' }}
            title="هل تريد حذف طلب التصريح؟"
            description="لا يمكن التراجع عن هذا الإجراء."
            confirmLabel="حذف"
            cancelLabel="إلغاء"
            destructive
          />
        </div>
      </section>
    </div>
  )
}
