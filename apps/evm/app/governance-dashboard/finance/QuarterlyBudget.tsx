'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { classNames } from '@sushiswap/ui'
import React, { useMemo, useState } from 'react'
import { Cell, Pie, PieChart, Tooltip } from 'recharts'

import { ChartTooltip, KpiCard } from '../components'
import { SushiBudget, formatNumber, getPercentageDiff } from '../lib'

const CHART_COLORS = {
  Engineering: '#5A89DD',
  BizDev: '#BF60EE',
  Marketing: '#EEC660',
  Design: '#EE7A60',
  Others: '#8560EE',
  'Available Budget': 'transparent',
}

function isValidTeamName(teamName: string): teamName is keyof typeof CHART_COLORS {
  return teamName in CHART_COLORS
}

export function QuarterlyBudget({ budgetData }: { budgetData: SushiBudget[] }) {
  const [selectedQuarterIndex, setSelectedQuarterIndex] = useState(budgetData.length - 1)
  const selectedQuarter = budgetData[selectedQuarterIndex]

  const previousQuarter = budgetData[selectedQuarterIndex - 1] ?? selectedQuarter
  const budgetDiff = getPercentageDiff(selectedQuarter.budget, previousQuarter.budget)
  const expensesDiff = getPercentageDiff(selectedQuarter.expenses, previousQuarter.expenses)

  const quarterlyKpis = useMemo(
    () => [
      {
        title: 'Budget Left',
        value: <span className="text-green-400">{formatNumber(selectedQuarter.left)}</span>,
        additional: (
          <dd className="text-sm text-slate-400">
            {(1 - selectedQuarter.left / selectedQuarter.budget).toLocaleString('EN', {
              style: 'percent',
              maximumFractionDigits: 2,
            })}{' '}
            Used
          </dd>
        ),
      },
      {
        title: 'Quarterly Budget',
        value: '$' + formatNumber(selectedQuarter.budget),
        additional: (
          <dd className="text-sm text-slate-400">
            {budgetDiff.toLocaleString('EN', { style: 'percent', maximumFractionDigits: 2 })} from last quarter
          </dd>
        ),
      },
      {
        title: 'Actual',
        value: '$' + formatNumber(selectedQuarter.expenses),
        additional: (
          <dd className="text-sm text-slate-400">
            {expensesDiff.toLocaleString('EN', { style: 'percent', maximumFractionDigits: 2 })} from last quarter
          </dd>
        ),
      },
    ],
    [selectedQuarter.left, selectedQuarter.budget, selectedQuarter.expenses, budgetDiff, expensesDiff]
  )

  return (
    <section className="mt-[120px] space-y-4 md:space-y-8">
      <header className="flex flex-col items-center justify-between gap-3 md:flex-row">
        <h2 className="ml-1 text-2xl font-bold text-slate-900 dark:text-slate-200">Quarterly Budget vs. Actuals</h2>
        <div className="flex h-[42px] items-center gap-2 rounded-lg bg-slate-200 dark:bg-slate-700 px-2 font-medium text-sm">
          <button
            className="rounded p-1 transition-colors ease-in-out enabled:hover:bg-black/[0.12] disabled:text-slate-500 enabled:hover:dark:bg-white/[0.12]"
            onClick={() => setSelectedQuarterIndex(selectedQuarterIndex - 1)}
            disabled={!selectedQuarterIndex}
          >
            <ChevronLeftIcon className="h-3 w-3" strokeWidth={3} />
          </button>
          {selectedQuarter.quarter}
          <button
            className="rounded p-1 transition-colors ease-in-out enabled:hover:bg-black/[0.12] disabled:text-slate-500 enabled:hover:dark:bg-white/[0.12]"
            onClick={() => setSelectedQuarterIndex(selectedQuarterIndex + 1)}
            disabled={selectedQuarterIndex === budgetData.length - 1}
          >
            <ChevronRightIcon className="h-3 w-3" strokeWidth={3} />
          </button>
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-[3fr,7fr]">
        <div className="grid gap-4">{quarterlyKpis.map(KpiCard)}</div>
        <div className="h-full w-full rounded-lg bg-white dark:bg-[#1A2031] p-5">
          <h3 className="text-xl font-semibold">Actuals Breakdown</h3>
          <div className="mt-10 flex w-full flex-col justify-center gap-4 md:flex-row md:justify-between md:pr-16">
            <div className="flex items-center justify-center">
              <PieChart width={240} height={240} className="z-10">
                <Pie
                  stroke="none"
                  data={selectedQuarter.expensesBreakdown}
                  innerRadius={96}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="expense"
                >
                  {selectedQuarter.expensesBreakdown.map(({ teamName }) => (
                    <Cell
                      key={`cell-${teamName}`}
                      fill={isValidTeamName(teamName) ? CHART_COLORS[teamName] : '#5689E6'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <ChartTooltip>
                        <dl>
                          <dd className="font-semibold">${formatNumber(payload[0].payload.expense)}</dd>
                          <dt className="text-xs">{payload[0].payload.teamName}</dt>
                        </dl>
                      </ChartTooltip>
                    ) : null
                  }
                />
              </PieChart>
              <dl className="absolute flex flex-col items-center justify-center gap-1">
                <dd className="text-[28px] font-bold">
                  {selectedQuarter.expenses.toLocaleString('EN', {
                    maximumFractionDigits: 0,
                    style: 'currency',
                    currency: 'USD',
                  })}
                </dd>
                <dt className="text-sm text-slate-400">Total Expense</dt>
              </dl>
            </div>

            <div className="h-full space-y-5 text-sm">
              {selectedQuarter.expensesBreakdown.map(({ teamName, expense }) => (
                <dl key={teamName} className="flex items-center justify-between md:gap-[110px]">
                  <dt className="flex items-center gap-2">
                    <div
                      className={classNames(
                        'h-[14px] w-[14px] rounded-sm',
                        teamName === 'Available Budget' && 'border border-slate-400'
                      )}
                      style={{ backgroundColor: isValidTeamName(teamName) ? CHART_COLORS[teamName] : '#5689E6' }}
                    />
                    {teamName}
                  </dt>
                  <dd className="font-semibold">
                    {expense.toLocaleString('EN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </dd>
                </dl>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
