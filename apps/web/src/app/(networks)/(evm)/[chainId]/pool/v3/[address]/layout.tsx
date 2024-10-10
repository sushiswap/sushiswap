import { getV3Pool } from '@sushiswap/graph-client/data-api'
import { unstable_cache } from 'next/cache'
import { ChainId } from 'sushi/chain'
import { isSushiSwapV3ChainId } from 'sushi/config'
import { isAddress } from 'viem'
import notFound from '../../../not-found'

export const metadata = {
  title: 'Pool 💦',
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
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

  const pool = await unstable_cache(
    async () => getV3Pool({ chainId, address }),
    ['pool', `${chainId}:${address}`],
    {
      revalidate: 60 * 15,
    },
  )()

  if (!pool) {
    return notFound(chainId)
  }

  return <>{children}</>
}
