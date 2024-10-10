import { V2Pool, getV2Pool } from '@sushiswap/graph-client/data-api'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'

import { PoolPageV2 } from 'src/ui/pool/PoolPageV2'
import type { ChainId } from 'sushi'
import { isSushiSwapV2ChainId } from 'sushi/config'
import { isAddress } from 'viem'

export default async function PoolPage({
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
    async () => await getV2Pool({ chainId, address }),
    ['pool', `${chainId}:${address}`],
    {
      revalidate: 60 * 15,
    },
  )()) as V2Pool

  return <PoolPageV2 pool={pool} />
}
