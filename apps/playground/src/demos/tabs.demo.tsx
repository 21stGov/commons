// SPDX-License-Identifier: MIT

import { Tabs, TabsList, TabsPanel, TabsTab } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Tabs'

export default function Demo(): React.JSX.Element {
  return (
    <Tabs defaultValue="overview">
      <TabsList aria-label="Permit details">
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="documents">Documents</TabsTab>
        <TabsTab value="history">History</TabsTab>
        <TabsTab value="inspection" disabled>
          Inspection
        </TabsTab>
      </TabsList>
      <TabsPanel value="overview">Application PR-2026-1042 is under review.</TabsPanel>
      <TabsPanel value="documents">Three supporting documents were submitted.</TabsPanel>
      <TabsPanel value="history">Submitted July 10; assigned July 11.</TabsPanel>
      <TabsPanel value="inspection">No inspection is scheduled.</TabsPanel>
    </Tabs>
  )
}
