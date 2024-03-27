'use client'

import {
  createErrorToast,
  createFailedToast,
  createToast,
} from '@sushiswap/ui/components/toast'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { BENTOBOX_ADDRESS, BentoBoxChainId } from 'sushi/config'
import { Address, UserRejectedRequestError, hexToSignature } from 'viem'
import {
  useAccount,
  usePublicClient,
  useSignTypedData,
  useSimulateContract,
  useWriteContract,
} from 'wagmi'
import { SendTransactionReturnType } from 'wagmi/actions'

import { getBentoBoxContractConfig } from '../..'
import {
  useApprovedActions,
  useSignature,
} from '../../../systems/Checker/Provider'
import { ApprovalState } from '../../approvals'

interface UseBentoboxApprovalParams {
  enabled?: boolean
  chainId: BentoBoxChainId
  masterContract?: Address
  tag: string
}

export const useBentoBoxApproval = ({
  enabled = true,
  chainId,
  masterContract,
  tag,
}: UseBentoboxApprovalParams): [
  ApprovalState,
  undefined | (() => Promise<void>),
] => {
  const { address } = useAccount()
  const [fallback, setFallback] = useState(false)
  const [pending, setPending] = useState(false)
  const { signature } = useSignature(tag)
  const { setSignature } = useApprovedActions(tag)
  const { signTypedDataAsync } = useSignTypedData()
  const client = usePublicClient({ chainId })

  const onError = useCallback((e: Error, msg: string) => {
    console.error(msg, e)

    if (e instanceof Error) {
      if (!(e instanceof UserRejectedRequestError)) {
        createErrorToast(e.message, true)
      }
    }
  }, [])

  const {
    data: approvalData,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['masterContractApproval', { chainId, masterContract, address }],
    queryFn: async () => {
      if (masterContract && address) {
        const isApproved = await client.readContract({
          ...getBentoBoxContractConfig(chainId),
          functionName: 'masterContractApproved',
          args: [masterContract, address],
        })

        if (!isApproved) {
          const nonces = await client.readContract({
            ...getBentoBoxContractConfig(chainId),
            functionName: 'nonces',
            args: [address],
          })

          return { isApproved, nonces }
        }
        return { isApproved, nonces: undefined }
      }

      return null
    },
    onError: (e: Error) =>
      onError(e, 'error fetching master contract approval'),
    enabled,
  })

  const { data: simulation } = useSimulateContract({
    ...getBentoBoxContractConfig(chainId),
    chainId,
    functionName: 'setMasterContractApproval',
    args:
      masterContract && address
        ? [
            address,
            masterContract,
            true,
            0,
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ]
        : undefined,
    query: {
      enabled: Boolean(
        enabled && masterContract && address && chainId && fallback,
      ),
      onError: (e) => onError(e, 'error preparing master contract approval'),
    },
  })

  const onSuccess = useCallback(
    async (data: SendTransactionReturnType) => {
      setPending(true)

      try {
        const ts = new Date().getTime()
        const receiptPromise = client.waitForTransactionReceipt({
          hash: data,
        })

        void createToast({
          account: address,
          type: 'approval',
          chainId,
          txHash: data,
          promise: receiptPromise,
          summary: {
            pending: 'Approving BentoBox Master Contract',
            completed: 'Successfully approved the master contract',
            failed: 'Something went wrong approving the master contract',
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
    [address, chainId, client, refetch],
  )

  const { writeContractAsync } = useWriteContract({
    ...simulation?.request,
    mutation: {
      onSuccess,
      onError: (e) => onError(e, 'error executing master contract approval'),
    },
  })

  const executeTransaction = useMemo(() => {
    if (!simulation) return undefined

    return async () => {
      try {
        await writeContractAsync(simulation.request)
      } catch {}
    }
  }, [simulation, writeContractAsync])

  const executeSignature = useCallback(async () => {
    // console.log('execute', address, approvalData)

    if (!address || typeof approvalData?.nonces !== 'bigint') return

    try {
      const signedData = await signTypedDataAsync({
        primaryType: 'SetMasterContractApproval',
        domain: {
          name: 'BentoBox V1',
          chainId,
          verifyingContract: BENTOBOX_ADDRESS[chainId],
        },
        types: {
          SetMasterContractApproval: [
            { name: 'warning', type: 'string' },
            { name: 'user', type: 'address' },
            { name: 'masterContract', type: 'address' },
            { name: 'approved', type: 'bool' },
            { name: 'nonce', type: 'uint256' },
          ],
        },
        message: {
          warning: 'Give FULL access to funds in (and approved to) BentoBox?',
          user: address,
          masterContract: masterContract as Address,
          approved: true,
          nonce: approvalData.nonces,
        },
      })

      const signature = hexToSignature(signedData)
      console.log('signature', signature)
      setSignature(signature)
    } catch (error) {
      console.error('error signing master contract approval', error)
      const ts = new Date().getTime()
      void createFailedToast({
        account: address,
        type: 'approval',
        chainId,
        summary:
          'Failed to approve using a permit, please try again using a regular approval.',
        groupTimestamp: ts,
        timestamp: ts,
      })
      setFallback(true)
    }
  }, [
    address,
    chainId,
    approvalData,
    masterContract,
    setSignature,
    signTypedDataAsync,
  ])

  return useMemo(() => {
    let state = ApprovalState.UNKNOWN
    if (signature) state = ApprovalState.APPROVED
    else if (approvalData?.isApproved) state = ApprovalState.APPROVED
    else if (pending) state = ApprovalState.PENDING
    else if (isLoading) state = ApprovalState.LOADING

    return [state, fallback ? void executeTransaction : executeSignature]
  }, [
    executeTransaction,
    approvalData,
    executeSignature,
    fallback,
    isLoading,
    pending,
    signature,
  ])
}
