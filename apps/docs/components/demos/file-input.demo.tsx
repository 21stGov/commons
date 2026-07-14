// SPDX-License-Identifier: MIT

'use client'

import { Field, FileInput } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function FileInputDemo(): React.JSX.Element {
  const [files, setFiles] = React.useState<File[]>([])

  return (
    <DemoStack>
      <DemoSection title="Single file">
        <div className="max-w-md">
          <FileInput aria-label="Upload one document" accept=".pdf,image/*" />
        </div>
      </DemoSection>

      <DemoSection title="Multiple files (controlled)">
        <div className="flex max-w-md flex-col gap-2">
          <FileInput
            multiple
            aria-label="Upload supporting documents"
            files={files}
            onFilesChange={setFiles}
          />
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {files.length} {files.length === 1 ? 'file' : 'files'} staged
          </p>
        </div>
      </DemoSection>

      <DemoSection title="Inside a Field">
        <div className="flex max-w-md flex-col gap-3">
          <Field label="Proof of residency" hint="A utility bill or lease." required>
            <FileInput accept=".pdf,image/*" />
          </Field>
          <Field label="Evidence" error="Attach at least one file." required>
            <FileInput multiple />
          </Field>
        </div>
      </DemoSection>

      <DemoSection title="Disabled">
        <div className="max-w-md">
          <Field label="Archived attachments" disabled>
            <FileInput multiple />
          </Field>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
