import React from 'react'

import { formatNumber, getTreasuryHistoricalTvl } from '../lib'
import { HistoricalTreasuryChart } from './HistoricalTreasuryChart'

export async function HistoricalTreasury({ treasuryLiquidBalance }: { treasuryLiquidBalance: number }) {
  const treasuryHistoricalTvl = await getTreasuryHistoricalTvl()

  return (
    <div className="h-full w-full rounded-lg bg-white dark:bg-[#1A2031] p-5">
      <h3 className="text-sm text-slate-500 dark:text-slate-400">Liquid treasury over time</h3>
      <p className="mt-3 text-xl font-semibold">${formatNumber(treasuryLiquidBalance)}</p>
      <div className="mt-10 w-full">
        <HistoricalTreasuryChart treasuryHistoricalTvl={treasuryHistoricalTvl} />
      </div>
    </div>
  )
}
