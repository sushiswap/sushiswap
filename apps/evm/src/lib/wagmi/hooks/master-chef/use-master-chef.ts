'use client'

import { ChefType } from '@sushiswap/client'
import { createErrorToast, createToast } from '@sushiswap/notifications'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo } from 'react'
import { erc20Abi, masterChefV2Abi, miniChefV2Abi } from 'sushi/abi'
import { ChainId } from 'sushi/chain'
import { SUSHI, SUSHI_ADDRESS } from 'sushi/currency'
import { Amount, Token } from 'sushi/currency'
import { Address, UserRejectedRequestError, encodeFunctionData } from 'viem'
import {
  useAccount,
  useBlockNumber,
  usePublicClient,
  useReadContracts,
  useSendTransaction,
} from 'wagmi'
import { SendTransactionErrorType } from 'wagmi/actions'
import { SendTransactionData } from 'wagmi/query'
import {
  MASTERCHEF_ADDRESS,
  MASTERCHEF_V2_ADDRESS,
  MINICHEF_ADDRESS,
  useMasterChefContract,
} from './use-master-chef-contract'

interface UseMasterChefReturn
  extends Pick<ReturnType<typeof useReadContracts>, 'isLoading' | 'isError'> {
  balance: Amount<Token> | undefined
  harvest: undefined | (() => void)
  pendingSushi: Amount<Token> | undefined
  isWritePending: boolean
  isWriteError: boolean
}

interface UseMasterChefParams {
  chainId: ChainId
  chef: ChefType
  pid: number
  token: Token | undefined
  enabled?: boolean
  watch?: boolean
}

type UseMasterChef = (params: UseMasterChefParams) => UseMasterChefReturn

export const useMasterChef: UseMasterChef = ({
  chainId,
  watch = true,
  chef,
  pid,
  token,
  enabled = true,
}) => {
  const { address } = useAccount()
  const client = usePublicClient()
  const contract = useMasterChefContract(chainId, chef)

  const contracts = useMemo(() => {
    if (!chainId || !enabled || !address) return []

    if (chainId === ChainId.ETHEREUM) {
      return [
        {
          chainId: ChainId.ETHEREUM as ChainId,
          address: SUSHI_ADDRESS[chainId] as Address,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [
            (chef === ChefType.MasterChefV1
              ? MASTERCHEF_ADDRESS[chainId]
              : MASTERCHEF_V2_ADDRESS[chainId]) as Address,
          ],
        } as const,
        {
          chainId: ChainId.ETHEREUM as ChainId,
          address: (chef === ChefType.MasterChefV1
            ? MASTERCHEF_ADDRESS[chainId]
            : MASTERCHEF_V2_ADDRESS[chainId]) as Address,
          abi: [
            chef === ChefType.MasterChefV1
              ? ({
                  inputs: [
                    { internalType: 'uint256', name: '', type: 'uint256' },
                    { internalType: 'address', name: '', type: 'address' },
                  ],
                  name: 'userInfo',
                  outputs: [
                    {
                      internalType: 'uint256',
                      name: 'amount',
                      type: 'uint256',
                    },
                    {
                      internalType: 'uint256',
                      name: 'rewardDebt',
                      type: 'uint256',
                    },
                  ],
                  stateMutability: 'view',
                  type: 'function',
                } as const)
              : ({
                  inputs: [
                    { internalType: 'uint256', name: '', type: 'uint256' },
                    { internalType: 'address', name: '', type: 'address' },
                  ],
                  name: 'userInfo',
                  outputs: [
                    {
                      internalType: 'uint256',
                      name: 'amount',
                      type: 'uint256',
                    },
                    {
                      internalType: 'int256',
                      name: 'rewardDebt',
                      type: 'int256',
                    },
                  ],
                  stateMutability: 'view',
                  type: 'function',
                } as const),
          ] as const,
          functionName: 'userInfo',
          args: [pid, address as Address],
        } as const,
        {
          chainId: ChainId.ETHEREUM as ChainId,
          address: MASTERCHEF_V2_ADDRESS[chainId] as Address,
          abi: [
            {
              inputs: [
                { internalType: 'uint256', name: '_pid', type: 'uint256' },
                { internalType: 'address', name: '_user', type: 'address' },
              ],
              name: 'pendingSushi',
              outputs: [
                { internalType: 'uint256', name: 'pending', type: 'uint256' },
              ],
              stateMutability: 'view',
              type: 'function',
            },
          ] as const,
          functionName: 'pendingSushi',
          args: [pid, address as Address],
        } as const,
      ]
    }

    if (chainId in MINICHEF_ADDRESS && chainId in SUSHI_ADDRESS) {
      return [
        {
          chainId,
          address: SUSHI_ADDRESS[
            chainId as keyof typeof SUSHI_ADDRESS
          ] as Address,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [
            MINICHEF_ADDRESS[
              chainId as keyof typeof MINICHEF_ADDRESS
            ] as Address,
          ],
        } as const,
        {
          chainId,
          address: MINICHEF_ADDRESS[
            chainId as keyof typeof MINICHEF_ADDRESS
          ] as Address,
          abi: [
            {
              inputs: [
                { internalType: 'uint256', name: '', type: 'uint256' },
                { internalType: 'address', name: '', type: 'address' },
              ],
              name: 'userInfo',
              outputs: [
                { internalType: 'uint256', name: 'amount', type: 'uint256' },
                { internalType: 'int256', name: 'rewardDebt', type: 'int256' },
              ],
              stateMutability: 'view',
              type: 'function',
            } as const,
          ] as const,
          functionName: 'userInfo',
          args: [pid, address as Address],
        } as const,
      ] as const
    }

    return []
  }, [address, chainId, chef, enabled, pid])

  const queryClient = useQueryClient()

  // Can't type runtime...
  const { data, isLoading, isError, queryKey } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0 && enabled,
      keepPreviousData: true,
      select: (results) => results.map((r) => r.result),
    },
  })

  const { data: blockNumber } = useBlockNumber({ chainId, watch: true })

  useEffect(() => {
    if (watch && blockNumber) {
      queryClient.invalidateQueries(queryKey, {}, { cancelRefetch: false })
    }
  }, [blockNumber, watch, queryClient, queryKey])

  const [sushiBalance, balance, pendingSushi] = useMemo(() => {
    const _sushiBalance = data?.[0] ? data?.[0] : undefined
    const _balance = data?.[1] ? (data?.[1] as [bigint, bigint])[0] : undefined

    const _pendingSushi = data?.[2] ? data?.[2] : undefined
    const balance = token
      ? Amount.fromRawAmount(token, _balance ? _balance.toString() : 0)
      : undefined
    const pendingSushi = SUSHI[chainId as keyof typeof SUSHI]
      ? Amount.fromRawAmount(
          SUSHI[chainId as keyof typeof SUSHI],
          _pendingSushi ? _pendingSushi.toString() : 0,
        )
      : undefined
    const sushiBalance = SUSHI[chainId as keyof typeof SUSHI]
      ? Amount.fromRawAmount(
          SUSHI[chainId as keyof typeof SUSHI],
          _sushiBalance ? _sushiBalance.toString() : 0,
        )
      : undefined
    return [sushiBalance, balance, pendingSushi]
  }, [chainId, data, token])

  const onSuccess = useCallback(
    (data: SendTransactionData) => {
      const ts = new Date().getTime()
      void createToast({
        account: address,
        type: 'claimRewards',
        chainId,
        txHash: data,
        promise: client.waitForTransactionReceipt({ hash: data }),
        summary: {
          pending: 'Claiming rewards',
          completed: 'Successfully claimed rewards',
          failed: 'Something went wrong when claiming rewards',
        },
        groupTimestamp: ts,
        timestamp: ts,
      })
    },
    [chainId, address, client],
  )

  const onError = useCallback((e: SendTransactionErrorType) => {
    if (e instanceof UserRejectedRequestError) {
      createErrorToast(e?.message, true)
    }
  }, [])

  const prepare = useMemo(() => {
    if (!address || !chainId || !data || !contract) return

    switch (chef) {
      case ChefType.MasterChefV1:
        return {
          account: address,
          to: contract.address,
          data: encodeFunctionData({
            abi: contract.abi,
            functionName: 'deposit',
            args: [BigInt(pid), 0n],
          }),
        }
      case ChefType.MasterChefV2: {
        if (
          pendingSushi &&
          sushiBalance &&
          pendingSushi.greaterThan(sushiBalance)
        ) {
          return {
            account: address,
            to: contract.address,
            data: encodeFunctionData({
              abi: masterChefV2Abi,
              functionName: 'batch',
              args: [
                [
                  encodeFunctionData({
                    abi: masterChefV2Abi,
                    functionName: 'harvestFromMasterChef',
                  }),
                  encodeFunctionData({
                    abi: masterChefV2Abi,
                    functionName: 'harvest',
                    args: [BigInt(pid), address],
                  }),
                ],
                false,
              ],
            }),
          }
        } else {
          return {
            account: address,
            to: contract.address,
            data: encodeFunctionData({
              abi: masterChefV2Abi,
              functionName: 'harvest',
              args: [BigInt(pid), address],
            }),
          }
        }
      }
      default:
        return {
          account: address,
          to: contract.address,
          data: encodeFunctionData({
            abi: miniChefV2Abi,
            functionName: 'harvest',
            args: [BigInt(pid), address],
          }),
        }
    }
  }, [address, chainId, chef, contract, data, pendingSushi, pid, sushiBalance])

  const {
    sendTransaction: _harvest,
    isLoading: isWritePending,
    isError: isWriteError,
  } = useSendTransaction({
    mutation: {
      onSuccess,
      onError,
    },
  })

  const harvest = useCallback(() => {
    if (!prepare) return
    _harvest(prepare)
  }, [_harvest, prepare])

  return useMemo(() => {
    return {
      harvest,
      balance,
      isLoading,
      isError,
      pendingSushi,
      isWritePending,
      isWriteError,
    }
  }, [
    balance,
    harvest,
    isError,
    isLoading,
    isWriteError,
    isWritePending,
    pendingSushi,
  ])
}
