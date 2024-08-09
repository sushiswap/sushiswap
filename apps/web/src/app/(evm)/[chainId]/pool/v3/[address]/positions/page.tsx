import { V3Pool, getV3Pool } from '@sushiswap/graph-client/data-api'
import { Container } from '@sushiswap/ui'
import { unstable_cache } from 'next/cache'
import { PoolsFiltersProvider } from 'src/ui/pool'
import { ConcentratedPositionsTable } from 'src/ui/pool/ConcentratedPositionsTable'

export default async function ManageV3PoolPage({
  params,
}: {
  params: { chainId: string; address: string }
}) {
  const { chainId, address } = params
  const pool = (await unstable_cache(
    async () => await getV3Pool({ chainId: Number(chainId), address }),
    ['pool', `${chainId}:${address}`],
    {
      revalidate: 60 * 3,
    },
  )()) as NonNullable<V3Pool>

  return (
    <Container maxWidth="5xl" className="px-2 sm:px-4">
      <div className="flex flex-col gap-6">
        <PoolsFiltersProvider>
          <ConcentratedPositionsTable
            chainId={pool.chainId}
            poolId={pool.address}
            hideNewSmartPositionButton={!pool.hasEnabledSteerVault}
          />
        </PoolsFiltersProvider>
      </div>
    </Container>
  )
}
