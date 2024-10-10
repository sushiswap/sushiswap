import { V3Pool, getV3Pool } from '@sushiswap/graph-client/data-api'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import { PoolsFiltersProvider } from 'src/ui/pool'
import { ConcentratedPositionsTable } from 'src/ui/pool/ConcentratedPositionsTable'
import { ChainId } from 'sushi/chain'
import { isSushiSwapV3ChainId } from 'sushi/config'
import { isAddress } from 'viem'

export default async function ManageV3PoolPage({
  params,
}: {
  params: { chainId: string; address: string }
}) {
  const { chainId: _chainId, address } = params
  const chainId = +_chainId as ChainId

  if (
    !isSushiSwapV3ChainId(chainId) ||
    !isAddress(address, { strict: false })
  ) {
    return notFound()
  }

  const pool = (await unstable_cache(
    async () => await getV3Pool({ chainId, address }),
    ['pool', `${chainId}:${address}`],
    {
      revalidate: 60 * 15,
    },
  )()) as V3Pool

  return (
    <PoolsFiltersProvider>
      <ConcentratedPositionsTable
        chainId={pool.chainId}
        poolAddress={pool.address}
        hideNewSmartPositionButton={!pool.hasEnabledSteerVault}
      />
    </PoolsFiltersProvider>
  )
}
