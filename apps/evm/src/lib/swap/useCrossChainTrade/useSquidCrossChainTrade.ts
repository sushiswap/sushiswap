import { UseTradeReturn, useTrade as useApiTrade } from '@sushiswap/react-query'
import { useAccount, useGasPrice } from '@sushiswap/wagmi'
import { useQuery } from '@tanstack/react-query'
import { log } from 'next-axiom'
import { useMemo } from 'react'
import { squidRouterAbi } from 'sushi/abi'
import {
  SQUID_ADAPTER_ADDRESS,
  SQUID_ROUTER_ADDRESS,
  SquidAdapterChainId,
  isSquidAdapterChainId,
} from 'sushi/config'
import { Amount, Native, Token, Type, axlUSDC } from 'sushi/currency'
import { Percent, ZERO_PERCENT } from 'sushi/math'
import { RouterLiquiditySource } from 'sushi/router'
import { RToken } from 'sushi/tines'
import { encodeFunctionData, stringify } from 'viem'
import {
  TransactionType,
  decodeSquidRouterCallData,
  encodeSquidBridgeParams,
  encodeSwapData,
  getBridgeParams,
  getSquidRouteRequest,
  isSquidRouteProcessorEnabled,
} from './SushiXSwap2'
import { UseCrossChainTradeParams, UseCrossChainTradeReturn } from './types'
import { useSquidRoute } from './useSquidRoute'

export const useSquidCrossChainTrade = ({
  network0,
  network1,
  token0,
  token1,
  amount,
  slippagePercentage,
  recipient,
  enabled,
  tradeId,
}: Omit<UseCrossChainTradeParams, 'network0' | 'network1'> & {
  network0: SquidAdapterChainId
  network1: SquidAdapterChainId
}) => {
  const { data: gasPrice0 } = useGasPrice({
    chainId: network0,
    query: { enabled },
  })
  const { data: gasPrice1 } = useGasPrice({
    chainId: network1,
    query: { enabled },
  })

  const { address } = useAccount()

  const { bridgePath, isSrcSwap, isDstSwap } = useMemo(() => {
    const bridgePath =
      isSquidAdapterChainId(network0) && isSquidAdapterChainId(network1)
        ? {
            srcBridgeToken: axlUSDC[network0],
            dstBridgeToken: axlUSDC[network1],
          }
        : undefined

    const isSrcSwap = Boolean(
      token0 &&
        bridgePath?.srcBridgeToken &&
        !token0.equals(bridgePath.srcBridgeToken),
    )

    const isDstSwap = Boolean(
      token1 &&
        bridgePath?.dstBridgeToken &&
        !token1.equals(bridgePath.dstBridgeToken),
    )

    return {
      bridgePath,
      isSrcSwap,
      isDstSwap,
    }
  }, [network0, network1, token0, token1])

  const { data: srcTrade } = useApiTrade({
    chainId: network0,
    fromToken: token0,
    toToken: bridgePath?.srcBridgeToken,
    amount,
    slippagePercentage,
    gasPrice: gasPrice0,
    recipient: SQUID_ROUTER_ADDRESS[network0],
    enabled:
      enabled &&
      isSrcSwap &&
      isSquidRouteProcessorEnabled[network0] &&
      Boolean(amount),
    carbonOffset: false,
    source: RouterLiquiditySource.XSwap,
    onError: () => {
      log.error('xswap src swap api error')
    },
  })

  const { data: dstTrade } = useApiTrade({
    chainId: network1,
    amount: isSrcSwap ? srcTrade?.minAmountOut : amount,
    fromToken: bridgePath?.dstBridgeToken,
    toToken: token1,
    slippagePercentage,
    gasPrice: gasPrice1,
    recipient,
    enabled:
      enabled &&
      isDstSwap &&
      isSquidRouteProcessorEnabled[network1] &&
      Boolean(isSrcSwap ? srcTrade?.minAmountOut : amount),
    carbonOffset: false,
    source: RouterLiquiditySource.XSwap,
    onError: () => {
      log.error('xswap dst swap api error')
    },
  })

  const squidRouteRequest = useMemo(
    () =>
      enabled
        ? getSquidRouteRequest({
            token0,
            token1,
            amount,
            fromAddress: address,
            toAddress: recipient,
            bridgePath,
            slippagePercentage,
            isSrcSwap,
            isDstSwap,
            srcTrade,
            dstTrade,
          })
        : undefined,
    [
      enabled,
      token0,
      token1,
      amount,
      address,
      recipient,
      bridgePath,
      slippagePercentage,
      isSrcSwap,
      isDstSwap,
      srcTrade,
      dstTrade,
    ],
  )

  const { data: squidRoute, error: squidError } = useSquidRoute(
    squidRouteRequest,
    enabled,
  )

  return useQuery({
    queryKey: [
      'squidCrossChainTrade',
      {
        tradeId,
        token0,
        token1,
        network0,
        network1,
        amount,
        slippagePercentage,
        recipient,
        srcTrade,
        dstTrade,
        bridgePath,
        squidRoute,
        squidError,
      },
    ],
    queryFn: async () => {
      if (squidError || !bridgePath) {
        return {
          amountIn: amount,
          route: {
            status: 'NoWay',
          },
        } as UseCrossChainTradeReturn
      }

      if (
        !(
          squidRoute &&
          token0 &&
          token1 &&
          amount &&
          bridgePath &&
          gasPrice0 &&
          gasPrice1
        )
      ) {
        throw new Error('useCrossChainTrade should not be enabled')
      }

      const { srcBridgeToken, dstBridgeToken } = bridgePath

      const dstAmountOut =
        isDstSwap && dstTrade?.amountOut
          ? dstTrade.amountOut
          : Amount.fromRawAmount(token1, squidRoute.estimate.toAmount)

      const dstAmountOutMin =
        isDstSwap && dstTrade?.minAmountOut
          ? dstTrade.minAmountOut
          : Amount.fromRawAmount(token1, squidRoute.estimate.toAmountMin)

      let priceImpact = ZERO_PERCENT
      if (isSrcSwap && srcTrade?.priceImpact)
        priceImpact = priceImpact.add(srcTrade.priceImpact)
      if (isDstSwap && dstTrade?.priceImpact)
        priceImpact = priceImpact.add(dstTrade.priceImpact)

      priceImpact = priceImpact.add(
        new Percent(
          Math.round(Number(squidRoute.estimate.aggregatePriceImpact) * 100),
          10000,
        ),
      )

      if (!recipient) {
        return {
          priceImpact,
          amountIn: amount,
          amountOut: dstAmountOut,
          minAmountOut: dstAmountOutMin,
        } as UseCrossChainTradeReturn
      }

      let writeArgs
      let functionName
      const transactionType =
        !isSrcSwap && !isDstSwap
          ? TransactionType.Bridge
          : isSrcSwap && !isDstSwap
            ? TransactionType.SwapAndBridge
            : !isSrcSwap && isDstSwap
              ? TransactionType.BridgeAndSwap
              : TransactionType.CrossChainSwap

      if (isSrcSwap && srcTrade?.writeArgs) {
        const srcSwapData = encodeSwapData(
          srcTrade.writeArgs as Parameters<typeof encodeSwapData>[0],
        )

        const squidCallData = decodeSquidRouterCallData(
          squidRoute.transactionRequest?.data as `0x${string}`,
        )

        const squidCallArgs =
          squidCallData.args && squidCallData.args.length > 1
            ? [squidCallData.args[0], 0, ...squidCallData.args.slice(2)]
            : undefined

        functionName = 'swapAndBridge'
        writeArgs = [
          getBridgeParams({
            adapter: SQUID_ADAPTER_ADDRESS[network0],
            amountIn: amount,
            to: recipient,
            adapterData: encodeSquidBridgeParams({
              srcBridgeToken,
              callData: encodeFunctionData({
                abi: squidRouterAbi,
                functionName: squidCallData.functionName,
                args: squidCallArgs,
              }),
            }),
          }),
          recipient, // refundAddress
          srcSwapData, // srcSwapData
          '0x', // dstSwapData
          '0x', // dstPayloadData
        ]
      } else {
        functionName = 'bridge'
        writeArgs = [
          getBridgeParams({
            adapter: SQUID_ADAPTER_ADDRESS[network0],
            amountIn: amount,
            to: recipient,
            adapterData: encodeSquidBridgeParams({
              srcBridgeToken,
              callData: squidRoute.transactionRequest?.data as `0x${string}`,
            }),
          }),
          recipient, // refundAddress
          '0x', // dstSwapData
          '0x', // dstPayloadData
        ]
      }

      // Add 10 % buffer
      const bridgeFeeAmount =
        (squidRoute.estimate.feeCosts.reduce(
          (accumulator, current) => accumulator + BigInt(current.amount),
          0n,
        ) *
          11n) /
        10n

      const bridgeFee = Amount.fromRawAmount(
        Native.onChain(network0),
        bridgeFeeAmount,
      )

      const value = amount.currency.isNative
        ? BigInt(amount.quotient) + BigInt(bridgeFeeAmount)
        : BigInt(bridgeFeeAmount)

      const srcGasEstimate =
        BigInt(squidRoute.transactionRequest?.gasLimit ?? 0) +
        BigInt(srcTrade?.route?.gasSpent ?? 0)

      const srcGasFee = Amount.fromRawAmount(
        Native.onChain(network0),
        srcGasEstimate * gasPrice0,
      )

      const gasSpent = srcGasFee.add(bridgeFee)

      return {
        transactionType,
        srcTrade: isSrcSwap
          ? srcTrade ??
            ({
              route: {
                legs: [
                  {
                    poolName: 'Squid',
                    tokenFrom: tokenToRToken(token0),
                    tokenTo: tokenToRToken(srcBridgeToken),
                    absolutePortion: 1,
                  },
                ],
              },
            } as UseTradeReturn)
          : undefined,
        dstTrade: isDstSwap
          ? dstTrade ??
            ({
              route: {
                legs: [
                  {
                    poolName: 'Squid',
                    tokenFrom: tokenToRToken(dstBridgeToken),
                    tokenTo: tokenToRToken(token1),
                    absolutePortion: 1,
                  },
                ],
              },
            } as UseTradeReturn)
          : undefined,
        srcBridgeToken,
        dstBridgeToken,
        priceImpact,
        amountIn: amount,
        amountOut: dstAmountOut,
        minAmountOut: dstAmountOutMin,
        gasSpent: gasSpent.toFixed(6),
        bridgeFee: bridgeFee.toFixed(6),
        srcGasFee: srcGasFee.toFixed(6),
        writeArgs,
        route: {
          status: '',
        },
        functionName,
        value,
      }
    },
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
    keepPreviousData: false,
    cacheTime: 0,
    enabled:
      enabled &&
      Boolean(
        token0 && token1 && amount && (squidRoute || squidError || !bridgePath),
      ),
    queryKeyHashFn: stringify,
  })
}

function tokenToRToken(t: Type): RToken {
  if (t instanceof Token) return t as RToken
  const nativeRToken: RToken = {
    address: '',
    name: t.name,
    symbol: t.symbol,
    chainId: t.chainId,
    decimals: 18,
  }
  return nativeRToken
}
