import { getAnalyticsDayBuckets } from '@sushiswap/graph-client/data-api'
import { Card } from '@sushiswap/ui'
import { unstable_cache } from 'next/cache'
import { FC } from 'react'
import { ChainId } from 'sushi/chain'
import { TVLChart } from './tvl-chart'
import { VolumeChart } from './volume-chart'

export const GlobalStatsCharts: FC<{ chainId: ChainId }> = async ({
  chainId,
}) => {
  const dayBuckets = await unstable_cache(
    async () =>
      getAnalyticsDayBuckets({
        chainId,
      }),
    ['dayBuckets', `${chainId}`],
    {
      revalidate: 60 * 3,
    },
  )()

  return (
    <div className="flex flex-col gap-2">
      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-accent divide-y lg:divide-y-0">
          <TVLChart data={dayBuckets} />
          <VolumeChart data={dayBuckets} />
        </div>
      </Card>
    </div>
  )
}
