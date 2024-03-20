'use client'

import React from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { formatNumber, useIsDarkMode } from '../../../lib/governance-dashboard'
import { ChartTooltip } from '../../../ui/governance-dashboard/ChartTooltip'

export function HistoricalTreasuryChart({
  treasuryHistoricalTvl,
}: {
  treasuryHistoricalTvl: { date: string; value: number }[]
}) {
  const isDarkMode = useIsDarkMode()

  return (
    <div className="w-full text-xs">
      <ResponsiveContainer minWidth="100%" minHeight={240}>
        <AreaChart
          data={treasuryHistoricalTvl}
          margin={{
            right: 20,
          }}
        >
          <defs>
            <linearGradient
              id="area-gradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="13.14%" stopColor="#2C6DE2" />
              <stop
                offset="100.2%"
                stopColor={isDarkMode ? '#101728' : 'white'}
              />
            </linearGradient>
          </defs>
          <XAxis
            tickFormatter={(date) =>
              new Date(+date * 1000).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
              })
            }
            dataKey="date"
            interval={30}
            axisLine={false}
            tickLine={false}
            scale="band"
            tick={{ fill: isDarkMode ? '#97A3B7' : '#677488' }}
          />
          <YAxis
            tickFormatter={(tick) => '$' + formatNumber(tick)}
            axisLine={false}
            tickLine={false}
            padding={{ bottom: 8 }}
            tick={{ fill: isDarkMode ? '#97A3B7' : '#677488' }}
          />
          <Tooltip
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <ChartTooltip>
                  <dl>
                    <dd className="text-base font-semibold">
                      ${formatNumber(payload[0].payload.value)}
                    </dd>
                    <dt>
                      {new Date(label * 1000).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </dt>
                  </dl>
                </ChartTooltip>
              ) : null
            }
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#2C6DE2"
            strokeWidth={4}
            dot={false}
            fill="url(#area-gradient)"
            fillOpacity={0.33}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
