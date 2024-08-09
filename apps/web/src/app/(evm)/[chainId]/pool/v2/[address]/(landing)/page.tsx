import { V2Pool, getV2Pool } from '@sushiswap/graph-client/data-api'
import { unstable_cache } from 'next/cache'

import { PoolPageV2 } from 'src/ui/pool/PoolPageV2'

export default async function PoolPage({
  params,
}: {
  params: { chainId: string; address: string }
}) {
  const { chainId, address } = params
  const pool = (await unstable_cache(
    async () => await getV2Pool({ chainId: Number(chainId), address }),
    ['pool', `${chainId}:${address}`],
    {
      revalidate: 60 * 3,
    },
  )()) as NonNullable<V2Pool>

  return <PoolPageV2 pool={pool} />
}
