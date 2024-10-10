import {
  getV3Pool,
  getVaults,
  isSmartPoolChainId,
} from '@sushiswap/graph-client/data-api'
import {
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
} from '@sushiswap/ui'
import { unstable_cache } from 'next/cache'
import { SteerCarousel } from 'src/ui/pool/Steer/SteerCarousel'
import { ChainId } from 'sushi/chain'
import { isSushiSwapV3ChainId } from 'sushi/config'
import { isAddress } from 'viem'
import notFound from '../../../../../not-found'

export default async function VaultOverviewPage({
  params,
}: {
  params: { chainId: string; address: string }
}) {
  const { chainId: _chainId, address } = params
  const chainId = +_chainId as ChainId

  if (
    !isSushiSwapV3ChainId(chainId) ||
    !isSmartPoolChainId(chainId) ||
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

  const vaults = await unstable_cache(
    async () => getVaults({ chainId, poolAddress: address }),
    ['vaults', `${chainId}:${address}`],
    {
      revalidate: 60 * 15,
    },
  )()

  if (!pool || !vaults) {
    return notFound(chainId)
  }

  return (
    <Container maxWidth="5xl" className="px-4">
      <CardHeader className="!p-0">
        <CardTitle>Available Strategies</CardTitle>
        <CardDescription>
          Choose one of the following strategies:
        </CardDescription>
      </CardHeader>
      <SteerCarousel pool={pool} vaults={vaults} />
    </Container>
  )
}
