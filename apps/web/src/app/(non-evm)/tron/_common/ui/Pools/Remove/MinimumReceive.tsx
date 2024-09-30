import {
  SlippageToleranceStorageKey,
  useSlippageTolerance,
} from '@sushiswap/hooks'
import { Card, CardGroup, CardLabel } from '@sushiswap/ui'
import { useEffect, useMemo } from 'react'
import { PAIR_DECIMALS } from '~tron/_common/constants/pair-decimals'
import { useStablePrice } from '~tron/_common/lib/hooks/useStablePrice'
import {
  formatUnitsForInput,
  parseUnits,
  removeDecimals,
  toBigNumber,
} from '~tron/_common/lib/utils/formatters'
import { LiquidityItem } from '../PoolDetails/LiquidityItem'
import { usePoolState } from '../pool-provider'
import { useRemoveLiqDispatch, useRemoveLiqState } from './pool-remove-provider'

export const MinimumReceive = () => {
  const {
    percentage,
    lpBalance,
    totalSupplyLP,
    amountToken0PerLP,
    amountToken1PerLP,
  } = useRemoveLiqState()
  const { setLPToRemove, setMinAmountToken0, setMinAmountToken1 } =
    useRemoveLiqDispatch()
  const { token0, token1 } = usePoolState()
  const { data: token0Price, isLoading: isLoadingToken0Price } = useStablePrice(
    { token: token0 },
  )
  const { data: token1Price, isLoading: isLoadingToken1Price } = useStablePrice(
    { token: token1 },
  )
  const [slippageTolerance] = useSlippageTolerance(
    SlippageToleranceStorageKey.RemoveLiquidity,
  )
  const slippage =
    slippageTolerance === 'AUTO' ? 0.005 : Number(slippageTolerance) / 100

  const lpTokenAmountBeingRemoved = useMemo(() => {
    if (!lpBalance) return '0'
    const lpBalanceBN = toBigNumber(lpBalance)
    const percentageBN = toBigNumber(percentage).div(100)
    //will be in wei
    return removeDecimals(lpBalanceBN.times(percentageBN))
  }, [lpBalance, percentage])

  useEffect(() => {
    if (lpTokenAmountBeingRemoved) {
      setLPToRemove(lpTokenAmountBeingRemoved)
    }
  }, [lpTokenAmountBeingRemoved, setLPToRemove])

  const amountToken0 = useMemo(() => {
    if (!lpTokenAmountBeingRemoved || !amountToken0PerLP) return '0'
    const formattedLP = formatUnitsForInput(
      lpTokenAmountBeingRemoved,
      PAIR_DECIMALS,
    )
    const lpTokenAmountBeingRemovedBN = toBigNumber(formattedLP)
    const amountToken0PerLPBN = toBigNumber(amountToken0PerLP)
    return String(lpTokenAmountBeingRemovedBN.times(amountToken0PerLPBN))
  }, [lpTokenAmountBeingRemoved, amountToken0PerLP])

  const amountToken1 = useMemo(() => {
    if (!lpTokenAmountBeingRemoved || !amountToken1PerLP) return '0'
    const formattedLP = formatUnitsForInput(
      lpTokenAmountBeingRemoved,
      PAIR_DECIMALS,
    )
    const lpTokenAmountBeingRemovedBN = toBigNumber(formattedLP)
    const amountToken1PerLPBN = toBigNumber(amountToken1PerLP)
    return String(lpTokenAmountBeingRemovedBN.times(amountToken1PerLPBN))
  }, [lpTokenAmountBeingRemoved, amountToken1PerLP])

  const minAmountToken0 = useMemo(() => {
    if (!amountToken0) return ''
    const output = Number(amountToken0) * (1 - slippage)
    return output.toString()
  }, [amountToken0, slippage])

  useEffect(() => {
    if (minAmountToken0) {
      const parsedAmount = parseUnits(minAmountToken0, token0?.decimals ?? 18)

      setMinAmountToken0(parsedAmount)
    }
  }, [minAmountToken0, setMinAmountToken0, token0?.decimals])

  const minAmountToken1 = useMemo(() => {
    if (!amountToken1) return ''
    const output = Number(amountToken1) * (1 - slippage)
    return output.toString()
  }, [slippageTolerance, amountToken1, slippage])

  useEffect(() => {
    if (minAmountToken1) {
      const parsedAmount = parseUnits(minAmountToken1, token1?.decimals ?? 18)

      setMinAmountToken1(parsedAmount)
    }
  }, [minAmountToken1, setMinAmountToken1, token1?.decimals])

  const isLoading =
    !totalSupplyLP || isLoadingToken0Price || isLoadingToken1Price

  return (
    <Card variant="outline" className="p-6">
      <CardGroup>
        <CardLabel>You&apos;ll receive at least:</CardLabel>
        <LiquidityItem
          isLoading={isLoading}
          token={token0}
          amount={String(parseUnits(minAmountToken0, token0?.decimals ?? 18))}
          usdAmount={String(Number(token0Price) * Number(minAmountToken0))}
        />
        <LiquidityItem
          isLoading={isLoading}
          token={token1}
          amount={String(parseUnits(minAmountToken1, token1?.decimals ?? 18))}
          usdAmount={String(Number(token1Price) * Number(minAmountToken1))}
        />
      </CardGroup>
    </Card>
  )
}
