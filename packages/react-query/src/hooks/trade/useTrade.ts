import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { slippageAmount } from 'sushi/calculate'
import { ChainId } from 'sushi/chain'
import {
  isRouteProcessor3_1ChainId,
  isRouteProcessor3_2ChainId,
  isRouteProcessor4ChainId,
} from 'sushi/config'
import {
  Amount,
  Native,
  Price,
  type Type,
  WNATIVE_ADDRESS,
} from 'sushi/currency'
import { Percent, ZERO } from 'sushi/math'
import { type Address, type Hex, stringify } from 'viem'
import { usePrice } from '../prices'
import { apiAdapter02To01 } from './apiAdapter'
import type {
  UseTradeParams,
  UseTradeQuerySelect,
  UseTradeReturnWriteArgs,
} from './types'
import { tradeValidator02 } from './validator02'

const API_BASE_URL =
  process.env['API_BASE_URL'] ||
  process.env['NEXT_PUBLIC_API_BASE_URL'] ||
  'https://staging.sushi.com/swap'

function getApiVersion(chainId: ChainId) {
  if (isRouteProcessor4ChainId(chainId)) {
    return '/v4'
  } else if (isRouteProcessor3_2ChainId(chainId)) {
    return '/v3.2'
  } else if (isRouteProcessor3_1ChainId(chainId)) {
    return '/v3.1'
  }
  return ''
}

export const useTradeQuery = (
  {
    chainId,
    fromToken,
    toToken,
    amount,
    gasPrice = 50n,
    slippagePercentage,
    recipient,
    source,
    enabled,
    onError,
  }: UseTradeParams,
  select: UseTradeQuerySelect,
) => {
  return useQuery({
    queryKey: [
      'getTrade',
      {
        chainId,
        fromToken,
        toToken,
        amount,
        slippagePercentage,
        gasPrice,
        recipient,
        source,
      },
    ],
    queryFn: async () => {
      const params = new URL(
        `${API_BASE_URL}/swap${getApiVersion(chainId)}/${chainId}`,
      )
      // params.searchParams.set('chainId', `${chainId}`)
      params.searchParams.set(
        'tokenIn',
        `${
          fromToken?.isNative
            ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
            : fromToken?.wrapped.address
        }`,
      )
      params.searchParams.set(
        'tokenOut',
        `${
          toToken?.isNative
            ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
            : toToken?.wrapped.address
        }`,
      )
      params.searchParams.set('amount', `${amount?.quotient.toString()}`)
      params.searchParams.set('maxPriceImpact', `${+slippagePercentage / 100}`)
      params.searchParams.set('gasPrice', `${gasPrice}`)
      params.searchParams.set('to', `${recipient}`)
      params.searchParams.set('preferSushi', 'true')
      if (source !== undefined) params.searchParams.set('source', `${source}`)

      const res = await fetch(params.toString())
      // const json = deserialize(await res.json()) should cause react query error
      const json = await res.json()
      const resp2 = tradeValidator02.parse(json)
      const resp1 = apiAdapter02To01(
        resp2,
        fromToken as Type,
        toToken as Type,
        recipient,
      )
      return resp1
    },
    refetchOnWindowFocus: true,
    refetchInterval: 2500,
    keepPreviousData: !!amount,
    cacheTime: 0, // the length of time before inactive data gets removed from the cache
    retry: false, // dont retry on failure, immediately fallback
    select,
    enabled:
      enabled && Boolean(chainId && fromToken && toToken && amount && gasPrice),
    onError: (error) => (onError ? onError(error as Error) : undefined),
    queryKeyHashFn: stringify,
  })
}

export const useTrade = (variables: UseTradeParams) => {
  const {
    chainId,
    fromToken,
    toToken,
    amount,
    slippagePercentage,
    carbonOffset,
    gasPrice,
  } = variables
  const { data: price } = usePrice({
    chainId,
    address: WNATIVE_ADDRESS[chainId],
  })

  const select: UseTradeQuerySelect = useCallback(
    (data) => {
      // console.log('data.args', data?.args)
      if (data && amount && data.route && fromToken && toToken) {
        const amountIn = Amount.fromRawAmount(fromToken, data.route.amountInBI)
        const amountOut = Amount.fromRawAmount(toToken, data.route.amountOutBI)
        const isOffset = chainId === ChainId.POLYGON && carbonOffset

        let writeArgs: UseTradeReturnWriteArgs = data?.args
          ? ([
              data.args.tokenIn as Address,
              BigInt(data.args.amountIn),
              data.args.tokenOut as Address,
              data.args.amountOutMin,
              data.args.to as Address,
              data.args.routeCode as Hex,
            ] as const)
          : undefined
        let value = fromToken.isNative ? writeArgs?.[1] ?? undefined : undefined

        // console.debug(fromToken.isNative, writeArgs, value)

        if (writeArgs && isOffset && chainId === ChainId.POLYGON) {
          writeArgs = [
            '0xbc4a6be1285893630d45c881c6c343a65fdbe278',
            20000000000000000n,
            ...writeArgs,
          ]
          value = (fromToken.isNative ? writeArgs[3] : 0n) + 20000000000000000n
        }

        const gasSpent = gasPrice
          ? Amount.fromRawAmount(
              Native.onChain(chainId),
              gasPrice * BigInt(data.route.gasSpent * 1.2),
            )
          : undefined

        return {
          swapPrice: amountOut.greaterThan(ZERO)
            ? new Price({
                baseAmount: amount,
                quoteAmount: amountOut,
              })
            : undefined,
          priceImpact: data.route.priceImpact
            ? new Percent(Math.round(data.route.priceImpact * 10000), 10000)
            : new Percent(0),
          amountIn,
          amountOut,
          minAmountOut: Amount.fromRawAmount(
            toToken,
            slippageAmount(
              amountOut,
              new Percent(Math.floor(+slippagePercentage * 100), 10_000),
            )[0],
          ),
          gasSpent: gasSpent?.toSignificant(4),
          gasSpentUsd:
            price && gasSpent
              ? gasSpent.multiply(price.asFraction).toSignificant(4)
              : undefined,
          route: data.route,
          functionName: isOffset
            ? 'transferValueAndprocessRoute'
            : 'processRoute',
          writeArgs,
          value,
        }
      }

      return {
        swapPrice: undefined,
        priceImpact: undefined,
        amountIn: undefined,
        amountOut: undefined,
        minAmountOut: undefined,
        gasSpent: undefined,
        gasSpentUsd: undefined,
        writeArgs: undefined,
        route: undefined,
        functionName: 'processRoute',
        value: undefined,
      }
    },
    [
      carbonOffset,
      amount,
      chainId,
      fromToken,
      price,
      slippagePercentage,
      toToken,
      gasPrice,
    ],
  )

  return useTradeQuery(variables, select)
}
