import {
  UseTradeParams,
  UseTradeReturnWriteArgs,
  usePrice,
} from '@sushiswap/react-query'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { slippageAmount } from 'sushi/calculate'
import { ChainId } from 'sushi/chain'
import {
  ROUTE_PROCESSOR_4_ADDRESS,
  isRouteProcessor4ChainId,
  isWNativeSupported,
} from 'sushi/config'
import { Amount, Native, Price } from 'sushi/currency'
import { Fraction, Percent } from 'sushi/math'
import { Router } from 'sushi/router'
import { Address, Hex, zeroAddress } from 'viem'
import { useGasPrice } from 'wagmi'
import { usePoolsCodeMap } from '../pools'

export const useClientTrade = (variables: UseTradeParams) => {
  const {
    chainId,
    fromToken,
    toToken,
    slippagePercentage,
    carbonOffset,
    amount,
    enabled,
    recipient,
    source,
    tokenTax,
  } = variables

  const { data: gasPrice } = useGasPrice({ chainId, query: { enabled } })

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

  const { data: poolsCodeMap } = usePoolsCodeMap({
    chainId,
    currencyA: fromToken,
    currencyB: toToken,
    enabled,
    withBentoPools: true,
  })

  // console.debug('fee data', feeData)

  return useQuery({
    queryKey: [
      'useClientTrade',
      {
        chainId,
        currencyA: fromToken,
        currencyB: toToken,
        amount,
        slippagePercentage,
        recipient,
        poolsCodeMap,
        source,
        tokenTax,
      },
    ],
    queryFn: async () => {
      if (
        !poolsCodeMap ||
        !isRouteProcessor4ChainId(chainId) ||
        !fromToken ||
        !amount ||
        !toToken ||
        !gasPrice
      )
        return {
          abi: undefined,
          address: undefined,
          swapPrice: undefined,
          priceImpact: undefined,
          amountIn: undefined,
          amountOut: undefined,
          minAmountOut: undefined,
          gasSpent: undefined,
          writeArgs: undefined,
          route: undefined,
          functionName: 'processRoute',
          value: undefined,
          tokenTax: undefined,
          gasPrice: undefined,
        }

      const route = Router.findSpecialRoute(
        poolsCodeMap,
        chainId,
        fromToken,
        amount.quotient,
        toToken,
        Number(gasPrice),
        1, // 5% impact before dex aggregation
      )

      //       const logPools = Array.from(poolsCodeMap.values())
      //         .map(
      //           (pc) =>
      //             `* ${pc.liquidityProvider}/${pc.pool.token0.symbol}/${pc.pool.token1.symbol}-${pc.pool.fee}\n`,
      //         )
      //         .join('')
      //       console.debug(`
      // Pools found ${poolsCodeMap.size}:
      // ${logPools}
      // `)

      // const route = Router.findSushiRoute(
      //   poolsCodeMap,
      //   chainId,
      //   fromToken,
      //   BigNumber.from(amount.quotient.toString()),
      //   toToken,
      //   feeData.gasPrice.toNumber()
      // )

      let args = undefined

      if (recipient) {
        if (isRouteProcessor4ChainId(chainId)) {
          // console.debug('routeProcessor4Params')
          args = Router.routeProcessor4Params(
            poolsCodeMap,
            route,
            fromToken,
            toToken,
            recipient,
            ROUTE_PROCESSOR_4_ADDRESS[chainId],
            [],
            +slippagePercentage / 100,
          )
        }
      }

      if (route) {
        const amountIn = Amount.fromRawAmount(
          fromToken,
          route.amountInBI.toString(),
        )
        const amountOut = Amount.fromRawAmount(
          toToken,
          new Fraction(route.amountOutBI).multiply(
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

        // let writeArgs: UseTradeReturnWriteArgs = args
        let writeArgs: UseTradeReturnWriteArgs = args
          ? [
              args.tokenIn as Address,
              args.amountIn,
              args.tokenOut as Address,
              minAmountOut.quotient,
              args.to as Address,
              args.routeCode as Hex,
            ]
          : undefined

        // const overrides = fromToken.isNative && writeArgs?.[1] ? { value: BigNumber.from(writeArgs?.[1]) } : undefined
        let value =
          fromToken.isNative && writeArgs?.[1] ? writeArgs[1] : undefined

        if (writeArgs && isOffset && chainId === ChainId.POLYGON) {
          writeArgs = [
            '0xbc4a6be1285893630d45c881c6c343a65fdbe278',
            20000000000000000n,
            ...writeArgs,
          ]
          value = (fromToken.isNative ? writeArgs[3] : 0n) + 20000000000000000n
        }

        // console.log({ writeArgs })

        return new Promise((res) =>
          setTimeout(
            () =>
              res({
                swapPrice: amountOut.greaterThan(0n)
                  ? new Price({
                      baseAmount: amount,
                      quoteAmount: amountOut,
                    })
                  : undefined,
                priceImpact: route.priceImpact
                  ? new Percent(
                      BigInt(Math.round(route.priceImpact * 10000)),
                      10000n,
                    )
                  : new Percent(0),
                amountIn,
                amountOut,
                minAmountOut,
                gasSpent:
                  price && gasPrice
                    ? Amount.fromRawAmount(
                        Native.onChain(chainId),
                        gasPrice * BigInt(route.gasSpent * 1.2),
                      ).toSignificant(4)
                    : undefined,
                // gasSpentUsd:
                //   price && feeData.gasPrice
                //     ? Amount.fromRawAmount(
                //         Native.onChain(chainId),
                //         JSBI.multiply(JSBI.BigInt(feeData.gasPrice), JSBI.BigInt(route.gasSpent * 1.2))
                //       )
                //         .multiply(price.asFraction)
                //         .toSignificant(4)
                //     : undefined,
                route,
                functionName: isOffset
                  ? 'transferValueAndprocessRoute'
                  : 'processRoute',
                writeArgs,
                value,
                tokenTax,
                gasPrice,
              }),
            250,
          ),
        )
      }
    },
    refetchInterval: 10000,
    enabled: Boolean(
      enabled && poolsCodeMap && gasPrice && fromToken && toToken && chainId,
    ),
  })
}
