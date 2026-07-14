// SPDX-License-Identifier: MIT

'use client'

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
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function DialogDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Confirmation dialog">
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
      </DemoSection>
    </DemoStack>
  )
}
