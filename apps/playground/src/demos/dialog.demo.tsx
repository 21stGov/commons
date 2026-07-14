// SPDX-License-Identifier: MIT

import * as React from 'react'

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@21stgov/commons-react'

export const title = 'Dialog'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="dialog-confirm-heading">
        <h3 id="dialog-confirm-heading" className="text-sm font-semibold">
          Confirmation dialog
        </h3>
        <Dialog>
          <DialogTrigger>Delete record</DialogTrigger>
          <DialogContent>
            <DialogTitle>Delete this record?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The public record will no longer appear in search.
            </DialogDescription>
            <DialogFooter>
              <DialogClose>Cancel</DialogClose>
              <Button variant="danger">Delete record</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      <section aria-labelledby="dialog-long-heading">
        <h3 id="dialog-long-heading" className="text-sm font-semibold">
          Long, scrolling content
        </h3>
        <Dialog>
          <DialogTrigger>Read the policy</DialogTrigger>
          <DialogContent>
            <DialogTitle>Public records policy</DialogTitle>
            <DialogDescription>Review before submitting a request.</DialogDescription>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 12 }, (_, i) => (
                <p key={i}>
                  Section {i + 1}. Requests are processed in the order received and may take up to
                  ten business days. Fees apply for copies exceeding twenty pages.
                </p>
              ))}
            </div>
            <DialogFooter>
              <DialogClose>Close</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  )
}
