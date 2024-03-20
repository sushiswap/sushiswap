import React from 'react'

import {
  formatNumber,
  getForumStats,
  getNotionBudget,
  getNotionEvents,
  getSushiUserCount,
  getTreasurySnapshot,
} from '../../../lib/governance-dashboard'
import { StatsBackground } from './StatsBackground'

export async function Stats() {
  const [userCount, forumStats, treasurySnapshot, events, budgetData] =
    await Promise.all([
      getSushiUserCount(),
      getForumStats(),
      getTreasurySnapshot(),
      getNotionEvents(),
      getNotionBudget(),
    ])
  const currentQuarter = budgetData[budgetData.length - 1]
  const runwayQuarters =
    treasurySnapshot.balancesValueUsd / currentQuarter.expenses
  const runwayYears = Math.floor(runwayQuarters / 4)
  const runwayMonths = Math.floor(runwayQuarters * 3)

  const runway =
    runwayYears > 0 ? `${runwayYears} years` : `${runwayMonths} months`

  return (
    <div className="hidden h-fit w-[350px] rounded-lg bg-gradient-to-b from-white/[4%] to-transparent p-px md:block">
      <div className="relative overflow-hidden rounded-lg">
        <StatsBackground />
        <div className="relative h-full w-full space-y-10 rounded-lg bg-gradient-to-b from-[#101728]/40 to-transparent p-9">
          <section className="space-y-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-300">Treasury Balance</label>
              <p className="text-gray-50 text-3xl font-bold">
                ${formatNumber(treasurySnapshot.totalValueUsd)}
              </p>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-baseline gap-3">
                <label className="text-sm text-slate-400">Liquid</label>
                <span className="text-gray-50 font-bold">
                  ${formatNumber(treasurySnapshot.balancesValueUsd)}
                </span>
              </div>
              <div className="h-4 rounded-full border border-gray-50/20 bg-gray-50/20" />
              <div className="flex items-baseline justify-end gap-3">
                <label className="text-sm text-slate-400">Vesting</label>
                <span className="text-gray-50 font-bold">
                  ${formatNumber(treasurySnapshot.vestingValueUsd)}
                </span>
              </div>
            </div>
          </section>
          <section className="space-y-5">
            <div className="flex justify-between">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-400">Token Holders</label>
                <span className="text-gray-50 text-2xl font-bold">
                  {formatNumber(+userCount)}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <label className="text-sm text-slate-400">
                  Total Proposals
                </label>
                <span className="text-gray-50 text-2xl font-bold">
                  {formatNumber(forumStats?.proposalsCount)}
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-400">Runway</label>
                <span className="text-gray-50 text-2xl font-bold">
                  {runway}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <label className="text-sm text-slate-400">Events</label>
                <span className="text-gray-50 text-2xl font-bold">
                  {events.length}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
