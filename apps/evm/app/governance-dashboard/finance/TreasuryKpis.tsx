'use client'

import { CircleIcon, classNames } from '@sushiswap/ui'
import React from 'react'

import { KpiCard } from '../components'
import { formatNumber, getPercentageDiff, SushiBudget, TreasurySnapshot } from '../lib'

export function TreasuryKpis({
  treasurySnapshot,
  budgetData,
}: {
  treasurySnapshot: TreasurySnapshot
  budgetData: SushiBudget[]
}) {
  const currentQuarter = budgetData[budgetData.length - 1]
  const previousQuarter = budgetData[budgetData.length - 2]
  const budgetDiff = getPercentageDiff(currentQuarter.budget, previousQuarter.budget)
  const runwayQuarters = treasurySnapshot.balancesValueUsd / currentQuarter.expenses
  const runwayMonths = Math.floor(runwayQuarters * 3)

  const treasuryKpis = [
    {
      title: 'Treasury Runway',
      value: `${runwayMonths} months`,
      additional:
        runwayMonths > 11 ? (
          <div className="flex items-center gap-1 text-sm text-green-400">
            <CircleIcon width={8} className="fill-green-400 text-green-400" />
            Positive
          </div>
        ) : runwayMonths > 5 ? (
          <div className="flex items-center gap-1 text-sm text-yellow-400">
            <CircleIcon width={8} className="fill-yellow-400 text-yellow-400" />
            Moderate
          </div>
        ) : (
          <div className="flex items-center gap-1 text-sm text-red-400">
            <CircleIcon width={8} className="fill-red-400 text-red-400" />
            Negative
          </div>
        ),
    },
    {
      title: 'Treasury Balance',
      value: '$' + formatNumber(treasurySnapshot.totalValueUsd),
      additional: (
        <div className="flex items-center gap-[14px] text-sm mt-1">
          <div className="flex items-baseline gap-3">
            <label className="text-slate-400">Liquid</label>
            <span className="font-bold">${formatNumber(treasurySnapshot.balancesValueUsd)}</span>
          </div>
          <div className="h-4 rounded-full border border-gray-50/20 bg-gray-50/20" />
          <div className="flex items-baseline justify-end gap-3">
            <label className="text-slate-400">Vesting</label>
            <span className="font-bold">${formatNumber(treasurySnapshot.vestingValueUsd)}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Quarterly Budget / Burn Rate',
      value: formatNumber(currentQuarter.budget),
      additional: (
        <dd className={classNames('text-sm', budgetDiff < 0 ? 'text-red-400' : 'text-green-400')}>
          {budgetDiff.toLocaleString('EN', { style: 'percent', maximumFractionDigits: 2 })} from last quarter
        </dd>
      ),
    },
  ]

  return <div className="grid gap-4">{treasuryKpis.map(KpiCard)}</div>
}
