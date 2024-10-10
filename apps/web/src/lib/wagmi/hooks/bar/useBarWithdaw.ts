'use client'

import { createErrorToast, createToast } from '@sushiswap/notifications'
import { useCallback, useMemo } from 'react'
import { xsushiAbi_leave } from 'sushi/abi'
import { Amount, Token, XSUSHI_ADDRESS } from 'sushi/currency'
import { UserRejectedRequestError } from 'viem'
import {
  useAccount,
  usePublicClient,
  useSimulateContract,
  useWriteContract,
} from 'wagmi'
import { SendTransactionReturnType } from 'wagmi/actions'

import { ChainId } from 'sushi/chain'
import { useRefetchBalances } from '~evm/_common/ui/balance-provider/use-refetch-balances'

interface UseBarWithdrawParams {
  amount?: Amount<Token>
  enabled?: boolean
}

export function useBarWithdraw({
  amount,
  enabled = true,
}: UseBarWithdrawParams) {
  const { address } = useAccount()
  const client = usePublicClient()

  const { refetchChain: refetchBalances } = useRefetchBalances()

  const onSuccess = useCallback(
    (data: SendTransactionReturnType) => {
      if (!amount) return

      const receipt = client.waitForTransactionReceipt({ hash: data })
      receipt.then(() => {
        refetchBalances(ChainId.ETHEREUM)
      })

      const ts = new Date().getTime()
      void createToast({
        account: address,
        type: 'leaveBar',
        chainId: ChainId.ETHEREUM,
        txHash: data,
        promise: receipt,
        summary: {
          pending: `Unstaking ${amount.toSignificant(6)} XSUSHI`,
          completed: 'Successfully unstaked XSUSHI',
          failed: 'Something went wrong when unstaking XSUSHI',
        },
        groupTimestamp: ts,
        timestamp: ts,
      })
    },
    [refetchBalances, address, amount, client],
  )

  const onError = useCallback((e: Error) => {
    if (!(e.cause instanceof UserRejectedRequestError)) {
      createErrorToast(e?.message, true)
    }
  }, [])

  const { data: simulation } = useSimulateContract({
    address: XSUSHI_ADDRESS[ChainId.ETHEREUM],
    abi: xsushiAbi_leave,
    functionName: 'leave',
    chainId: ChainId.ETHEREUM,
    args: amount ? [amount.quotient] : undefined,
    query: { enabled },
  })

  const { writeContractAsync, ...rest } = useWriteContract({
    mutation: {
      onSuccess,
      onError,
    },
  })

  const write = useMemo(() => {
    if (!writeContractAsync || !simulation) return

    return async () => {
      try {
        await writeContractAsync(simulation.request)
      } catch {}
    }
  }, [writeContractAsync, simulation])

  return { ...rest, write }
}
