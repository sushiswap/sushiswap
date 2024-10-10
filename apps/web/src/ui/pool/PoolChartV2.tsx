'use client'

import { V2Pool } from '@sushiswap/graph-client/data-api'
import { Card } from '@sushiswap/ui'
import React, { FC, useState } from 'react'
import { SushiSwapProtocol } from 'sushi'
import { PoolChartGraph } from './PoolChartGraph'
import { PoolChartPeriod, PoolChartPeriods } from './PoolChartPeriods'
import { PoolChartType, PoolChartTypes } from './PoolChartTypes'

const charts = [
  PoolChartType.Volume,
  PoolChartType.TVL,
  PoolChartType.Fees,
] as const
const periods = [
  PoolChartPeriod.Day,
  PoolChartPeriod.Week,
  PoolChartPeriod.Month,
  PoolChartPeriod.Year,
  PoolChartPeriod.All,
]

interface PoolChartV2Props {
  pool: V2Pool
}

const PoolChartV2: FC<PoolChartV2Props> = ({ pool }) => {
  const [chart, setChart] = useState<(typeof charts)[number]>(charts[0])
  const [period, setPeriod] = useState<PoolChartPeriod>(PoolChartPeriod.Month)

  return (
    <Card>
      <div className="border-b border-accent px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex mx-auto">
          <PoolChartTypes
            charts={charts}
            selectedChart={chart}
            setChart={setChart}
          />
        </div>
        <div className="flex mx-auto">
          <PoolChartPeriods
            periods={periods}
            selectedPeriod={period}
            setPeriod={setPeriod}
          />
        </div>
      </div>
      <PoolChartGraph
        chart={chart}
        period={period}
        pool={pool}
        protocol={SushiSwapProtocol.SUSHISWAP_V2}
      />
    </Card>
  )
}

export { PoolChartV2 }
