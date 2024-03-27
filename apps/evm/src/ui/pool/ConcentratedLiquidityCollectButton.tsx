'use client'

import { createErrorToast, createToast } from '@sushiswap/ui/components/toast'
import {
  ConcentratedLiquidityPosition,
  UseCallParameters,
  getV3NonFungiblePositionManagerContractConfig,
  useAccount,
  useCall,
  usePublicClient,
  useSendTransaction,
} from '@sushiswap/wagmi'
import { FC, ReactElement, useCallback, useMemo } from 'react'
import { unwrapToken } from 'src/lib/functions'
import { ChainId } from 'sushi/chain'
import { isSushiSwapV3ChainId } from 'sushi/config'
import { Amount, Type } from 'sushi/currency'
import { NonfungiblePositionManager, Position } from 'sushi/pool'
import { Hex, SendTransactionReturnType, UserRejectedRequestError } from 'viem'

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
        to: getV3NonFungiblePositionManagerContractConfig(chainId).address,
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
    [account, chainId, client, position],
  )

  const onError = useCallback((e: Error) => {
    if (e instanceof UserRejectedRequestError) {
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
      } catch {}
    }
  }, [isSimulationError, prepare, sendTransactionAsync])

  return children({ ...rest, send })
}
