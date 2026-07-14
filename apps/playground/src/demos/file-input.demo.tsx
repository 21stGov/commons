// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Field, FileInput } from '@21stgov/commons-react'

export const title = 'File input'

export default function Demo(): React.JSX.Element {
  const [permit, setPermit] = React.useState<File[]>([])

  return (
    <div className="flex max-w-md flex-col gap-5">
      <section aria-labelledby="file-single-heading">
        <h3 id="file-single-heading" className="text-sm font-semibold">
          Single file
        </h3>
        <FileInput aria-label="Upload one document" accept=".pdf,image/*" />
        <p className="text-sm text-muted-foreground">
          accept is only a hint to the dialog — always validate on the server.
        </p>
      </section>

      <section aria-labelledby="file-multiple-heading">
        <h3 id="file-multiple-heading" className="text-sm font-semibold">
          Multiple files (controlled)
        </h3>
        <FileInput
          multiple
          aria-label="Upload supporting documents"
          files={permit}
          onFilesChange={setPermit}
        />
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {permit.length} {permit.length === 1 ? 'file' : 'files'} staged
        </p>
      </section>

      <section aria-labelledby="file-field-heading">
        <h3 id="file-field-heading" className="text-sm font-semibold">
          Inside a Field
        </h3>
        <div className="flex flex-col gap-3">
          <Field
            label="Proof of residency"
            hint="A utility bill or lease, PDF or image."
            required
          >
            <FileInput accept=".pdf,image/*" />
          </Field>
          <Field label="Evidence" error="Attach at least one file." required>
            <FileInput multiple />
          </Field>
        </div>
      </section>

      <section aria-labelledby="file-disabled-heading">
        <h3 id="file-disabled-heading" className="text-sm font-semibold">
          Disabled
        </h3>
        <Field label="Archived attachments" disabled>
          <FileInput multiple />
        </Field>
      </section>

      <section aria-labelledby="file-rtl-heading">
        <h3 id="file-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl">
          <Field label="المستندات الداعمة" requiredLabel="مطلوب" required>
            <FileInput
              multiple
              dragText="اسحب الملفات هنا أو"
              browseText="اختر من المجلد"
              removeLabel="إزالة"
            />
          </Field>
        </div>
      </section>
    </div>
  )
}
