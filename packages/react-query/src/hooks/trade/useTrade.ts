import {
  SwapEventName,
  sendAnalyticsEvent,
  useTrace,
} from '@sushiswap/telemetry'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { slippageAmount } from 'sushi/calculate'
import { ChainId } from 'sushi/chain'
import { isRouteProcessor4ChainId, isWNativeSupported } from 'sushi/config'
import { Amount, Native, Price, type Type } from 'sushi/currency'
import { Fraction, Percent, ZERO } from 'sushi/math'
import { type Address, type Hex, stringify, zeroAddress } from 'viem'
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
  const trace = useTrace()
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

      sendAnalyticsEvent(SwapEventName.SWAP_QUOTE_RECEIVED, {
        route: stringify(resp1.route),
        ...trace,
      })

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
    tokenTax,
  } = variables
  const { data: _price } = usePrice({
    chainId,
    address: Native.onChain(chainId).wrapped.address,
    enabled: isWNativeSupported(chainId),
  })

  const price = useMemo(() => {
    return Native.onChain(chainId).wrapped.address === zeroAddress
      ? new Fraction(0)
      : _price
  }, [_price, chainId])

  const select: UseTradeQuerySelect = useCallback(
    (data) => {
      // console.log('data.args', data?.args)
      if (data && amount && data.route && fromToken && toToken) {
        const amountIn = Amount.fromRawAmount(fromToken, data.route.amountInBI)
        const amountOut = Amount.fromRawAmount(
          toToken,
          new Fraction(data.route.amountOutBI).multiply(
            tokenTax ? new Percent(1).subtract(tokenTax) : 1,
          ).quotient,
        )
        const minAmountOut = Amount.fromRawAmount(
          toToken,
          slippageAmount(
            amountOut,
            new Percent(Math.floor(+slippagePercentage * 100), 10_000),
          )[0],
        )
        const isOffset = chainId === ChainId.POLYGON && carbonOffset

        let writeArgs: UseTradeReturnWriteArgs = data?.args
          ? ([
              data.args.tokenIn as Address,
              BigInt(data.args.amountIn),
              data.args.tokenOut as Address,
              minAmountOut.quotient,
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
          minAmountOut,
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
          tokenTax,
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
        tokenTax: undefined,
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
      tokenTax,
    ],
  )

  return useTradeQuery(variables, select)
}
