'use client'

import React from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  SushiBudget,
  formatNumber,
  useIsDarkMode,
} from '../../../lib/governance-dashboard'
import { ChartTooltip } from '../../../ui/governance-dashboard'

export function QuarterlyExpenses({
  budgetData,
}: { budgetData: SushiBudget[] }) {
  const isDarkMode = useIsDarkMode()

  return (
    <div className="h-full w-full rounded-lg bg-white dark:bg-[#1A2031] p-5">
      <div className="flex items-center gap-[14px]">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-sm bg-[#BF60EE]" />
          <label className="text-sm text-slate-500 dark:text-slate-400">
            Expense
          </label>
        </div>
        <div className="h-4 rounded-full border border-gray-50/20 bg-gray-50/20" />
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-sm bg-blue" />
          <label className="text-sm text-slate-500 dark:text-slate-400">
            Revenue
          </label>
        </div>
      </div>
      <h3 className="mt-3 text-xl font-semibold">
        Quarterly Expenses vs. Revenue
      </h3>
      <div className="mt-10 w-full text-xs">
        <ResponsiveContainer minWidth="100%" minHeight={240}>
          <BarChart data={budgetData}>
            <defs>
              <linearGradient id="expenses" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#C662F5" />
                <stop
                  offset="100.2%"
                  stopColor={isDarkMode ? '#1A2031' : 'white'}
                />
              </linearGradient>
              <linearGradient id="revenue" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#568AE8" />
                <stop
                  offset="100.2%"
                  stopColor={isDarkMode ? '#1A2031' : 'white'}
                />
              </linearGradient>
            </defs>
            <Tooltip
              cursor={{ fill: 'transparent' }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <ChartTooltip>
                    <dl className="text-base font-semibold">
                      <div className="flex items-center gap-8 justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-sm bg-blue" />
                          <dt>Revenue</dt>
                        </div>
                        <dd>
                          $
                          {formatNumber(
                            Math.abs(payload[0].payload.revenue),
                            0,
                          )}
                        </dd>
                      </div>
                      <div className="flex items-center gap-8 justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-sm bg-[#BF60EE]" />
                          <dt>Expenses</dt>
                        </div>
                        <dd>
                          $
                          {formatNumber(
                            Math.abs(payload[0].payload.expenses),
                            0,
                          )}
                        </dd>
                      </div>
                    </dl>
                    <p className="mt-1">{label}</p>
                  </ChartTooltip>
                ) : null
              }
            />
            <XAxis
              dataKey="quarter"
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDarkMode ? '#97A3B7' : '#677488' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              padding={{ bottom: 8 }}
              tick={{ fill: isDarkMode ? '#97A3B7' : '#677488' }}
              tickFormatter={(value) => String(formatNumber(+value))}
            />
            <Bar
              dataKey="expenses"
              fill="url(#expenses)"
              radius={20}
              barSize={12}
            />
            <Bar
              dataKey="revenue"
              fill="url(#revenue)"
              radius={20}
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
