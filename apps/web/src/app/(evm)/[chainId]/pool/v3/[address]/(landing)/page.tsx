import { V3Pool, getV3Pool } from '@sushiswap/graph-client/data-api'
import { unstable_cache } from 'next/cache'

import { PoolPageV3 } from 'src/ui/pool/PoolPageV3'

export default async function PoolPage({
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

  return <PoolPageV3 pool={pool} />
}
