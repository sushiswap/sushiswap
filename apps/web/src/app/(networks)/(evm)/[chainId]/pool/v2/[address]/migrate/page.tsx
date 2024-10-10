import { V2Pool, getV2Pool } from '@sushiswap/graph-client/data-api'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import { PoolPositionProvider } from 'src/ui/pool'
import { ConcentratedLiquidityProvider } from 'src/ui/pool/ConcentratedLiquidityProvider'
import { MigrateTab } from 'src/ui/pool/MigrateTab'
import { ChainId } from 'sushi/chain'
import { isSushiSwapV2ChainId } from 'sushi/config'
import { isAddress } from 'viem'

export default async function MigrateV2PoolPage({
  params,
}: {
  params: { chainId: string; address: string }
}) {
  const { chainId: _chainId, address } = params
  const chainId = +_chainId as ChainId

  if (
    !isSushiSwapV2ChainId(chainId) ||
    !isAddress(address, { strict: false })
  ) {
    return notFound()
  }

  const pool = (await unstable_cache(
    async () => getV2Pool({ chainId, address }),
    ['pool', `${chainId}:${address}`],
    {
      revalidate: 60 * 15,
    },
  )()) as V2Pool

  return (
    <div className="flex flex-col gap-6">
      <PoolPositionProvider pool={pool}>
        <ConcentratedLiquidityProvider>
          <MigrateTab pool={pool} />
        </ConcentratedLiquidityProvider>
      </PoolPositionProvider>
    </div>
  )
}
