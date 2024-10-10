import { V3Pool } from '@sushiswap/graph-client/data-api'
import { Card } from '@sushiswap/ui'
import React, { FC, useMemo, useState } from 'react'
import { Address, SushiSwapProtocol } from 'sushi'
import { SushiSwapV3ChainId } from 'sushi/config'
import { LiquidityDepthWidget } from './LiquidityDepthWidget'
import { PoolChartGraph } from './PoolChartGraph'
import { PoolChartPeriod, PoolChartPeriods } from './PoolChartPeriods'
import { PoolChartType, PoolChartTypes } from './PoolChartTypes'

const statisticsChart = [
  PoolChartType.Volume,
  PoolChartType.TVL,
  PoolChartType.Fees,
  PoolChartType.Depth,
]

interface Charts {
  address: Address
  chainId: SushiSwapV3ChainId
  pool: V3Pool
}

export const StatisticsChartsV3: FC<Charts> = ({ address, chainId, pool }) => {
  const [chart, setChart] = useState<PoolChartType>(statisticsChart[0])
  const [period, setPeriod] = useState<PoolChartPeriod>(PoolChartPeriod.Month)

  const periods = useMemo(() => {
    if (chart === PoolChartType.Depth) return []

    return [
      PoolChartPeriod.Day,
      PoolChartPeriod.Week,
      PoolChartPeriod.Month,
      PoolChartPeriod.Year,
      PoolChartPeriod.All,
    ]
  }, [chart])

  return (
    <Card>
      <div className="border-b border-accent px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex mx-auto">
          <PoolChartTypes
            charts={statisticsChart}
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
      {chart === PoolChartType.Depth ? (
        <LiquidityDepthWidget chainId={chainId} address={address} />
      ) : (
        <PoolChartGraph
          chart={chart}
          period={period}
          pool={pool}
          protocol={SushiSwapProtocol.SUSHISWAP_V3}
        />
      )}
    </Card>
  )
}
