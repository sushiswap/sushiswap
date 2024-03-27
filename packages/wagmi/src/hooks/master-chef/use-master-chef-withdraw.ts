'use client'

import { ChefType } from '@sushiswap/client'
import { createErrorToast, createToast } from '@sushiswap/ui/components/toast'
import { useCallback, useMemo } from 'react'
import { ChainId } from 'sushi'
import { masterChefV1Abi, masterChefV2Abi, miniChefV2Abi } from 'sushi/abi'
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
import { getMasterChefContractConfig } from './use-master-chef-contract'

interface UseMasterChefWithdrawParams {
  chainId: ChainId
  chef: ChefType
  pid: number
  amount?: Amount<Token>
  enabled?: boolean
}

export const useMasterChefWithdraw = ({
  chainId,
  amount,
  chef,
  pid,
  enabled = true,
}: UseMasterChefWithdrawParams) => {
  const { address } = useAccount()
  const client = usePublicClient()

  const onSuccess = useCallback(
    (data: SendTransactionReturnType) => {
      if (!amount) return

      const ts = new Date().getTime()
      void createToast({
        account: address,
        type: 'burn',
        chainId,
        txHash: data,
        promise: client.waitForTransactionReceipt({ hash: data }),
        summary: {
          pending: `Unstaking ${amount.toSignificant(6)} ${
            amount.currency.symbol
          } tokens`,
          completed: `Successfully unstaked ${amount.toSignificant(6)} ${
            amount.currency.symbol
          } tokens`,
          failed: `Something went wrong when unstaking ${amount.currency.symbol} tokens`,
        },
        groupTimestamp: ts,
        timestamp: ts,
      })
    },
    [amount, client, chainId, address],
  )

  const onError = useCallback((e: Error) => {
    if (e instanceof UserRejectedRequestError) {
      createErrorToast(e?.message, true)
    }
  }, [])

  const prepare = useMemo(() => {
    if (!address || !chainId || !amount || !chef) return {}

    if (getMasterChefContractConfig(chainId, chef)?.address) {
      let data
      switch (chef) {
        case ChefType.MasterChefV1:
          data = {
            abi: masterChefV1Abi,
            functionName: 'withdraw',
            args: [BigInt(pid), BigInt(amount.quotient.toString())],
          }
          break
        case ChefType.MasterChefV2:
          data = {
            abi: masterChefV2Abi,
            functionName: 'withdraw',
            args: [BigInt(pid), BigInt(amount.quotient.toString()), address],
          }
          break
        case ChefType.MiniChef:
          data = {
            abi: miniChefV2Abi,
            functionName: 'withdrawAndHarvest',
            args: [BigInt(pid), BigInt(amount.quotient.toString()), address],
          }
      }

      return {
        account: address,
        address: getMasterChefContractConfig(chainId, chef)?.address,
        ...data,
      } satisfies UseSimulateContractParameters
    }
  }, [address, amount, chainId, chef, pid])

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
      onError,
      onSuccess,
    },
  })

  const write = useMemo(() => {
    if (!simulation) return

    return async (confirm?: () => void) => {
      try {
        await writeContractAsync(simulation.request)

        confirm?.()
      } catch {}
    }
  }, [simulation, writeContractAsync])

  return {
    ...rest,
    write,
  }
}
