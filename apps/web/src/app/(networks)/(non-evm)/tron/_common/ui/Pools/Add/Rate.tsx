import { Button, SkeletonBox } from '@sushiswap/ui'
import { useMemo, useState } from 'react'
import { formatUSD } from 'sushi/format'
import { formatUnits, parseUnits } from '~tron/_common/lib/utils/formatters'
import {
  getToken0AmountForLiquidity,
  getToken1AmountForLiquidity,
} from '~tron/_common/lib/utils/helpers'
import { usePoolState } from '../pool-provider'

export const Rate = ({
  token0Price,
  token1Price,
  isLoading,
}: {
  token0Price: string | undefined
  token1Price: string | undefined
  isLoading: boolean
}) => {
  const [showToken0First, setShowToken0First] = useState<boolean>(false)
  const { token0, token1, reserve0, reserve1 } = usePoolState()

  const handleToggleRate = () => {
    setShowToken0First(!showToken0First)
  }

  const rateOfToken0 = useMemo(() => {
    if (!reserve0 || !reserve1) return
    if (!token0 || !token1) return
    return getToken0AmountForLiquidity(
      parseUnits('1', token1?.decimals),
      reserve0,
      reserve1,
    )
  }, [token0, token1, reserve0, reserve1])

  const rateOfToken1 = useMemo(() => {
    if (!reserve0 || !reserve1) return
    if (!token0 || !token1) return
    return getToken1AmountForLiquidity(
      parseUnits('1', token0?.decimals),
      reserve0,
      reserve1,
    )
  }, [token0, token1, reserve0, reserve1])

  return (
    <div className="flex items-center gap-1">
      <Button
        size="xsm"
        variant="link"
        className="hover:!no-underline"
        onClick={handleToggleRate}
      >
        1 {showToken0First ? token0?.symbol : token1?.symbol} ={' '}
        {showToken0First
          ? formatUnits(rateOfToken1 ?? '0', token1?.decimals!, 4)
          : formatUnits(rateOfToken0 ?? '0', token0?.decimals!, 4)}{' '}
        {showToken0First ? token1?.symbol : token0?.symbol}
      </Button>
      {isLoading ? (
        <SkeletonBox className="h-3 w-[35px] rounded-sm" />
      ) : (
        <div className="text-[12px] opacity-40">
          {showToken0First
            ? formatUSD(token0Price ?? '')
            : formatUSD(token1Price ?? '')}
        </div>
      )}
    </div>
  )
}
