import { useTrade as useApiTrade } from '@sushiswap/react-query'
import { useGasPrice, usePublicClient } from '@sushiswap/wagmi'
import { useQuery } from '@tanstack/react-query'
import { log } from 'next-axiom'
import { useMemo } from 'react'
import { stargateAdapterAbi } from 'sushi/abi'
import {
  STARGATE_ADAPTER_ADDRESS,
  STARGATE_CHAIN_ID,
  StargateChainId,
} from 'sushi/config'
import { Amount, Currency, Native } from 'sushi/currency'
import { Fraction, ONE, Percent, ZERO } from 'sushi/math'
import { RouterLiquiditySource } from 'sushi/router'
import {
  encodeAbiParameters,
  parseAbiParameters,
  parseUnits,
  stringify,
} from 'viem'
import {
  STARGATE_DEFAULT_SLIPPAGE,
  TransactionType,
  encodeStargateTeleportParams,
  encodeSwapData,
  estimateStargateDstGas,
  getBridgeParams,
  getStargateBridgePath,
} from './SushiXSwap2'
import { UseCrossChainTradeParams, UseCrossChainTradeReturn } from './types'
import { useStargateBridgeFees } from './useStargateBridgeFees'

export const useCrossChainTrade = ({
  network0,
  network1,
  token0,
  token1,
  amount,
  slippagePercentage,
  recipient,
  enabled,
  tradeId,
}: UseCrossChainTradeParams) => {
  const client = usePublicClient({ chainId: network0 })

  const { data: gasPrice0 } = useGasPrice({
    chainId: network0,
    query: { enabled },
  })
  const { data: gasPrice1 } = useGasPrice({
    chainId: network1,
    query: { enabled },
  })

  const bridgePath = useMemo(
    () =>
      !enabled || !token0 || !token1
        ? undefined
        : getStargateBridgePath(token0, token1),
    [enabled, token0, token1],
  )

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

  const { data: srcTrade } = useApiTrade({
    chainId: network0,
    fromToken: token0,
    toToken: bridgePath?.srcBridgeToken,
    amount,
    slippagePercentage,
    gasPrice: gasPrice0,
    recipient: STARGATE_ADAPTER_ADDRESS[network0],
    enabled: Boolean(isSrcSwap && enabled && amount),
    carbonOffset: false,
    source: RouterLiquiditySource.XSwap,
    onError: () => {
      log.error('xswap src swap api error')
    },
  })

  const { data: bridgeFees } = useStargateBridgeFees({
    amount: isSrcSwap ? srcTrade?.amountOut : amount,
    srcChainId: network0,
    dstChainId: network1,
    srcBridgeToken: bridgePath?.srcBridgeToken,
    dstBridgeToken: bridgePath?.dstBridgeToken,
    enabled: Boolean(bridgePath && enabled),
  })

  const {
    srcAmountOut,
    srcAmountOutMin,
    dstAmountIn,
    dstAmountInMin,
    bridgeImpact,
  } = useMemo(() => {
    if (
      !amount ||
      !bridgeFees ||
      !bridgePath ||
      (isSrcSwap && (!srcTrade?.amountOut || !srcTrade?.minAmountOut))
    )
      return {
        srcAmountOut: undefined,
        srcAmountOutMin: undefined,
        dstAmountIn: undefined,
        dstAmountInMin: undefined,
        bridgeImpact: undefined,
      }

    const [eqFee, eqReward, lpFee, protocolFee] = bridgeFees

    const bridgeFee = eqFee.subtract(eqReward).add(lpFee).add(protocolFee)

    const srcAmountOut = (
      isSrcSwap ? (srcTrade?.minAmountOut as Amount<Currency>) : amount
    ).subtract(bridgeFee)

    const srcAmountOutMin = srcAmountOut.multiply(
      new Fraction(ONE).add(STARGATE_DEFAULT_SLIPPAGE).invert(),
    )

    const dstAmountIn = Amount.fromRawAmount(
      bridgePath.dstBridgeToken,
      parseUnits(srcAmountOut.toExact(), bridgePath.dstBridgeToken.decimals),
    )

    const dstAmountInMin = Amount.fromRawAmount(
      bridgePath.dstBridgeToken,
      parseUnits(srcAmountOutMin.toExact(), bridgePath.dstBridgeToken.decimals),
    )

    const bridgeImpact = new Percent(
      bridgeFee.quotient,
      (isSrcSwap ? (srcTrade?.minAmountOut as Amount<Currency>) : amount)
        .quotient,
    )

    return {
      srcAmountOut,
      srcAmountOutMin,
      dstAmountIn,
      dstAmountInMin,
      bridgeImpact,
    }
  }, [
    bridgeFees,
    bridgePath,
    isSrcSwap,
    srcTrade?.minAmountOut,
    srcTrade?.amountOut,
    amount,
  ])

  const { data: dstTrade } = useApiTrade({
    chainId: network1,
    amount: dstAmountIn,
    fromToken: bridgePath?.dstBridgeToken,
    toToken: token1,
    slippagePercentage,
    gasPrice: gasPrice1,
    recipient,
    enabled: Boolean(isDstSwap && enabled && dstAmountIn),
    carbonOffset: false,
    source: RouterLiquiditySource.XSwap,
    onError: () => {
      log.error('xswap dst swap api error')
    },
  })

  return useQuery({
    queryKey: [
      'crossChainTrade',
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
        client,
      },
    ],
    queryFn: async (): Promise<UseCrossChainTradeReturn> => {
      if (
        !(
          token0 &&
          token1 &&
          amount &&
          bridgePath &&
          bridgeFees &&
          bridgeImpact &&
          dstAmountIn &&
          gasPrice0 &&
          gasPrice1
        )
      ) {
        throw new Error('useCrossChainTrade should not be enabled')
      }

      const { srcBridgeToken, dstBridgeToken } = bridgePath

      const dstAmountOut = isDstSwap ? dstTrade?.amountOut : dstAmountIn

      const dstAmountOutMin = isDstSwap
        ? dstTrade?.minAmountOut
        : dstAmountInMin

      let priceImpact = bridgeImpact
      if (isSrcSwap) priceImpact = priceImpact.add(srcTrade?.priceImpact ?? 0)
      if (isDstSwap) priceImpact = priceImpact.add(dstTrade?.priceImpact ?? 0)

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
      let dstPayload
      let dstGasEst = ZERO
      let transactionType

      if (!isSrcSwap && !isDstSwap) {
        transactionType = TransactionType.Bridge
        functionName = 'bridge'
        writeArgs = [
          getBridgeParams({
            adapter: STARGATE_ADAPTER_ADDRESS[network0],
            amountIn: amount,
            to: recipient,
            adapterData: encodeStargateTeleportParams({
              srcBridgeToken,
              dstBridgeToken,
              amount: amount.quotient,
              amountMin: srcAmountOutMin.quotient,
              dustAmount: 0,
              receiver: recipient, // receivier is recipient because no dstPayload
              to: recipient,
              dstGas: dstGasEst,
            }),
          }),
          recipient, // refundAddress
          '0x', // swapPayload
          '0x', // payloadData
        ]
      } else if (isSrcSwap && !isDstSwap && srcTrade?.writeArgs) {
        const srcSwapData = encodeSwapData(
          srcTrade.writeArgs as Parameters<typeof encodeSwapData>[0],
        )

        transactionType = TransactionType.SwapAndBridge
        functionName = 'swapAndBridge'
        writeArgs = [
          getBridgeParams({
            adapter: STARGATE_ADAPTER_ADDRESS[network0],
            amountIn: amount,
            to: recipient,
            adapterData: encodeStargateTeleportParams({
              srcBridgeToken,
              dstBridgeToken,
              amount: 0,
              amountMin: srcAmountOutMin.quotient,
              dustAmount: 0,
              receiver: recipient, // receivier is recipient because no dstPayload
              to: recipient,
              dstGas: dstGasEst,
            }),
          }),
          recipient, // refundAddress
          srcSwapData,
          '0x',
          '0x',
        ]
      } else if (!isSrcSwap && isDstSwap && dstTrade?.writeArgs) {
        const dstSwapData = encodeSwapData(
          dstTrade.writeArgs as Parameters<typeof encodeSwapData>[0],
        )

        dstGasEst = estimateStargateDstGas(dstTrade.route?.gasSpent ?? 0)

        dstPayload = encodeAbiParameters(
          parseAbiParameters('address, bytes, bytes'),
          [
            recipient,
            dstSwapData,
            '0x', // payloadData
          ],
        )

        transactionType = TransactionType.BridgeAndSwap
        functionName = 'bridge'
        writeArgs = [
          getBridgeParams({
            adapter: STARGATE_ADAPTER_ADDRESS[network0],
            amountIn: amount,
            to: recipient,
            adapterData: encodeStargateTeleportParams({
              srcBridgeToken,
              dstBridgeToken,
              amount: amount.quotient,
              amountMin: srcAmountOutMin.quotient,
              dustAmount: 0,
              receiver: STARGATE_ADAPTER_ADDRESS[network1],
              to: recipient,
              dstGas: dstGasEst,
            }),
          }),
          recipient, // refundAddress
          dstSwapData,
          '0x', // dstPayload
        ]
      } else if (
        isSrcSwap &&
        isDstSwap &&
        srcTrade?.writeArgs &&
        dstTrade?.writeArgs
      ) {
        const srcSwapData = encodeSwapData(
          srcTrade.writeArgs as Parameters<typeof encodeSwapData>[0],
        )
        const dstSwapData = encodeSwapData(
          dstTrade.writeArgs as Parameters<typeof encodeSwapData>[0],
        )

        dstPayload = encodeAbiParameters(
          parseAbiParameters('address, bytes, bytes'),
          [
            recipient, // to
            dstSwapData, // swapData
            '0x', // payloadData
          ],
        )
        dstGasEst = estimateStargateDstGas(dstTrade.route?.gasSpent ?? 0)

        transactionType = TransactionType.CrossChainSwap
        functionName = 'swapAndBridge'
        writeArgs = [
          getBridgeParams({
            adapter: STARGATE_ADAPTER_ADDRESS[network0],
            amountIn: amount,
            to: recipient,
            adapterData: encodeStargateTeleportParams({
              srcBridgeToken,
              dstBridgeToken,
              amount: 0,
              amountMin: srcAmountOutMin.quotient,
              dustAmount: 0,
              receiver: STARGATE_ADAPTER_ADDRESS[network1],
              to: recipient,
              dstGas: dstGasEst,
            }),
          }),
          recipient, // refundAddress
          srcSwapData, //srcSwapPayload
          dstSwapData, // dstPayload
          '0x',
        ]
      } else {
        throw new Error('Crosschain swap not found.')
      }

      let [fee] = await client.readContract({
        address: STARGATE_ADAPTER_ADDRESS[network0],
        abi: stargateAdapterAbi,
        functionName: 'getFee',
        args: [
          STARGATE_CHAIN_ID[network1 as StargateChainId], // dstChain
          1, // functionType
          isDstSwap ? STARGATE_ADAPTER_ADDRESS[network1] : recipient, // receiver
          dstGasEst, // gasAmount
          0n, // dustAmount
          isDstSwap ? dstPayload! : '0x', // payload
        ],
      })

      // Add 20% buffer to STG fee
      fee = (fee * 5n) / 4n

      const value = amount.currency.isNative
        ? BigInt(amount.quotient) + fee
        : fee

      // est 500K gas for XSwapV2 call
      const srcGasEst = 500000n + BigInt(srcTrade?.route?.gasSpent ?? 0)

      const srcGasFee = Amount.fromRawAmount(
        Native.onChain(network0),
        srcGasEst * gasPrice0,
      )

      const bridgeFee = Amount.fromRawAmount(Native.onChain(network0), fee)

      const gasSpent = srcGasFee.add(bridgeFee)

      return {
        transactionType,
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
        network0 &&
          network1 &&
          token0 &&
          token1 &&
          amount &&
          bridgeFees &&
          bridgePath &&
          gasPrice0 &&
          gasPrice1,
      ) &&
      (isSrcSwap ? Boolean(srcTrade) : Boolean(srcAmountOut)) &&
      (isDstSwap ? Boolean(dstTrade) : Boolean(dstAmountIn)),
    queryKeyHashFn: stringify,
  })
}
