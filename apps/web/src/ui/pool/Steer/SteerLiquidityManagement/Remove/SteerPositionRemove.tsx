'use client'

import { CogIcon } from '@heroicons/react-v1/solid'
import { SlippageToleranceStorageKey, useDebounce } from '@sushiswap/hooks'
import { createErrorToast, createToast } from '@sushiswap/notifications'
import { SteerVault, isSteerChainId } from '@sushiswap/steer-sdk'
import { steerMultiPositionManager } from '@sushiswap/steer-sdk/abi'
import {
  Button,
  Card,
  CardCurrencyAmountItem,
  CardGroup,
  CardLabel,
  IconButton,
  SettingsModule,
  SettingsOverlay,
  classNames,
} from '@sushiswap/ui'
import React, { FC, useCallback, useMemo, useState } from 'react'
import { useSlippageTolerance } from 'src/lib/hooks/useSlippageTolerance'
import { useSteerAccountPosition } from 'src/lib/wagmi/hooks/steer/useSteerAccountPosition'
import { Checker } from 'src/lib/wagmi/systems/Checker'
import { slippageAmount } from 'sushi'
import { Amount, Token } from 'sushi/currency'
import { Percent } from 'sushi/math'
import { SendTransactionReturnType, UserRejectedRequestError } from 'viem'
import {
  UseSimulateContractParameters,
  useAccount,
  usePublicClient,
  useSimulateContract,
  useWriteContract,
} from 'wagmi'
import { useRefetchBalances } from '~evm/_common/ui/balance-provider/use-refetch-balances'

interface SteerPositionRemoveProps {
  vault: SteerVault
}

export const SteerPositionRemove: FC<SteerPositionRemoveProps> = ({
  vault,
}) => {
  const client = usePublicClient()
  const { address: account, chain } = useAccount()
  const [value, setValue] = useState<string>('0')
  const [slippagePercent] = useSlippageTolerance(
    SlippageToleranceStorageKey.RemoveSteerLiquidity,
  )
  const debouncedValue = useDebounce(value, 300)

  const { data: position, isLoading: isPositionLoading } =
    useSteerAccountPosition({
      account: account,
      vaultId: vault.id,
    })

  const [token0, token1] = useMemo(() => {
    const token0 = new Token(vault.token0)
    const token1 = new Token(vault.token1)

    return [token0, token1]
  }, [vault])

  const tokenAmountsTotal = useMemo(() => {
    const token0Amount = Amount.fromRawAmount(
      token0,
      position?.token0Balance || 0n,
    )
    const token1Amount = Amount.fromRawAmount(
      token1,
      position?.token1Balance || 0n,
    )

    return [token0Amount, token1Amount]
  }, [position, token0, token1])

  const tokenAmountsDiscounted = useMemo(() => {
    const liquidityPercentage = new Percent(debouncedValue, 100)
    const token0Amount = Amount.fromRawAmount(
      token0,
      liquidityPercentage.multiply(tokenAmountsTotal[0].quotient).quotient,
    )
    const token1Amount = Amount.fromRawAmount(
      token1,
      liquidityPercentage.multiply(tokenAmountsTotal[1].quotient).quotient,
    )
    const steerTokenAmount = liquidityPercentage.multiply(
      position?.steerTokenBalance || 0n,
    ).quotient

    return { token0Amount, token1Amount, steerTokenAmount }
  }, [position, tokenAmountsTotal, debouncedValue, token0, token1])

  const { refetchChain: refetchBalances } = useRefetchBalances()

  const onSuccess = useCallback(
    (hash: SendTransactionReturnType) => {
      setValue('0')

      const receipt = client.waitForTransactionReceipt({ hash })
      receipt.then(() => {
        refetchBalances(vault.chainId)
      })

      const ts = new Date().getTime()
      void createToast({
        account,
        type: 'burn',
        chainId: vault.chainId,
        txHash: hash,
        promise: receipt,
        summary: {
          pending: `Removing liquidity from the ${token0.symbol}/${token1.symbol} smart pool`,
          completed: `Successfully removed liquidity from the ${token0.symbol}/${token1.symbol} smart pool`,
          failed: 'Something went wrong when removing liquidity',
        },
        timestamp: ts,
        groupTimestamp: ts,
      })
    },
    [
      refetchBalances,
      client,
      account,
      vault.chainId,
      token0.symbol,
      token1.symbol,
    ],
  )

  const onError = useCallback((e: Error) => {
    if (!(e.cause instanceof UserRejectedRequestError)) {
      createErrorToast(e?.message, true)
    }
  }, [])

  const prepare = useMemo(() => {
    if (
      !account ||
      !position ||
      position?.steerTokenBalance === 0n ||
      !tokenAmountsDiscounted ||
      !isSteerChainId(vault.chainId)
    )
      return undefined

    return {
      address: vault.address,
      chainId: vault.chainId,
      abi: steerMultiPositionManager,
      functionName: 'withdraw',
      args: [
        tokenAmountsDiscounted.steerTokenAmount,
        slippageAmount(tokenAmountsDiscounted.token0Amount, slippagePercent)[0],
        slippageAmount(tokenAmountsDiscounted.token1Amount, slippagePercent)[0],
        account,
      ],
    } satisfies UseSimulateContractParameters
  }, [
    account,
    vault.chainId,
    position,
    slippagePercent,
    tokenAmountsDiscounted,
    vault.address,
  ])

  const { data: simulation } = useSimulateContract({
    ...prepare,
    query: {
      enabled: prepare && vault.chainId === chain?.id,
    },
  })

  const { writeContractAsync, isPending: isWritePending } = useWriteContract({
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

  return (
    <div
      className={classNames(
        isPositionLoading || position?.steerTokenBalance === 0n
          ? 'opacity-40 pointer-events-none'
          : '',
        'flex flex-col gap-4',
      )}
    >
      <div className="p-3 pb-2 space-y-2 overflow-hidden bg-white border rounded-xl dark:bg-secondary border-accent">
        <div className="flex justify-between gap-4">
          <div>
            <h1 className="py-1 text-3xl text-gray-900 dark:text-slate-50">
              {value}%
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={value === '25' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setValue('25')}
              testId="liquidity-25"
            >
              25%
            </Button>
            <Button
              variant={value === '50' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setValue('50')}
              testId="liquidity-50"
            >
              50%
            </Button>
            <Button
              variant={value === '75' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setValue('75')}
              testId="liquidity-75"
            >
              75%
            </Button>
            <Button
              variant={value === '100' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setValue('100')}
              testId="liquidity-max"
            >
              Max
            </Button>
            <SettingsOverlay
              options={{
                slippageTolerance: {
                  storageKey: SlippageToleranceStorageKey.RemoveLiquidity,
                  title: 'Remove Liquidity Slippage',
                },
              }}
              modules={[SettingsModule.SlippageTolerance]}
            >
              <IconButton
                size="sm"
                name="Settings"
                icon={CogIcon}
                variant="secondary"
                className="!rounded-xl"
              />
            </SettingsOverlay>
          </div>
        </div>
        <div className="px-1 pt-2 pb-3">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type="range"
            min="1"
            max="100"
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700"
          />
        </div>
      </div>
      <Card variant="outline" className="p-6 space-y-6">
        <CardGroup>
          <CardLabel>{"You'll"} receive</CardLabel>
          <CardCurrencyAmountItem
            amount={tokenAmountsTotal?.[0].multiply(value).divide(100)}
          />
          <CardCurrencyAmountItem
            amount={tokenAmountsTotal?.[1].multiply(value).divide(100)}
          />
        </CardGroup>
      </Card>
      <Checker.Connect testId="connect" fullWidth variant="outline" size="xl">
        <Checker.Network
          testId="switch-network"
          fullWidth
          variant="outline"
          size="xl"
          chainId={vault.chainId}
        >
          <Button
            size="xl"
            loading={isWritePending}
            disabled={+value === 0 || !write}
            fullWidth
            onClick={write}
            testId="remove-or-add-steer-liquidity"
          >
            {+value === 0 ? 'Enter Amount' : 'Remove'}
          </Button>
        </Checker.Network>
      </Checker.Connect>
    </div>
  )
}
