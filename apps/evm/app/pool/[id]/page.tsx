import { Separator } from '@sushiswap/ui'
import { notFound } from 'next/navigation'
import { ChainId } from 'sushi/chain'
import { ManageV2LiquidityCard } from 'ui/pool/ManageV2LiquidityCard'
import { PoolTransactionsV2 } from 'ui/pool/PoolTransactionsV2'

import { Pool } from '@sushiswap/client'
import React from 'react'
import {
  PoolPositionProvider,
  PoolPositionRewardsProvider,
  PoolPositionStakedProvider,
  UnknownTokenAlert,
} from '../../../ui/pool'
import { PoolChartV2 } from '../../../ui/pool/PoolChartV2'
import { PoolComposition } from '../../../ui/pool/PoolComposition'
import { PoolMyRewards } from '../../../ui/pool/PoolMyRewards'
import { PoolPageV3 } from '../../../ui/pool/PoolPageV3'
import { PoolPosition } from '../../../ui/pool/PoolPosition'
import { PoolRewards } from '../../../ui/pool/PoolRewards'
import { PoolStats } from '../../../ui/pool/PoolStats'

export default async function PoolPage({ params }: { params: { id: string } }) {
  const [chainId, address] = params.id.split(
    params.id.includes('%3A') ? '%3A' : ':',
  ) as [string, string]

  const res = await fetch(
    `https://pools.sushi.com/api/v0/${chainId}/${address}`,
    { next: { revalidate: 60 } },
  )
  const pool = (await res.json()) as Pool

  if (!pool) {
    notFound()
  }

  if (pool.protocol === 'SUSHISWAP_V3') {
    return <PoolPageV3 pool={pool} />
  }

  return (
    <div className="flex flex-col gap-6">
      <UnknownTokenAlert pool={pool} />
      <div className="grid grid-cols-1 md:grid-cols-[auto_400px] gap-6">
        <div>
          <ManageV2LiquidityCard pool={pool} />
        </div>
        <div className="flex flex-col gap-6">
          <PoolPositionProvider pool={pool}>
            <PoolPositionStakedProvider pool={pool}>
              <PoolPositionRewardsProvider pool={pool}>
                <PoolPosition pool={pool} />
                <PoolMyRewards pool={pool} />
              </PoolPositionRewardsProvider>
            </PoolPositionStakedProvider>
          </PoolPositionProvider>
        </div>
      </div>
      <div className="py-4">
        <Separator />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[auto_400px] gap-6">
        <div>
          <PoolChartV2
            address={pool.address}
            chainId={pool.chainId as ChainId}
          />
        </div>
        <div className="flex flex-col gap-6">
          <PoolComposition pool={pool} />
          <PoolStats pool={pool} />
          <PoolRewards pool={pool} />
        </div>
      </div>
      <div className="py-4">
        <Separator />
      </div>
      <PoolTransactionsV2 pool={pool} poolId={pool.address} />
    </div>
  )
}
