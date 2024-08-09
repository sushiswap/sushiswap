'use client'

import { V2Pool } from '@sushiswap/graph-client/data-api'
import {
  Card,
  CardContent,
  CardCurrencyAmountItem,
  CardDescription,
  CardGroup,
  CardHeader,
  CardLabel,
  CardTitle,
  SkeletonText,
} from '@sushiswap/ui'
import { FC, useMemo } from 'react'
import { useTokenAmountDollarValues } from 'src/lib/hooks'
import { Amount, Token } from 'sushi/currency'
import { formatUSD } from 'sushi/format'

interface PoolCompositionProps {
  pool: V2Pool
}

export const PoolComposition: FC<PoolCompositionProps> = ({ pool }) => {
  const amounts = useMemo(() => {
    const token0 = new Token({
      chainId: pool.chainId,
      address: pool.token0.address,
      decimals: pool.token0.decimals,
      symbol: pool.token0.symbol,
      name: pool.token0.name,
    })

    const token1 = new Token({
      chainId: pool.chainId,
      address: pool.token1.address,
      decimals: pool.token1.decimals,
      symbol: pool.token1.symbol,
      name: pool.token1.name,
    })
    return [
      Amount.fromRawAmount(token0, pool.reserve0),
      Amount.fromRawAmount(token1, pool.reserve1),
    ]
  }, [pool])

  const fiatValues = useTokenAmountDollarValues({
    chainId: pool.chainId,
    amounts,
  })

  const isLoading = fiatValues.length !== amounts.length

  const [reserve0USD, reserve1USD, reserveUSD] = useMemo(() => {
    if (isLoading) return [0, 0, 0]
    return [fiatValues[0], fiatValues[1], fiatValues[0] + fiatValues[1]]
  }, [fiatValues, isLoading])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pool Liquidity</CardTitle>
        <CardDescription>
          {isLoading ? <SkeletonText /> : <>{formatUSD(reserveUSD)}</>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CardGroup>
          <CardLabel>Tokens</CardLabel>
          <CardCurrencyAmountItem
            isLoading={isLoading}
            amount={amounts[0]}
            fiatValue={formatUSD(reserve0USD)}
          />
          <CardCurrencyAmountItem
            isLoading={isLoading}
            amount={amounts[1]}
            fiatValue={formatUSD(reserve1USD)}
          />
        </CardGroup>
      </CardContent>
    </Card>
  )
}
