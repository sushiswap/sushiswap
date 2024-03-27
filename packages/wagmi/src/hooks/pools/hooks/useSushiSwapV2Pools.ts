'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { uniswapV2PairAbi } from 'sushi/abi'
import {
  SUSHISWAP_V2_FACTORY_ADDRESS,
  SushiSwapV2ChainId,
  isSushiSwapV2ChainId,
} from 'sushi/config'
import { Amount, Currency, Token, Type } from 'sushi/currency'
import { SushiSwapV2Pool, computeSushiSwapV2PoolAddress } from 'sushi/pool'
import { Address } from 'viem'
import {
  UseReadContractsParameters,
  useBlockNumber,
  useReadContracts,
} from 'wagmi'

export enum SushiSwapV2PoolState {
  LOADING = 'Loading',
  NOT_EXISTS = 'Not Exists',
  EXISTS = 'Exists',
  INVALID = 'Invalid',
}

type Config = Omit<NonNullable<UseReadContractsParameters>, 'contracts'>

function getSushiSwapV2Pools(
  chainId: SushiSwapV2ChainId | undefined,
  currencies: [Currency | undefined, Currency | undefined][],
) {
  const filtered = currencies.filter(
    (currencies): currencies is [Type, Type] => {
      const [currencyA, currencyB] = currencies
      return Boolean(
        currencyA &&
          currencyB &&
          currencyA.chainId === currencyB.chainId &&
          !currencyA.wrapped.equals(currencyB.wrapped) &&
          isSushiSwapV2ChainId(currencyA.chainId),
      )
    },
  )

  const [tokensA, tokensB] = filtered.reduce<[Token[], Token[]]>(
    (acc, [currencyA, currencyB]) => {
      acc[0].push(currencyA.wrapped)
      acc[1].push(currencyB.wrapped)

      return acc
    },
    [[], []],
  )

  const contracts = filtered.map(([currencyA, currencyB]) => ({
    chainId,
    address: computeSushiSwapV2PoolAddress({
      factoryAddress:
        SUSHISWAP_V2_FACTORY_ADDRESS[currencyA.chainId as SushiSwapV2ChainId],
      tokenA: currencyA.wrapped,
      tokenB: currencyB.wrapped,
    }) as Address,
    abi: uniswapV2PairAbi,
    functionName: 'getReserves' as const,
  }))

  return [tokensA, tokensB, contracts] as const
}

interface UseSushiSwapV2PoolsReturn {
  isLoading: boolean
  isError: boolean
  data: [SushiSwapV2PoolState, SushiSwapV2Pool | null][]
}

export function useSushiSwapV2Pools(
  chainId: SushiSwapV2ChainId | undefined,
  currencies: [Currency | undefined, Currency | undefined][],
  config?: Config,
): UseSushiSwapV2PoolsReturn {
  const [tokensA, tokensB, contracts] = useMemo(
    () => getSushiSwapV2Pools(chainId, currencies),
    [chainId, currencies],
  )
  const queryClient = useQueryClient()

  const { data, isLoading, isError, queryKey } = useReadContracts({
    contracts: contracts,
    query: {
      enabled:
        config?.query?.enabled !== undefined
          ? config?.query?.enabled && contracts.length > 0
          : contracts.length > 0,
      select: (results) => results.map((r) => r.result),
    },
  })

  const { data: blockNumber } = useBlockNumber({ chainId, watch: true })

  useEffect(() => {
    if (blockNumber) {
      queryClient.invalidateQueries(queryKey, {}, { cancelRefetch: false })
    }
  }, [blockNumber, queryClient, queryKey])

  return useMemo(() => {
    if (contracts.length === 0)
      return {
        isLoading,
        isError,
        data: [[SushiSwapV2PoolState.INVALID, null]],
      }
    if (!data)
      return {
        isLoading,
        isError,
        data: contracts.map(() => [SushiSwapV2PoolState.LOADING, null]),
      }

    return {
      isLoading,
      isError,
      data: data.map((result, i) => {
        const [tokenA, tokenB] = [tokensA[i], tokensB[i]]

        if (!tokenA || !tokenB || tokenA.equals(tokenB)) {
          return [SushiSwapV2PoolState.INVALID, null]
        }

        if (!result) return [SushiSwapV2PoolState.NOT_EXISTS, null]

        const [reserve0, reserve1] = result
        const [token0, token1] = tokenA.sortsBefore(tokenB)
          ? [tokenA, tokenB]
          : [tokenB, tokenA]

        return [
          SushiSwapV2PoolState.EXISTS,
          new SushiSwapV2Pool(
            Amount.fromRawAmount(token0, reserve0.toString()),
            Amount.fromRawAmount(token1, reserve1.toString()),
          ),
        ]
      }),
    }
  }, [contracts, data, isError, isLoading, tokensA, tokensB])
}

interface UseSushiSwapV2PoolReturn {
  isLoading: boolean
  isError: boolean
  data: [SushiSwapV2PoolState, SushiSwapV2Pool | null]
}

export function useSushiSwapV2Pool(
  chainId: SushiSwapV2ChainId,
  tokenA?: Currency,
  tokenB?: Currency,
  config?: Config,
): UseSushiSwapV2PoolReturn {
  const inputs: [[Currency | undefined, Currency | undefined]] = useMemo(
    () => [[tokenA, tokenB]],
    [tokenA, tokenB],
  )
  const { data, isLoading, isError } = useSushiSwapV2Pools(
    chainId,
    inputs,
    config,
  )

  return useMemo(
    () => ({
      isLoading,
      isError,
      data: data?.[0],
    }),
    [data, isError, isLoading],
  )
}
