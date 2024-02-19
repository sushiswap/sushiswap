import {
  Card,
  CardContent,
  CardDescription,
  CardGroup,
  CardHeader,
  CardLabel,
  CardTitle,
} from '@sushiswap/ui'
import { FC } from 'react'
import { Pool } from 'utils/usePools'
import { useTokensFromPools } from 'utils/useTokensFromPool'
import { formatNumber } from 'utils/utilFunctions'
import { CardCurrencyAmountItem } from '../CardCurrencyAmountItem'
import useStablePrice from 'utils/useStablePrice'
import { formatUSD } from 'sushi'

interface PoolCompositionProps {
  row: Pool
}

export const PoolComposition: FC<PoolCompositionProps> = ({ row }) => {
  const { token0, token1 } = useTokensFromPools(row)
  const token0Price = useStablePrice(token0)
  const token1Price = useStablePrice(token1)
  const balanceX = formatNumber(
    Number(row?.data?.balance_x?.value),
    token0.decimals,
  )
  const balanceY = formatNumber(
    Number(row?.data?.balance_y?.value),
    token1.decimals,
  )
  const token0PoolPrice = token0Price ? token0Price * Number(balanceX) : 0
  const token1PoolPrice = token1Price ? token1Price * Number(balanceY) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pool Liquidity</CardTitle>
        <CardDescription>
          {formatUSD(token0PoolPrice + token1PoolPrice)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CardGroup>
          <CardLabel>Tokens</CardLabel>
          <CardCurrencyAmountItem
            amount={Number(balanceX)}
            currency={token0}
            fiatValue={formatUSD(token0PoolPrice)}
          />
          <CardCurrencyAmountItem
            amount={Number(balanceY)}
            currency={token1}
            fiatValue={formatUSD(token1PoolPrice)}
          />
        </CardGroup>
      </CardContent>
    </Card>
  )
}
