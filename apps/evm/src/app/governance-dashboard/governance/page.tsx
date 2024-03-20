import React from 'react'

import {
  GovernanceItemsFilters,
  getLatestGovernanceItems,
} from '../../../lib/governance-dashboard'
import {
  GovernanceDateFilters,
  GovernanceSorting,
} from '../../../ui/governance-dashboard'
import { GovernanceBoard } from './GovernanceBoard'

export default async function Governance({
  searchParams,
}: { searchParams: GovernanceItemsFilters }) {
  const governanceItemsMapping =
    (await getLatestGovernanceItems(searchParams)) ?? []

  return (
    <section className="space-y-2 md:space-y-10">
      <header className="relative z-20 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <h2 className="ml-1 text-2xl font-bold text-slate-900 dark:text-slate-200">
          Governance Board
        </h2>
        <div className="flex gap-2">
          <GovernanceSorting />
          <GovernanceDateFilters />
        </div>
      </header>
      <GovernanceBoard governanceItemsMapping={governanceItemsMapping} />
    </section>
  )
}
