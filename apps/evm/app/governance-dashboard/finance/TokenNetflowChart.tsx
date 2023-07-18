'use client'

import React from 'react'
import { Bar, BarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { ChartTooltip } from '../components'
import { formatNumber, SushiTokenNetflow, useIsDarkMode } from '../lib'

export function TokenNetflowChart(props: { tokenNetflowData: SushiTokenNetflow[] }) {
  const tokenNetflowData = props.tokenNetflowData.map((month) => ({ ...month, outflow: -month.outflow }))
  const isDarkMode = useIsDarkMode()

  return (
    <ResponsiveContainer minWidth="100%" minHeight={240}>
      <BarChart data={tokenNetflowData} stackOffset="sign">
        <defs>
          <linearGradient id="inflow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#568AE8" />
            <stop offset="100.2%" stopColor={isDarkMode ? '#1A2031' : 'white'} />
          </linearGradient>
          <linearGradient id="outflow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? '#1A2031' : 'white'} stopOpacity={0.85} />
            <stop offset="100.2%" stopColor="#C662F5" />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#97A3B7' : '#677488' }} />
        <YAxis
          axisLine={false}
          tickLine={false}
          padding={{ bottom: 8 }}
          tick={{ fill: isDarkMode ? '#97A3B7' : '#677488' }}
          tickFormatter={(value) => String(formatNumber(+value))}
        />
        <Tooltip
          cursor={{ fill: 'transparent' }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <ChartTooltip>
                <dl className="text-base font-semibold">
                  <div className="flex items-center gap-8 justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-sm bg-blue" />
                      <dt>Inflow</dt>
                    </div>
                    <dd>${formatNumber(Math.abs(payload[0].payload.inflow), 0)}</dd>
                  </div>
                  <div className="flex items-center gap-8 justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-sm bg-[#BF60EE]" />
                      <dt>Outflow</dt>
                    </div>
                    <dd>${formatNumber(Math.abs(payload[0].payload.outflow), 0)}</dd>
                  </div>
                </dl>
                <p className="mt-1">{label}</p>
              </ChartTooltip>
            ) : null
          }
        />
        <Bar barSize={24} dataKey="inflow" fill="url(#inflow)" stackId="stack" />
        <Bar barSize={24} dataKey="outflow" fill="url(#outflow)" stackId="stack" />
        <ReferenceLine
          isFront
          y={0}
          stroke={isDarkMode ? '#97A3B7' : '#677488'}
          strokeDasharray="5 5"
          opacity={isDarkMode ? 0.1 : 1}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
