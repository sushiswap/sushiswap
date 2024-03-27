import { createErrorToast, createToast } from '@sushiswap/ui/components/toast'
import { SendTransactionReturnType } from '@wagmi/core'
import { useCallback, useMemo } from 'react'
import { SushiSwapV3FeeAmount } from 'sushi/config'
import { Amount, Token, Type } from 'sushi/currency'
import { Address, UserRejectedRequestError, encodeFunctionData } from 'viem'
import {
  UseSimulateContractParameters,
  usePublicClient,
  useSimulateContract,
  useWriteContract,
} from 'wagmi'

import { V3Migrator } from '../abis/V3Migrator'
import { V3MigrateAddress } from '../constants'
import { V3MigrateChainId } from '../types'

interface UseV3Migrate {
  chainId: V3MigrateChainId
  account: Address | undefined
  enabled?: boolean
  args: {
    pair: Address
    liquidityToMigrate: Amount<Type> | null | undefined
    percentageToMigrate: number
    token0: Token | undefined
    token1: Token | undefined
    fee: SushiSwapV3FeeAmount
    tickLower: number | undefined
    tickUpper: number | undefined
    amount0Min: bigint | undefined
    amount1Min: bigint | undefined
    recipient: Address | undefined
    deadline: bigint | undefined
    refundAsETH: boolean
    noLiquidity: boolean | undefined
    sqrtPrice: bigint | undefined
  }
}

export const V3MigrateContractConfig = (chainId: V3MigrateChainId) => ({
  address: V3MigrateAddress[chainId] as Address,
  abi: V3Migrator,
})

export const useV3Migrate = ({
  account,
  args,
  chainId,
  enabled = true,
}: UseV3Migrate) => {
  const client = usePublicClient()

  const { multicall: multicallContract, migrate: migrateContract } =
    useMemo(() => {
      if (
        typeof args.tickLower !== 'number' ||
        typeof args.tickUpper !== 'number' ||
        !args.liquidityToMigrate ||
        !args.amount0Min ||
        !args.amount1Min ||
        !args.recipient ||
        !args.token0 ||
        !args.token1 ||
        !args.deadline ||
        !args.sqrtPrice
      ) {
        return { multicall: null, migrate: null }
      }

      if (args.noLiquidity) {
        return {
          migrate: null,
          multicall: {
            ...V3MigrateContractConfig(chainId),
            chainId,
            functionName: 'multicall',
            args: [
              [
                encodeFunctionData({
                  abi: V3Migrator,
                  functionName: 'createAndInitializePoolIfNecessary',
                  args: [
                    args.token0.address as Address,
                    args.token1.address as Address,
                    args.fee,
                    args.sqrtPrice,
                  ],
                }),
                encodeFunctionData({
                  abi: V3Migrator,
                  functionName: 'migrate',
                  args: [
                    {
                      pair: args.pair,
                      liquidityToMigrate: args.liquidityToMigrate.quotient,
                      percentageToMigrate: args.percentageToMigrate,
                      token0: args.token0.address,
                      token1: args.token1.address,
                      fee: args.fee,
                      tickLower: args.tickLower,
                      tickUpper: args.tickUpper,
                      amount0Min: args.amount0Min,
                      amount1Min: args.amount1Min,
                      recipient: args.recipient,
                      deadline: args.deadline,
                      refundAsETH: args.refundAsETH,
                    },
                  ],
                }),
              ],
            ] as readonly [readonly `0x${string}`[]],
          } as const,
        }
      }

      return {
        multicall: null,
        migrate: {
          ...V3MigrateContractConfig(chainId),
          chainId,
          functionName: 'migrate',
          args: [
            {
              pair: args.pair,
              liquidityToMigrate: args.liquidityToMigrate.quotient,
              percentageToMigrate: args.percentageToMigrate,
              token0: args.token0.address,
              token1: args.token1.address,
              fee: args.fee,
              tickLower: args.tickLower,
              tickUpper: args.tickUpper,
              amount0Min: args.amount0Min,
              amount1Min: args.amount1Min,
              recipient: args.recipient,
              deadline: args.deadline,
              refundAsETH: args.refundAsETH,
            },
          ],
        } as const satisfies UseSimulateContractParameters,
      }
    }, [args, chainId])

  const { data: migrateSimulation, isError: isMigrateError } =
    useSimulateContract({
      ...migrateContract,
      query: {
        enabled: Boolean(enabled && migrateContract),
      },
    })

  const { data: multicallSimulation, isError: isMulticallError } =
    useSimulateContract({
      ...multicallContract,
      query: {
        enabled: Boolean(enabled && multicallContract),
      },
    })

  const simulation = migrateSimulation || multicallSimulation
  const isError = isMigrateError || isMulticallError

  const onSuccess = useCallback(
    (data: SendTransactionReturnType) => {
      if (!account) return

      const ts = new Date().getTime()
      void createToast({
        account,
        type: 'swap',
        chainId: chainId,
        txHash: data,
        promise: client.waitForTransactionReceipt({ hash: data }),
        summary: {
          pending: 'Migrating your liquidity',
          completed: 'Successfully migrated your liquidity',
          failed: 'Failed to migrate liquidity',
        },
        timestamp: ts,
        groupTimestamp: ts,
      })
    },
    [account, chainId, client],
  )

  const onError = useCallback((e: Error) => {
    if (e instanceof Error) {
      if (!(e instanceof UserRejectedRequestError)) {
        createErrorToast(e.message, true)
      }
    }
  }, [])

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
    isError,
  }
}
