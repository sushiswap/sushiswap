'use client'

import { createErrorToast, createToast } from '@sushiswap/ui/components/toast'
import { useCallback, useMemo } from 'react'
import { xsushiAbi } from 'sushi/abi'
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

interface UseBarDepositParams {
  amount?: Amount<Token>
  enabled?: boolean
}

export function useBarDeposit({ amount, enabled = true }: UseBarDepositParams) {
  const { address } = useAccount()
  const client = usePublicClient()

  const onSuccess = useCallback(
    (data: SendTransactionReturnType) => {
      if (!amount) return

      const ts = new Date().getTime()
      void createToast({
        account: address,
        type: 'enterBar',
        chainId: ChainId.ETHEREUM,
        txHash: data,
        promise: client.waitForTransactionReceipt({ hash: data }),
        summary: {
          pending: `Staking ${amount.toSignificant(6)} SUSHI`,
          completed: 'Successfully staked SUSHI',
          failed: 'Something went wrong when staking SUSHI',
        },
        groupTimestamp: ts,
        timestamp: ts,
      })
    },
    [amount, address, client],
  )

  const onError = useCallback((e: Error) => {
    if (e instanceof UserRejectedRequestError) {
      createErrorToast(e?.message, true)
    }
  }, [])

  const { data: simulation } = useSimulateContract({
    address: XSUSHI_ADDRESS[ChainId.ETHEREUM],
    abi: xsushiAbi,
    functionName: 'enter',
    chainId: ChainId.ETHEREUM,
    args: [amount?.quotient],
    query: { enabled },
  })

  const { writeContractAsync, ...rest } = useWriteContract({
    mutation: { onSuccess, onError },
  })

  const write = useMemo(() => {
    if (!writeContractAsync || !simulation) return undefined

    return async () => {
      try {
        await writeContractAsync(simulation.request)
      } catch {}
    }
  }, [writeContractAsync, simulation])

  return { ...rest, write }
}
