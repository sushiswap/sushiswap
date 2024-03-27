import { useQuery } from '@tanstack/react-query'
import { ChainId } from 'sushi/chain'
import {
  SUSHISWAP_V2_FACTORY_ADDRESS,
  TRIDENT_CONSTANT_POOL_FACTORY_ADDRESS,
  TRIDENT_STABLE_POOL_FACTORY_ADDRESS,
  isSushiSwapV2ChainId,
  isTridentChainId,
} from 'sushi/config'
import { Token } from 'sushi/currency'
import { Fee } from 'sushi/dex'
import {
  SushiSwapV2Pool,
  TridentConstantPool,
  TridentStablePool,
  computeSushiSwapV2PoolAddress,
  computeTridentConstantPoolAddress,
  computeTridentStablePoolAddress,
} from 'sushi/pool'

import { useConfig } from 'wagmi'
import { getAllPools } from '../actions'
import { PoolType, UsePoolsParams } from '../types'

const getPoolAddress = ({
  chainId,
  poolType,
  token0,
  token1,
  fee,
}: {
  chainId: ChainId
  poolType: PoolType
  token0: Token
  token1: Token
  fee: Fee
}) => {
  const [tokenA, tokenB] = token0.wrapped.sortsBefore(token1.wrapped)
    ? [token0.wrapped, token1.wrapped]
    : [token1.wrapped, token0.wrapped]
  if (poolType === PoolType.TridentStablePool && isTridentChainId(chainId))
    return computeTridentStablePoolAddress({
      factoryAddress: TRIDENT_STABLE_POOL_FACTORY_ADDRESS[chainId],
      tokenA,
      tokenB,
      fee,
    })

  if (poolType === PoolType.TridentConstantPool && isTridentChainId(chainId))
    return computeTridentConstantPoolAddress({
      factoryAddress: TRIDENT_CONSTANT_POOL_FACTORY_ADDRESS[chainId],
      tokenA,
      tokenB,
      fee,
      twap: false,
    })

  if (poolType === PoolType.SushiSwapV2Pool && isSushiSwapV2ChainId(chainId)) {
    return computeSushiSwapV2PoolAddress({
      factoryAddress: SUSHISWAP_V2_FACTORY_ADDRESS[chainId],
      tokenA,
      tokenB,
    })
  }

  return undefined
}

interface UsePoolsAsMapParams extends UsePoolsParams {
  poolType: PoolType
  fee: Fee
}
export const usePoolsAsMap = ({
  enabled = true,
  ...variables
}: UsePoolsAsMapParams) => {
  const { chainId, currencyA, currencyB } = variables

  const config = useConfig()

  return useQuery({
    queryKey: ['usePoolsAsMap', { chainId, currencyA, currencyB }],
    queryFn: async () => {
      const data = await getAllPools({
        ...variables,
        asMap: true,
        withCombinations: false,
        withBentoPools: false,
        config,
      })
      const pools = [
        ...(data.sushiSwapV2Pools || []),
        ...(data.tridentStablePools || []),
        ...(data.tridentConstantPools || []),
      ]
      return pools.reduce<
        Record<
          string,
          SushiSwapV2Pool | TridentConstantPool | TridentStablePool
        >
      >((acc, cur) => {
        acc[cur.liquidityToken.address] = cur
        return acc
      }, {})
    },
    select: (data) => {
      const computeCurrentPairAddress =
        variables.currencyA && variables.currencyB
          ? getPoolAddress({
              chainId: variables.chainId,
              poolType: variables.poolType,
              token0: variables.currencyA?.wrapped,
              token1: variables.currencyB?.wrapped,
              fee: variables.fee,
            })
          : undefined

      return {
        pool: computeCurrentPairAddress
          ? data[computeCurrentPairAddress]
          : undefined,
        map: data,
      }
    },
    refetchInterval: 10000,
    enabled,
  })
}
