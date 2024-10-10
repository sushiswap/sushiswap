'use client'

import { createErrorToast, createToast } from '@sushiswap/notifications'
import { STEER_PERIPHERY_ADDRESS, isSteerChainId } from '@sushiswap/steer-sdk'
import { steerPeripheryAbi } from '@sushiswap/steer-sdk/abi'
import {
  Button,
  Currency,
  DialogConfirm,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogProvider,
  DialogReview,
  DialogTitle,
  Dots,
  List,
} from '@sushiswap/ui'
import React, { FC, ReactNode, useCallback, useMemo } from 'react'
import { Chain } from 'sushi/chain'
import { Amount } from 'sushi/currency'
import { formatUSD } from 'sushi/format'
import {
  Address,
  SendTransactionReturnType,
  UserRejectedRequestError,
} from 'viem'

import { VaultV1 } from '@sushiswap/graph-client/data-api'
import { SlippageToleranceStorageKey } from '@sushiswap/hooks'
import { APPROVE_TAG_STEER } from 'src/lib/constants'
import { useSlippageTolerance } from 'src/lib/hooks/useSlippageTolerance'
import { useSteerAccountPosition } from 'src/lib/wagmi/hooks/steer/useSteerAccountPosition'
import { useApproved } from 'src/lib/wagmi/systems/Checker/Provider'
import { slippageAmount } from 'sushi'
import { UseSimulateContractParameters, usePublicClient } from 'wagmi'
import { useAccount } from 'wagmi'
import { useSimulateContract } from 'wagmi'
import { useWaitForTransactionReceipt } from 'wagmi'
import { useWriteContract } from 'wagmi'
import { useRefetchBalances } from '~evm/_common/ui/balance-provider/use-refetch-balances'
import { useTokenAmountDollarValues } from '../../../../../lib/hooks'
import { useSteerPositionAddDerivedInfo } from './SteerPositionAddProvider'

interface SteerPositionAddReviewModalProps {
  vault: VaultV1
  onSuccess: () => void
  successLink?: string
  children: ReactNode
}

export const SteerPositionAddReviewModal: FC<SteerPositionAddReviewModalProps> =
  ({ vault, onSuccess: _onSuccess, successLink, children }) => {
    const { currencies, parsedAmounts } = useSteerPositionAddDerivedInfo({
      vault,
    })

    const client = usePublicClient()
    const { address, chain } = useAccount()
    const [slippagePercent] = useSlippageTolerance(
      SlippageToleranceStorageKey.AddSteerLiquidity,
    )
    const { approved } = useApproved(APPROVE_TAG_STEER)

    const { data: accountPosition } = useSteerAccountPosition({
      account: address,
      vaultId: vault.id,
    })
    const accountPositionAmountsArray = useMemo(() => {
      if (!currencies || !accountPosition) return null

      const token0Amount = Amount.fromRawAmount(
        currencies.CURRENCY_A,
        accountPosition.token0Balance,
      )
      const token1Amount = Amount.fromRawAmount(
        currencies.CURRENCY_B,
        accountPosition.token1Balance,
      )

      return [token0Amount, token1Amount]
    }, [accountPosition, currencies])
    const accountPositionValues = useTokenAmountDollarValues({
      chainId: vault.chainId,
      amounts: accountPositionAmountsArray,
    })
    const accountPositionValue = useMemo(
      () => accountPositionValues.reduce((acc, cur) => acc + cur, 0),
      [accountPositionValues],
    )

    const parsedAmountsArray = useMemo(
      () =>
        parsedAmounts
          ? [parsedAmounts?.CURRENCY_A, parsedAmounts?.CURRENCY_B]
          : null,
      [parsedAmounts],
    )
    const newPositionValues = useTokenAmountDollarValues({
      chainId: vault.chainId,
      amounts: parsedAmountsArray,
    })
    const newPositionValue = useMemo(
      () => newPositionValues.reduce((acc, cur) => acc + cur, 0),
      [newPositionValues],
    )

    const { refetchChain: refetchBalances } = useRefetchBalances()

    const onSuccess = useCallback(
      (hash: SendTransactionReturnType) => {
        _onSuccess()

        if (!currencies) return

        const receipt = client.waitForTransactionReceipt({ hash })
        receipt.then(() => {
          refetchBalances(vault.chainId)
        })

        const ts = new Date().getTime()
        void createToast({
          account: address,
          type: 'mint',
          chainId: vault.chainId,
          txHash: hash,
          promise: receipt,
          summary: {
            pending: `Adding liquidity to the ${currencies.CURRENCY_A?.symbol}/${currencies.CURRENCY_B?.symbol} smart pool`,
            completed: `Successfully added liquidity to the ${currencies.CURRENCY_A?.symbol}/${currencies.CURRENCY_B?.symbol} smart pool`,
            failed: 'Something went wrong when adding liquidity',
          },
          timestamp: ts,
          groupTimestamp: ts,
        })
      },
      [refetchBalances, client, currencies, address, vault.chainId, _onSuccess],
    )

    const onError = useCallback((e: Error) => {
      if (!(e.cause instanceof UserRejectedRequestError)) {
        createErrorToast(e?.message, true)
      }
    }, [])

    const prepare = useMemo(() => {
      if (
        !address ||
        !currencies ||
        !parsedAmounts ||
        !isSteerChainId(vault.chainId)
      )
        return undefined

      return {
        address: STEER_PERIPHERY_ADDRESS[vault.chainId],
        abi: steerPeripheryAbi,
        chainId: vault.chainId,
        functionName: 'deposit',
        args: [
          vault.address as Address,
          parsedAmounts.CURRENCY_A.quotient,
          parsedAmounts.CURRENCY_B.quotient,
          slippageAmount(parsedAmounts.CURRENCY_A, slippagePercent)[0],
          slippageAmount(parsedAmounts.CURRENCY_B, slippagePercent)[0],
          address,
        ],
      } satisfies UseSimulateContractParameters
    }, [
      address,
      vault.chainId,
      currencies,
      parsedAmounts,
      slippagePercent,
      vault.address,
    ])

    const { data: simulation, isError } = useSimulateContract({
      ...prepare,
      query: {
        enabled: Boolean(approved && vault.chainId === chain?.id),
      },
    })

    // const { data: estimatedGas } = useEstimateGas({
    //   ...prepare,
    //   query: {
    //     enabled: Boolean(approved && chainId === chain?.id),
    //   },
    // })

    // const adjustedGas = estimatedGas ? gasMargin(estimatedGas) : undefined

    const {
      writeContractAsync,
      isPending: isWritePending,
      data: hash,
    } = useWriteContract({
      mutation: {
        onSuccess,
        onError,
      },
    })

    const write = useMemo(() => {
      if (!simulation) return undefined

      return async (confirm: () => void) => {
        try {
          await writeContractAsync({
            ...simulation.request,
            // gas: adjustedGas,
          })

          confirm()
        } catch {}
      }
    }, [writeContractAsync, simulation /*, adjustedGas*/])

    const { status } = useWaitForTransactionReceipt({
      chainId: vault.chainId,
      hash,
    })

    return (
      <DialogProvider>
        <DialogReview>
          {({ confirm }) => (
            <>
              {children}
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{vault.strategy}</DialogTitle>
                  <DialogDescription>Add liquidity</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <List className="!pt-0">
                    <List.Control>
                      <List.KeyValue flex title="Network">
                        {Chain.from(vault.chainId)!.name}
                      </List.KeyValue>
                    </List.Control>
                  </List>
                  <List className="!pt-0">
                    <List.Control>
                      {accountPosition?.steerTokenBalance !== 0n && (
                        <List.KeyValue flex title="Current Position Value">
                          {formatUSD(accountPositionValue)}
                        </List.KeyValue>
                      )}
                      <List.KeyValue flex title="New Position Value">
                        {formatUSD(newPositionValue)}
                      </List.KeyValue>
                    </List.Control>
                  </List>
                  <List className="!pt-0">
                    <List.Control>
                      {currencies && parsedAmounts && (
                        <>
                          <List.KeyValue
                            flex
                            title={`${currencies.CURRENCY_A.symbol}`}
                          >
                            <div className="flex items-center gap-2">
                              <Currency.Icon
                                currency={currencies.CURRENCY_A}
                                width={18}
                                height={18}
                              />
                              {parsedAmounts.CURRENCY_A?.toSignificant(6)}{' '}
                              {currencies.CURRENCY_A.symbol}
                            </div>
                          </List.KeyValue>

                          <List.KeyValue
                            flex
                            title={`${currencies.CURRENCY_B.symbol}`}
                          >
                            <div className="flex items-center gap-2">
                              <Currency.Icon
                                currency={currencies.CURRENCY_B}
                                width={18}
                                height={18}
                              />
                              {parsedAmounts.CURRENCY_B.toSignificant(6)}{' '}
                              {currencies.CURRENCY_B.symbol}
                            </div>
                          </List.KeyValue>
                        </>
                      )}
                    </List.Control>
                  </List>
                </div>
                <DialogFooter>
                  <Button
                    size="xl"
                    fullWidth
                    loading={!write || isWritePending}
                    onClick={() => write?.(confirm)}
                    testId="confirm-add-liquidity"
                    type="button"
                  >
                    {isError ? (
                      'Shoot! Something went wrong :('
                    ) : isWritePending ? (
                      <Dots>Confirm Add</Dots>
                    ) : (
                      'Add Liquidity'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </>
          )}
        </DialogReview>
        <DialogConfirm
          chainId={vault.chainId}
          status={status}
          testId="add-concentrated-liquidity-confirmation-modal"
          successMessage={`You successfully added liquidity to the ${vault.token0.symbol}/${vault.token1.symbol} pair`}
          txHash={hash}
          buttonLink={successLink}
          buttonText="View your position"
        />
      </DialogProvider>
    )
  }
