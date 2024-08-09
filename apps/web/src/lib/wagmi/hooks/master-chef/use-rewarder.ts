'use client'

import { keepPreviousData, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { ChefType } from 'sushi'
import { ChainId } from 'sushi/chain'
import { Amount, Token } from 'sushi/currency'
import { Address } from 'viem'
import { useBlockNumber, useReadContracts } from 'wagmi'
import { getMasterChefContractConfig } from './use-master-chef-contract'

interface UseRewarderPayload {
  account: string | undefined
  chainId: ChainId
  farmId: number
  rewardTokens: Token[]
  rewarderAddresses: string[]
  types: RewarderType[]
  chef: ChefType
  enabled?: boolean
}
export enum RewarderType {
  Primary = 'Primary',
  Secondary = 'Secondary',
}

export const useRewarder = ({
  chainId,
  account,
  rewarderAddresses,
  rewardTokens,
  types,
  farmId,
  chef,
  enabled,
}: UseRewarderPayload) => {
  const config = getMasterChefContractConfig(chainId, chef)

  const contracts = useMemo(() => {
    if (
      !account ||
      !config ||
      (rewardTokens.length !== rewarderAddresses.length &&
        rewardTokens.length !== types.length)
    ) {
      return []
    }

    return types.map((type, i) => {
      return type === RewarderType.Primary
        ? ({
            ...config,
            abi: [
              {
                inputs: [
                  {
                    internalType: 'uint256',
                    name: '_pid',
                    type: 'uint256',
                  },
                  {
                    internalType: 'address',
                    name: '_user',
                    type: 'address',
                  },
                ],
                name: 'pendingSushi',
                outputs: [
                  {
                    internalType: 'uint256',
                    name: '',
                    type: 'uint256',
                  },
                ],
                stateMutability: 'view',
                type: 'function',
              },
            ],
            functionName: 'pendingSushi' as const,
            args: [BigInt(farmId), account as Address],
          } as const)
        : ({
            // ...getRewarderConfig(rewarderAddresses[i]),
            address: rewarderAddresses[i] as Address,
            chainId,
            abi: [
              {
                inputs: [
                  {
                    internalType: 'uint256',
                    name: 'pid',
                    type: 'uint256',
                  },
                  {
                    internalType: 'address',
                    name: 'user',
                    type: 'address',
                  },
                  {
                    internalType: 'uint256',
                    name: '',
                    type: 'uint256',
                  },
                ],
                name: 'pendingTokens',
                outputs: [
                  {
                    internalType: 'contract IERC20[]',
                    name: 'rewardTokens',
                    type: 'address[]',
                  },
                  {
                    internalType: 'uint256[]',
                    name: 'rewardAmounts',
                    type: 'uint256[]',
                  },
                ],
                stateMutability: 'view',
                type: 'function',
              },
            ],
            functionName: 'pendingTokens' as const,
            args: [BigInt(farmId), account as Address, 0n],
          } as const)
    })
  }, [
    account,
    chainId,
    config,
    farmId,
    rewardTokens.length,
    rewarderAddresses,
    types,
  ])

  const queryClient = useQueryClient()

  const { isError, isInitialLoading, data, queryKey } = useReadContracts({
    contracts,
    allowFailure: true,
    query: {
      enabled: !!account && !!enabled,
      placeholderData: keepPreviousData,
      select: (results) => results.map((r) => r.result),
    },
  })

  const { data: blockNumber } = useBlockNumber({ chainId, watch: true })

  useEffect(() => {
    if (blockNumber) {
      queryClient.invalidateQueries({ queryKey }, { cancelRefetch: false })
    }
  }, [blockNumber, queryClient, queryKey])

  return useMemo(() => {
    if (!data)
      return {
        data: rewardTokens.map(() => undefined),
        isInitialLoading,
        isError,
      }

    // ! POSSIBLY BROKE IT, TEST
    return {
      data: data.reduce<(Amount<Token> | undefined)[]>((acc, result, index) => {
        if (typeof result === 'bigint') {
          acc.push(
            result
              ? Amount.fromRawAmount(rewardTokens[index], result)
              : undefined,
          )
        } else if (typeof result !== 'undefined') {
          acc.push(
            ...result[1].map((rewardAmount, index2: number) => {
              return Amount.fromRawAmount(
                rewardTokens[index + index2],
                rewardAmount,
              )
            }),
          )
        }

        return acc
      }, []),
      isInitialLoading,
      isError,
    }
  }, [data, isError, isInitialLoading, rewardTokens])
}
