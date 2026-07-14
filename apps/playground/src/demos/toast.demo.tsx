// SPDX-License-Identifier: MIT

import { Button, ToastProvider, toast } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Toast'

export default function Demo(): React.JSX.Element {
  return (
    <ToastProvider>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Toasts appear in the block-end/inline-end corner. Hover a toast to pause its timer; press
          F6 to move focus into the notifications region.
        </p>
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
            Success toast
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.info({ title: 'Draft saved', description: 'Saved to your account.' })
            }
          >
            Info toast
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.warning({
                title: 'Session ending soon',
                description: 'You will be signed out in 5 minutes.',
              })
            }
          >
            Warning toast
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.error({
                title: 'Upload failed',
                description: 'The file could not be processed. Try again.',
              })
            }
          >
            Error toast (stays open)
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                title: 'Record deleted',
                variant: 'info',
                actionLabel: 'Undo',
                onAction: () => toast.success({ title: 'Restored' }),
              })
            }
          >
            Toast with action
          </Button>
        </div>
      </div>
    </ToastProvider>
  )
}
