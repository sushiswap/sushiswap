import { getV3Pool, getVaults } from '@sushiswap/graph-client/data-api'
import { unstable_cache } from 'next/cache'
import { SteerCarousel } from 'src/ui/pool/Steer/SteerCarousel'
import notFound from '../../../../../not-found'

export default async function VaultOverviewPage({
  params,
}: {
  params: { chainId: string; address: string }
}) {
  const { chainId, address } = params
  const pool = await unstable_cache(
    async () => getV3Pool({ chainId: Number(chainId), address }),
    ['pool', `${chainId}:${address}`],
    {
      revalidate: 60 * 3,
    },
  )()

  const vaults = await unstable_cache(
    async () => getVaults({ chainId: Number(chainId), poolAddress: address }),
    ['vaults', `${chainId}:${address}`],
    {
      revalidate: 60 * 15,
    },
  )()

  if (!pool || !vaults) {
    return notFound()
  }

  return <SteerCarousel pool={pool} vaults={vaults} />
}
