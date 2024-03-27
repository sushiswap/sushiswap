'use client'

import { useReadContracts } from '@sushiswap/wagmi'
import {
  getV3FactoryContractConfig,
  getV3TickLensContractConfig,
  useConcentratedLiquidityPool,
} from '@sushiswap/wagmi'
import { useMemo } from 'react'
import {
  SushiSwapV3ChainId,
  SushiSwapV3FeeAmount,
  TICK_SPACINGS,
} from 'sushi/config'
import { Type } from 'sushi/currency'
import { computeSushiSwapV3PoolAddress, nearestUsableTick } from 'sushi/pool'
import { Address } from 'viem'
import { Writeable } from 'zod'

interface useTicksProps {
  token0: Type | undefined
  token1: Type | undefined
  chainId: SushiSwapV3ChainId
  feeAmount: SushiSwapV3FeeAmount | undefined
  numSurroundingTicks?: number | undefined
  enabled?: boolean | undefined
}

const bitmapIndex = (tick: number, tickSpacing: number) => {
  return Math.floor(tick / tickSpacing / 256)
}

export function useTicks({
  token0,
  token1,
  chainId,
  feeAmount,
  numSurroundingTicks: _numSurroundingTicks,
  enabled,
}: useTicksProps) {
  const numSurroundingTicks = _numSurroundingTicks ?? 1250

  const { data: pool } = useConcentratedLiquidityPool({
    token0,
    token1,
    chainId,
    feeAmount,
    enabled,
  })

  const tickSpacing = feeAmount && TICK_SPACINGS[feeAmount]
  const activeTick =
    typeof pool?.tickCurrent === 'number' && tickSpacing
      ? nearestUsableTick(pool?.tickCurrent, tickSpacing)
      : undefined
  const poolAddress = useMemo(
    () =>
      token0 && token1 && feeAmount && chainId
        ? computeSushiSwapV3PoolAddress({
            factoryAddress: getV3FactoryContractConfig(chainId).address,
            tokenA: token0.wrapped,
            tokenB: token1.wrapped,
            fee: feeAmount,
          })
        : undefined,
    [chainId, feeAmount, token0, token1],
  )

  const minIndex = useMemo(
    () =>
      tickSpacing !== undefined && activeTick !== undefined
        ? bitmapIndex(
            activeTick - numSurroundingTicks * tickSpacing,
            tickSpacing,
          )
        : undefined,
    [tickSpacing, activeTick, numSurroundingTicks],
  )
  const maxIndex = useMemo(
    () =>
      tickSpacing !== undefined && activeTick !== undefined
        ? bitmapIndex(
            activeTick + numSurroundingTicks * tickSpacing,
            tickSpacing,
          )
        : undefined,
    [tickSpacing, activeTick, numSurroundingTicks],
  )

  const contractReads = useMemo(() => {
    const reads = []
    if (
      typeof minIndex === 'number' &&
      typeof maxIndex === 'number' &&
      typeof poolAddress === 'string'
    ) {
      for (let i = minIndex; i <= maxIndex; i++) {
        reads.push({
          ...getV3TickLensContractConfig(chainId),
          chainId,
          functionName: 'getPopulatedTicksInWord',
          args: [poolAddress as Address, i],
        } as const)
      }
    }
    return reads
  }, [chainId, maxIndex, minIndex, poolAddress])

  const reads = useReadContracts({
    contracts: contractReads,
    allowFailure: false,
    query: {
      enabled: true,
    },
  })

  return useMemo(() => {
    const { data } = reads

    const reduced = data?.reduce((ticks, word) => {
      return ticks.concat(word)
    }, [])
    const renamed = (reduced as Writeable<typeof reduced>)?.map((tick) => ({
      tickIdx: tick.tick,
      liquidityNet: tick.liquidityNet,
    }))
    const sorted = renamed?.sort((a, b) => a.tickIdx - b.tickIdx)

    return {
      ...reads,
      data: sorted,
    }
  }, [reads])
}
