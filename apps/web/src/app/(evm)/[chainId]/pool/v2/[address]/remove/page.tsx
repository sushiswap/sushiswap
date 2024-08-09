import { V2Pool, getV2Pool } from '@sushiswap/graph-client/data-api'
import { Container } from '@sushiswap/ui'
import { unstable_cache } from 'next/cache'
import {
  PoolPositionProvider,
  PoolPositionRewardsProvider,
  PoolPositionStakedProvider,
} from 'src/ui/pool'
import { ManageV2LiquidityCard } from 'src/ui/pool/ManageV2LiquidityCard'
import { PoolMyRewards } from 'src/ui/pool/PoolMyRewards'
import { PoolPosition } from 'src/ui/pool/PoolPosition'

export default async function ManageV2PoolPage({
  params: { chainId, address },
}: {
  params: {
    chainId: string
    address: string
  }
}) {
  const pool = (await unstable_cache(
    async () => getV2Pool({ chainId: Number(chainId), address }),
    ['pool', `${chainId}:${address}`],
    {
      revalidate: 60 * 15,
    },
  )()) as NonNullable<V2Pool>

  return (
    <Container maxWidth="5xl" className="px-2 sm:px-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-[auto_400px] gap-6">
        <div>
          <ManageV2LiquidityCard pool={pool} tab="remove" />
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
    </Container>
  )
}
