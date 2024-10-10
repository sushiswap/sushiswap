import { getV2Pool } from '@sushiswap/graph-client/data-api'
import { unstable_cache } from 'next/cache'
import { ChainId } from 'sushi'
import { isSushiSwapV2ChainId } from 'sushi/config'
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
    !isSushiSwapV2ChainId(chainId) ||
    !isAddress(address, { strict: false })
  ) {
    return notFound()
  }

  const pool = await unstable_cache(
    async () => getV2Pool({ chainId, address }),
    ['pool', `${chainId}:${address}`],
    {
      revalidate: 60 * 15,
    },
  )()

  // Rockstar C&D
  if (!pool || pool.id === '42161:0x0a4f9962e24893a4a7567e52c1ce37d5482365de') {
    return notFound()
  }

  return <>{children}</>
}
