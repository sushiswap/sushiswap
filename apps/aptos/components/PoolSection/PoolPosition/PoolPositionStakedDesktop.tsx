import { CardGroup, CardLabel } from '@sushiswap/ui'
import { FC, useMemo } from 'react'
import { Pool } from 'utils/usePools'
import { useTokensFromPools } from 'utils/useTokensFromPool'
import { useTotalSupply } from 'utils/useTotalSupply'
import { useUnderlyingTokenBalanceFromPool } from 'utils/useUnderlyingTokenBalanceFromPool'
import { CardCurrencyAmountItem } from '../../CardCurrencyAmountItem'
import useStablePrice from 'utils/useStablePrice'
import { formatUSD } from 'sushi'

interface PoolPositionStakedDesktopProps {
  row: Pool
  isLoading: boolean
  stakeAmount: number
}

export const PoolPositionStakedDesktop: FC<PoolPositionStakedDesktopProps> = ({
  row,
  isLoading,
  stakeAmount,
}) => {
  const { token0, token1 } = useTokensFromPools(row)
  const tokenAddress = row?.id
  const { data: coinInfo } = useTotalSupply(tokenAddress)

  const [reserve0, reserve1] = useMemo(() => {
    return [row?.data?.balance_x?.value, row?.data?.balance_y?.value]
  }, [row])

  const totalSupply = coinInfo?.data?.supply?.vec?.[0]?.integer?.vec?.[0]?.value
  const [underlying0, underlying1] = useUnderlyingTokenBalanceFromPool({
    balance: stakeAmount,
    reserve0: Number(reserve0),
    reserve1: Number(reserve1),
    totalSupply: Number(totalSupply),
    decimals: coinInfo?.data?.decimals,
  })

  const token0Price = useStablePrice(token0)
  const token1Price = useStablePrice(token1)
  const token0StakedInUsd = token0Price ? token0Price * Number(underlying0) : 0
  const token1StakedInUsd = token1Price ? token1Price * Number(underlying1) : 0

  return (
    <CardGroup>
      <CardLabel>Staked</CardLabel>
      <CardCurrencyAmountItem
        currency={token0}
        isLoading={isLoading}
        amount={underlying0}
        fiatValue={formatUSD(token0StakedInUsd)}
      />
      <CardCurrencyAmountItem
        isLoading={isLoading}
        currency={token1}
        amount={underlying1}
        fiatValue={formatUSD(token1StakedInUsd)}
      />
    </CardGroup>
  )
}
