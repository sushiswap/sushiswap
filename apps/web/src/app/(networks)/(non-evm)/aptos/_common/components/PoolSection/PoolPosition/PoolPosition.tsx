import { useWallet } from '@aptos-labs/wallet-adapter-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  SkeletonText,
} from '@sushiswap/ui'
import { FC, useMemo } from 'react'
import { formatUSD } from 'sushi/format'
import { useNetwork } from '~aptos/_common/lib/common/use-network'
import { useStablePrice } from '~aptos/_common/lib/common/use-stable-price'
import { useTokenBalance } from '~aptos/_common/lib/common/use-token-balances'
import { useTotalSupply } from '~aptos/_common/lib/common/use-total-supply'
import { Pool } from '~aptos/pool/lib/convert-pool-to-sushi-pool'
import { useTokensFromPool } from '~aptos/pool/lib/use-tokens-from-pool'
import { useUnderlyingTokenBalanceFromPool } from '~aptos/pool/lib/use-underlying-token-balance-from-pool'
import { PoolPositionDesktop } from './PoolPositionDesktop'

interface PoolPositionProps {
  row?: Pool
  isLoading: boolean
  stakeAmount: number
}

export const PoolPosition: FC<PoolPositionProps> = ({
  row,
  isLoading,
  stakeAmount,
}) => {
  const { token0, token1 } = useTokensFromPool(row)
  const { account } = useWallet()
  const tokenAddress = row?.id
  const [reserve0, reserve1] = useMemo(() => {
    return [row?.reserve0, row?.reserve1]
  }, [row])

  const {
    contracts: { swap: swapContract },
  } = useNetwork()

  const { data: LPBalance, isLoading: isBalanceLoading } = useTokenBalance({
    account: account?.address as string,
    currency: `${swapContract}::swap::LPToken<${tokenAddress}>`,
    enabled: Boolean(swapContract && account?.address && tokenAddress),
    refetchInterval: 2000,
  })

  const { data: coinInfo, isLoading: isLoadingSupply } =
    useTotalSupply(tokenAddress)
  const totalSupply = coinInfo?.data?.supply?.vec?.[0]?.integer?.vec?.[0]?.value

  const [underlying0, underlying1] = useUnderlyingTokenBalanceFromPool({
    balance: LPBalance,
    reserve0: Number(reserve0),
    reserve1: Number(reserve1),
    token0,
    token1,
    totalSupply: Number(totalSupply),
  })

  const [stakedUnderlying0, stakedUnderlying1] =
    useUnderlyingTokenBalanceFromPool({
      balance: stakeAmount,
      reserve0: Number(reserve0),
      reserve1: Number(reserve1),
      token0,
      token1,
      totalSupply: Number(totalSupply),
    })

  const token0Price = useStablePrice({ currency: token0 })
  const token1Price = useStablePrice({ currency: token1 })

  const token0UnstakedInUsd = token0Price
    ? token0Price * Number(underlying0 ?? 0)
    : 0
  const token1UnstakedInUsd = token1Price
    ? token1Price * Number(underlying1 ?? 0)
    : 0
  const token0StakedInUsd = token0Price
    ? token0Price * Number(stakedUnderlying0 ?? 0)
    : 0
  const token1StakedInUsd = token1Price
    ? token1Price * Number(stakedUnderlying1 ?? 0)
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Position</CardTitle>
        <CardDescription>
          {isLoading ? (
            <div className="w-28">
              <SkeletonText fontSize="sm" />
            </div>
          ) : (
            <span className="text-sm text-right dark:text-slate-50 text-gray-900">
              {formatUSD(
                token0StakedInUsd +
                  token1StakedInUsd +
                  token0UnstakedInUsd +
                  token1UnstakedInUsd,
              )}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PoolPositionDesktop
          row={row}
          isLoading={isLoading || isBalanceLoading || isLoadingSupply}
          underlying0={underlying0}
          underlying1={underlying1}
          value0={token0UnstakedInUsd}
          value1={token1UnstakedInUsd}
        />
      </CardContent>
    </Card>
  )
}
