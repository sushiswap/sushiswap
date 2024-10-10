import { V2Pool, getV2Pool } from '@sushiswap/graph-client/data-api'
import { LinkExternal, Message } from '@sushiswap/ui'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import { PoolPositionProvider } from 'src/ui/pool'
import { ManageV2LiquidityCard } from 'src/ui/pool/ManageV2LiquidityCard'
import { PoolPosition } from 'src/ui/pool/PoolPosition'
import { ChainId } from 'sushi/chain'
import { isSushiSwapV2ChainId } from 'sushi/config'
import { isAddress } from 'viem'

export default async function ManageV2PoolPage({
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
    <>
      <Message size="sm" variant="info">
        <h1 className="py-1 text-lg text-accent-foreground">
          Not seeing your position?
        </h1>
        We’re beginning to phase out the staking contracts used for V2 pools to
        make way for new and improved technology. If you have any staked
        positions and wish to unstake and claim your rewards, please visit{' '}
        <LinkExternal href="https://deprecated.sushi.com/farms">
          <span className="text-muted-foreground">
            https://deprecated.sushi.com/farms
          </span>
        </LinkExternal>
      </Message>
      <div className="grid grid-cols-1 md:grid-cols-[auto_400px] gap-6">
        <div>
          <ManageV2LiquidityCard pool={pool} tab="add" />
        </div>
        <div className="flex flex-col gap-6">
          <PoolPositionProvider pool={pool}>
            <PoolPosition pool={pool} />
          </PoolPositionProvider>
        </div>
      </div>
    </>
  )
}
