import {
  Card,
  CardContent,
  CardDescription,
  CardGroup,
  CardHeader,
  CardLabel,
  CardTitle,
  SkeletonText,
} from '@sushiswap/ui'
import { formatUSD } from 'sushi/format'
import { useReserves } from '~tron/_common/lib/hooks/useReserves'
import { useStablePrice } from '~tron/_common/lib/hooks/useStablePrice'
import { formatUnitsForInput } from '~tron/_common/lib/utils/formatters'
import { IToken } from '~tron/_common/types/token-type'
import { LiquidityItem } from './LiquidityItem'

export const PoolLiquidity = ({
  token0,
  token1,
  isLoading,
  pairAddress,
}: {
  token0: IToken | undefined
  token1: IToken | undefined
  isLoading: boolean
  pairAddress: string
}) => {
  const { data, isLoading: isLoadingReserves } = useReserves({
    pairAddress,
    token0,
    token1,
  })

  const reserve0 = data?.[0]?.reserve ?? '0'
  const reserve0Formatted = formatUnitsForInput(reserve0, token0?.decimals ?? 0)

  const reserve1 = data?.[1]?.reserve ?? '0'
  const reserve1Formatted = formatUnitsForInput(reserve1, token1?.decimals ?? 0)

  const { data: token0Price, isLoading: isToken0PriceLoading } = useStablePrice(
    { token: token0 },
  )
  const { data: token1Price, isLoading: isToken1PriceLoading } = useStablePrice(
    { token: token1 },
  )

  const token0PoolPrice = (
    Number(token0Price) * Number(reserve0Formatted)
  ).toString(10)
  const token1PoolPrice = (
    Number(token1Price) * Number(reserve1Formatted)
  ).toString(10)

  const isLoadingData =
    isLoading ||
    isLoadingReserves ||
    isToken0PriceLoading ||
    isToken1PriceLoading

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pool Liquidity</CardTitle>
        {!token0Price || !token1Price ? (
          <div className="w-28">
            <SkeletonText fontSize="sm" />
          </div>
        ) : (
          <CardDescription>
            {formatUSD(Number(token0PoolPrice) + Number(token1PoolPrice))}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <CardGroup>
          <CardLabel>Tokens</CardLabel>
          <LiquidityItem
            isLoading={isLoadingData}
            token={token0}
            amount={reserve0}
            usdAmount={token0PoolPrice}
          />
          <LiquidityItem
            isLoading={isLoadingData}
            token={token1}
            amount={reserve1}
            usdAmount={token1PoolPrice}
          />
        </CardGroup>
      </CardContent>
    </Card>
  )
}
