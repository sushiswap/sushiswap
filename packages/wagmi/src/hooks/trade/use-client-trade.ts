import {
  UseTradeParams,
  UseTradeReturnWriteArgs,
  usePrice,
} from '@sushiswap/react-query'
import { useQuery } from '@tanstack/react-query'
import { slippageAmount } from 'sushi/calculate'
import { ChainId } from 'sushi/chain'
import {
  ROUTE_PROCESSOR_3_1_ADDRESS,
  ROUTE_PROCESSOR_3_2_ADDRESS,
  ROUTE_PROCESSOR_3_ADDRESS,
  ROUTE_PROCESSOR_4_ADDRESS,
  ROUTE_PROCESSOR_ADDRESS,
  isRouteProcessor3ChainId,
  isRouteProcessor3_1ChainId,
  isRouteProcessor3_2ChainId,
  isRouteProcessor4ChainId,
  isRouteProcessorChainId,
} from 'sushi/config'
import { Amount, Native, Price, WNATIVE_ADDRESS } from 'sushi/currency'
import { Percent } from 'sushi/math'
import { Router } from 'sushi/router'
import { Address, Hex } from 'viem'
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
  } = variables

  const { data: gasPrice } = useGasPrice({ chainId, query: { enabled } })

  const { data: price } = usePrice({
    chainId,
    address: WNATIVE_ADDRESS[chainId],
  })
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
      },
    ],
    queryFn: async () => {
      if (
        !poolsCodeMap ||
        (!isRouteProcessorChainId(chainId) &&
          !isRouteProcessor3ChainId(chainId) &&
          !isRouteProcessor3_1ChainId(chainId) &&
          !isRouteProcessor3_2ChainId(chainId) &&
          !isRouteProcessor4ChainId(chainId)) ||
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

      const logPools = Array.from(poolsCodeMap.values())
        .map(
          (pc) =>
            `* ${pc.liquidityProvider}/${pc.pool.token0.symbol}/${pc.pool.token1.symbol}-${pc.pool.fee}\n`,
        )
        .join('')
      console.debug(`
Pools found ${poolsCodeMap.size}: 
${logPools}
`)

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
        } else if (isRouteProcessor3_2ChainId(chainId)) {
          // console.debug('routeProcessor3_2Params')
          args = Router.routeProcessor3_2Params(
            poolsCodeMap,
            route,
            fromToken,
            toToken,
            recipient,
            ROUTE_PROCESSOR_3_2_ADDRESS[chainId],
            [],
            +slippagePercentage / 100,
          )
        } else if (isRouteProcessor3_1ChainId(chainId)) {
          // console.debug('routeProcessor3_1Params')
          args = Router.routeProcessor3_1Params(
            poolsCodeMap,
            route,
            fromToken,
            toToken,
            recipient,
            ROUTE_PROCESSOR_3_1_ADDRESS[chainId],
            [],
            +slippagePercentage / 100,
          )
        } else if (isRouteProcessor3ChainId(chainId)) {
          // console.debug('routeProcessor3Params')
          args = Router.routeProcessor3Params(
            poolsCodeMap,
            route,
            fromToken,
            toToken,
            recipient,
            ROUTE_PROCESSOR_3_ADDRESS[chainId],
            [],
            +slippagePercentage / 100,
            source,
          )
        } else if (isRouteProcessorChainId(chainId)) {
          console.debug('routeProcessorParams')
          args = Router.routeProcessorParams(
            poolsCodeMap,
            route,
            fromToken,
            toToken,
            recipient,
            ROUTE_PROCESSOR_ADDRESS[chainId],
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
          route.amountOutBI.toString(),
        )
        const isOffset = chainId === ChainId.POLYGON && carbonOffset

        // let writeArgs: UseTradeReturnWriteArgs = args
        let writeArgs: UseTradeReturnWriteArgs = args
          ? [
              args.tokenIn as Address,
              args.amountIn,
              args.tokenOut as Address,
              args.amountOutMin,
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

        console.log({ writeArgs })

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
                minAmountOut:
                  typeof writeArgs?.[3] === 'bigint'
                    ? Amount.fromRawAmount(toToken, writeArgs[3])
                    : Amount.fromRawAmount(
                        toToken,
                        slippageAmount(
                          amountOut,
                          new Percent(Math.floor(0.5 * 100), 10_000),
                        )[0],
                      ),
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
