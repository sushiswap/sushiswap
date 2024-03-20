import React from 'react'

import {
  getNotionBudget,
  getTreasurySnapshot,
} from '../../../lib/governance-dashboard'
import { HistoricalTreasury } from './HistoricalTreasury'
import { QuarterlyBudget } from './QuarterlyBudget'
import { QuarterlyExpenses } from './QuarterlyExpenses'
import { TokenNetflow } from './TokenNetflow'
import { TreasuryBalancesTable } from './TreasuryBalancesTable'
import { TreasuryKpis } from './TreasuryKpis'

export default async function Finance() {
  const [treasurySnapshot, budgetData] = await Promise.all([
    getTreasurySnapshot(),
    getNotionBudget(),
  ])

  return (
    <div className="space-y-12 md:space-y-20">
      <section className="space-y-14">
        <div className="space-y-8">
          <h2 className="ml-1 text-2xl font-bold text-slate-900 dark:text-slate-200">
            Treasury Overview
          </h2>
          <div className="grid gap-4 md:grid-cols-[3fr,7fr]">
            <TreasuryKpis
              treasurySnapshot={treasurySnapshot}
              budgetData={budgetData}
            />
            <HistoricalTreasury
              treasuryLiquidBalance={treasurySnapshot.balancesValueUsd}
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <QuarterlyExpenses budgetData={budgetData} />
          <TokenNetflow />
        </div>
        <TreasuryBalancesTable balances={treasurySnapshot.balances} />
      </section>
      {budgetData.length ? <QuarterlyBudget budgetData={budgetData} /> : null}
    </div>
  )
}
