'use client'

import { createErrorToast, createToast } from '@sushiswap/notifications'
import {
  LiquidityEventName,
  LiquiditySource,
  sendAnalyticsEvent,
} from '@sushiswap/telemetry'
import { FC, ReactElement, useCallback, useMemo } from 'react'
import { ConcentratedLiquidityPosition } from 'src/lib/wagmi/hooks/positions/types'
import { ChainId } from 'sushi/chain'
import {
  SUSHISWAP_V3_POSTIION_MANAGER,
  isSushiSwapV3ChainId,
} from 'sushi/config'
import { Amount, Type, unwrapToken } from 'sushi/currency'
import { NonfungiblePositionManager, Position } from 'sushi/pool/sushiswap-v3'
import { Hex, SendTransactionReturnType, UserRejectedRequestError } from 'viem'
import {
  UseCallParameters,
  useAccount,
  useCall,
  usePublicClient,
  useSendTransaction,
} from 'wagmi'
import { useRefetchBalances } from '~evm/_common/ui/balance-provider/use-refetch-balances'

interface ConcentratedLiquidityCollectButton {
  positionDetails: ConcentratedLiquidityPosition | undefined
  position: Position | undefined
  token0: Type | undefined
  token1: Type | undefined
  account: `0x${string}` | undefined
  chainId: ChainId
  children(
    params: Omit<
      ReturnType<typeof useSendTransaction>,
      'sendTransaction' | 'sendTransactionAsync'
    > & { send: (() => Promise<void>) | undefined },
  ): ReactElement
}

export const ConcentratedLiquidityCollectButton: FC<
  ConcentratedLiquidityCollectButton
> = ({
  account,
  chainId,
  position,
  positionDetails,
  children,
  token0,
  token1,
}) => {
  const { chain } = useAccount()
  const client = usePublicClient()

  const { refetchChain: refetchBalances } = useRefetchBalances()

  const prepare = useMemo(() => {
    if (
      token0 &&
      token1 &&
      position &&
      account &&
      positionDetails &&
      isSushiSwapV3ChainId(chainId)
    ) {
      const feeValue0 = positionDetails.fees
        ? Amount.fromRawAmount(token0, positionDetails.fees[0])
        : undefined
      const feeValue1 = positionDetails.fees
        ? Amount.fromRawAmount(token0, positionDetails.fees[1])
        : undefined

      const { calldata, value } =
        NonfungiblePositionManager.collectCallParameters({
          tokenId: positionDetails.tokenId.toString(),
          expectedCurrencyOwed0:
            feeValue0 ?? Amount.fromRawAmount(unwrapToken(token0), 0),
          expectedCurrencyOwed1:
            feeValue1 ?? Amount.fromRawAmount(unwrapToken(token1), 0),
          recipient: account,
        })

      return {
        to: SUSHISWAP_V3_POSTIION_MANAGER[chainId],
        chainId,
        data: calldata as Hex,
        value: BigInt(value),
      } satisfies UseCallParameters
    }

    return undefined
  }, [account, chainId, position, positionDetails, token0, token1])

  const onSuccess = useCallback(
    (hash: SendTransactionReturnType) => {
      if (!position) return

      const receipt = client.waitForTransactionReceipt({ hash })
      receipt.then(() => {
        refetchBalances(chainId)
      })

      const ts = new Date().getTime()
      void createToast({
        account,
        type: 'claimRewards',
        chainId,
        txHash: hash,
        promise: client.waitForTransactionReceipt({ hash }),
        summary: {
          pending: `Collecting fees from your ${position.amount0.currency.symbol}/${position.amount1.currency.symbol} position`,
          completed: `Collected fees from your ${position.amount0.currency.symbol}/${position.amount1.currency.symbol} position`,
          failed: 'Something went wrong when trying to collect fees',
        },
        timestamp: ts,
        groupTimestamp: ts,
      })
    },
    [refetchBalances, account, chainId, client, position],
  )

  const onError = useCallback((e: Error) => {
    if (!(e.cause instanceof UserRejectedRequestError)) {
      createErrorToast(e?.message, true)
    }
  }, [])

  const { isError: isSimulationError } = useCall({
    ...prepare,
    query: {
      enabled: Boolean(
        token0 &&
          token1 &&
          account &&
          position &&
          positionDetails &&
          chainId === chain?.id,
      ),
    },
  })

  const {
    sendTransactionAsync,
    sendTransaction: _,
    ...rest
  } = useSendTransaction({
    mutation: {
      onSuccess,
      onError,
    },
  })

  const send = useMemo(() => {
    if (isSimulationError || !prepare) return

    return async () => {
      try {
        await sendTransactionAsync(prepare)
        sendAnalyticsEvent(LiquidityEventName.COLLECT_LIQUIDITY_SUBMITTED, {
          chain_id: prepare.chainId,
          address: account,
          source: LiquiditySource.V3,
          label: [token0?.symbol, token1?.symbol].join('/'),
        })
      } catch {}
    }
  }, [
    isSimulationError,
    prepare,
    sendTransactionAsync,
    account,
    token0,
    token1,
  ])

  return children({ ...rest, send })
}
