'use client'

import { InterfaceEventName, sendAnalyticsEvent } from '@sushiswap/telemetry'
import { createErrorToast, createToast } from '@sushiswap/ui'
import { useCallback, useMemo, useState } from 'react'
// import * as Sentry from '@sentry/nextjs'
import { Amount, Type } from 'sushi/currency'
import {
  Address,
  SendTransactionReturnType,
  UserRejectedRequestError,
  maxUint256,
} from 'viem'
import {
  useAccount,
  usePublicClient,
  useSimulateContract,
  useWriteContract,
} from 'wagmi'

import { useTokenAllowance } from './useTokenAllowance'

export enum ApprovalState {
  LOADING = 'LOADING',
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

interface UseTokenApprovalParams {
  spender: Address | undefined
  amount: Amount<Type> | undefined
  approveMax?: boolean
  enabled?: boolean
}

export const useTokenApproval = ({
  amount,
  spender,
  enabled = true,
  approveMax,
}: UseTokenApprovalParams) => {
  const { address } = useAccount()
  const [pending, setPending] = useState(false)
  const client = usePublicClient()
  const {
    data: allowance,
    isLoading: isAllowanceLoading,
    refetch,
  } = useTokenAllowance({
    token: amount?.currency?.wrapped,
    owner: address,
    spender,
    chainId: amount?.currency.chainId,
    enabled: Boolean(amount?.currency?.isToken && enabled),
  })

  const { data: simulation } = useSimulateContract({
    chainId: amount?.currency.chainId,
    abi: [
      {
        constant: false,
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        name: 'approve',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ] as const,
    address: amount?.currency?.wrapped?.address as Address,
    functionName: 'approve',
    args: [
      spender as Address,
      approveMax ? maxUint256 : amount ? amount.quotient : 0n,
    ],
    query: {
      enabled: Boolean(
        amount &&
          spender &&
          address &&
          allowance &&
          enabled &&
          !isAllowanceLoading,
      ),
    },
    // onError: (error) => Sentry.captureException(`approve prepare error: ${error.message}`),
  })

  const onSuccess = useCallback(
    async (data: SendTransactionReturnType) => {
      if (!amount) return

      sendAnalyticsEvent(InterfaceEventName.APPROVE_TOKEN_TXN_SUBMITTED, {
        chain_id: amount.currency.chainId,
        token_address: amount.currency.wrapped.address,
        token_symbol: amount.currency.symbol,
      })
      setPending(true)
      try {
        const ts = new Date().getTime()
        const receiptPromise = client.waitForTransactionReceipt({
          hash: data,
        })

        void createToast({
          account: address,
          type: 'approval',
          chainId: amount.currency.chainId,
          txHash: data,
          promise: receiptPromise,
          summary: {
            pending: `Approving ${amount.currency.symbol}`,
            completed: `Successfully approved ${amount.currency.symbol}`,
            failed: `Something went wrong approving ${amount.currency.symbol}`,
          },
          groupTimestamp: ts,
          timestamp: ts,
        })

        await receiptPromise
        await refetch()
      } finally {
        setPending(false)
      }
    },
    [refetch, client, amount, address],
  )

  const onError = useCallback((e: Error) => {
    if (e instanceof Error) {
      if (!(e instanceof UserRejectedRequestError)) {
        createErrorToast(e.message, true)
      }
    }
  }, [])

  const execute = useWriteContract({
    // ...data?.request,
    mutation: {
      onError,
      onSuccess,
    },
  })

  const write = useMemo(() => {
    if (!execute.writeContract || !simulation?.request) return

    return () => execute.writeContract(simulation.request)
  }, [execute.writeContract, simulation?.request])

  return useMemo<[ApprovalState, { write: undefined | (() => void) }]>(() => {
    let state = ApprovalState.UNKNOWN
    if (amount?.currency.isNative) state = ApprovalState.APPROVED
    else if (allowance && amount && allowance.greaterThan(amount))
      state = ApprovalState.APPROVED
    else if (allowance && amount && allowance.equalTo(amount))
      state = ApprovalState.APPROVED
    else if (pending) state = ApprovalState.PENDING
    else if (isAllowanceLoading) state = ApprovalState.LOADING
    else if (allowance && amount && allowance.lessThan(amount))
      state = ApprovalState.NOT_APPROVED

    return [state, { write }]
  }, [allowance, amount, write, isAllowanceLoading, pending])
}
