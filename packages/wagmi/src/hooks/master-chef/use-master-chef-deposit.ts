'use client'

import { ChefType } from '@sushiswap/client'
import { createErrorToast, createToast } from '@sushiswap/ui/components/toast'
import { useCallback, useMemo } from 'react'
import { masterChefV1Abi, masterChefV2Abi } from 'sushi/abi'
import { Amount, Token } from 'sushi/currency'
import { UserRejectedRequestError } from 'viem'
import {
  UseSimulateContractParameters,
  useAccount,
  usePublicClient,
  useSimulateContract,
  useWriteContract,
} from 'wagmi'
import { SendTransactionReturnType } from 'wagmi/actions'

import { ChainId } from 'sushi'
import { useMasterChefContract } from './use-master-chef-contract'

interface UseMasterChefDepositParams {
  chainId: ChainId
  chef: ChefType
  pid: number
  amount?: Amount<Token>
  enabled?: boolean
}

export const useMasterChefDeposit = ({
  chainId,
  amount,
  chef,
  pid,
  enabled = true,
}: UseMasterChefDepositParams) => {
  const { address } = useAccount()
  const client = usePublicClient()
  const contract = useMasterChefContract(chainId, chef)

  const onError = useCallback((e: Error) => {
    if (e instanceof UserRejectedRequestError) {
      createErrorToast(e?.message, true)
    }
  }, [])

  const onSuccess = useCallback(
    (data: SendTransactionReturnType) => {
      if (!amount) return

      try {
        const ts = new Date().getTime()
        void createToast({
          account: address,
          type: 'mint',
          chainId,
          txHash: data,
          promise: client.waitForTransactionReceipt({ hash: data }),
          summary: {
            pending: `Staking ${amount.toSignificant(6)} ${
              amount.currency.symbol
            } tokens`,
            completed: `Successfully staked ${amount.toSignificant(6)} ${
              amount.currency.symbol
            } tokens`,
            failed: `Something went wrong when staking ${amount.currency.symbol} tokens`,
          },
          groupTimestamp: ts,
          timestamp: ts,
        })
      } catch {}
    },
    [address, chainId, client, amount],
  )

  const prepare = useMemo(() => {
    if (!address || !chainId || !amount || !contract) return {}

    let data
    if (chef === ChefType.MasterChefV1) {
      data = {
        abi: masterChefV1Abi,
        functionName: 'deposit',
        args: [BigInt(pid), BigInt(amount.quotient.toString())],
      }
    } else {
      data = {
        abi: masterChefV2Abi,
        functionName: 'deposit',
        args: [BigInt(pid), BigInt(amount.quotient.toString()), address],
      }
    }

    return {
      account: address,
      address: contract.address,
      ...data,
    } satisfies UseSimulateContractParameters
  }, [address, amount, chainId, chef, contract, pid])

  const { data: simulation } = useSimulateContract({
    ...prepare,
    chainId,
    query: { enabled },
  })

  const {
    writeContractAsync,
    writeContract: _,
    ...rest
  } = useWriteContract({
    mutation: {
      onSuccess,
      onError,
    },
  })

  const write = useMemo(() => {
    if (!simulation) return undefined

    return async () => {
      try {
        await writeContractAsync(simulation.request)
      } catch {}
    }
  }, [simulation, writeContractAsync])

  return {
    ...rest,
    write,
  }
}
