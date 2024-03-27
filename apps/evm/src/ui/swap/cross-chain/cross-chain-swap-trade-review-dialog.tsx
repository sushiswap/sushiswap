'use client'

import { useSlippageTolerance } from '@sushiswap/hooks'
import {
  DialogClose,
  DialogContent,
  DialogCustom,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogProvider,
  DialogReview,
  DialogTitle,
  DialogType,
  Message,
} from '@sushiswap/ui'
import { Collapsible } from '@sushiswap/ui/components/animation/Collapsible'
import { Button } from '@sushiswap/ui/components/button'
import { Dots } from '@sushiswap/ui/components/dots'
import { List } from '@sushiswap/ui/components/list/List'
import { SkeletonText } from '@sushiswap/ui/components/skeleton'
import {
  createErrorToast,
  createInfoToast,
  createToast,
} from '@sushiswap/ui/components/toast'
import {
  getSushiXSwap2ContractConfig,
  useAccount,
  useBalanceWeb3Refetch,
  usePublicClient,
  useSimulateContract,
  useTransaction,
  useWriteContract,
} from '@sushiswap/wagmi'
import { nanoid } from 'nanoid'
import { log } from 'next-axiom'
import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Chain, chainName } from 'sushi/chain'
import { SushiXSwap2ChainId, isSushiXSwap2ChainId } from 'sushi/config'
import { shortenAddress } from 'sushi/format'
import { ZERO } from 'sushi/math'
import {
  SendTransactionReturnType,
  UserRejectedRequestError,
  stringify,
} from 'viem'

import { useApproved } from '@sushiswap/wagmi/systems/Checker/Provider'
import { APPROVE_TAG_XSWAP } from 'src/lib/constants'
import { SushiXSwap2Adapter } from 'src/lib/swap/useCrossChainTrade/SushiXSwap2'
import { UseCrossChainTradeReturn } from 'src/lib/swap/useCrossChainTrade/types'
import { useAxelarScanLink } from 'src/lib/swap/useCrossChainTrade/useAxelarScanLink'
import { useLayerZeroScanLink } from 'src/lib/swap/useCrossChainTrade/useLayerZeroScanLink'
import { warningSeverity } from 'src/lib/swap/warningSeverity'
import { Native } from 'sushi/currency'
import {
  ConfirmationDialogContent,
  Divider,
  GetStateComponent,
  StepState,
  failedState,
  finishedState,
} from './cross-chain-swap-confirmation-dialog'
import { CrossChainSwapTradeReviewRoute } from './cross-chain-swap-trade-review-route'
import {
  useCrossChainSwapTrade,
  useDerivedStateCrossChainSwap,
} from './derivedstate-cross-chain-swap-provider'

export const CrossChainSwapTradeReviewDialog: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [slippageTolerance] = useSlippageTolerance()
  const { address, chain } = useAccount()
  const {
    mutate: { setTradeId, setSwapAmount },
    state: {
      adapter,
      recipient,
      swapAmount,
      swapAmountString,
      chainId0,
      token0,
      token1,
      chainId1,
      tradeId,
    },
  } = useDerivedStateCrossChainSwap()
  const client0 = usePublicClient({ chainId: chainId0 })
  const client1 = usePublicClient({ chainId: chainId1 })
  const { data: trade, isFetching } = useCrossChainSwapTrade()
  const { approved } = useApproved(APPROVE_TAG_XSWAP)
  const groupTs = useRef<number>()
  const refetchBalances = useBalanceWeb3Refetch()

  const [stepStates, setStepStates] = useState<{
    source: StepState
    bridge: StepState
    dest: StepState
  }>({
    source: StepState.Success,
    bridge: StepState.Success,
    dest: StepState.Success,
  })

  const tradeRef = useRef<UseCrossChainTradeReturn | null>(null)

  const {
    data: simulation,
    isError,
    error,
  } = useSimulateContract({
    ...getSushiXSwap2ContractConfig(chainId0 as SushiXSwap2ChainId),
    functionName: trade?.functionName,
    args: trade?.writeArgs,
    value: trade?.value ?? 0n,
    query: {
      enabled: Boolean(
        isSushiXSwap2ChainId(chainId0) &&
          isSushiXSwap2ChainId(chainId1) &&
          trade?.writeArgs &&
          trade?.writeArgs.length > 0 &&
          chain?.id === chainId0 &&
          approved &&
          trade?.route?.status !== 'NoWay',
      ),
    },
  })

  // onSimulateError
  useEffect(() => {
    if (error) {
      console.error('cross chain swap prepare error', error)
      if (error.message.startsWith('user rejected transaction')) return
      log.error('cross chain swap prepare error', {
        trade: stringify(trade),
        error: stringify(error),
      })
    }
  }, [error, trade])

  const onComplete = useCallback(() => {
    // Reset after half a second because of dialog close animation
    setTimeout(() => {
      setStepStates({
        source: StepState.NotStarted,
        bridge: StepState.NotStarted,
        dest: StepState.NotStarted,
      })
    }, 500)
  }, [])

  const onWriteSuccess = useCallback(
    async (hash: SendTransactionReturnType) => {
      setStepStates({
        source: StepState.Pending,
        bridge: StepState.NotStarted,
        dest: StepState.NotStarted,
      })

      setSwapAmount('')

      if (!tradeRef?.current || !chainId0) return

      const receiptPromise = client0.waitForTransactionReceipt({ hash })

      groupTs.current = new Date().getTime()
      void createToast({
        account: address,
        type: 'swap',
        chainId: chainId0,
        txHash: hash,
        promise: receiptPromise,
        summary: {
          pending: `Swapping ${tradeRef?.current?.amountIn?.toSignificant(6)} ${
            tradeRef?.current?.amountIn?.currency.symbol
          } to bridge token ${tradeRef?.current?.srcBridgeToken?.symbol}`,
          completed: `Swap ${tradeRef?.current?.amountIn?.toSignificant(6)} ${
            tradeRef?.current?.amountIn?.currency.symbol
          } to bridge token ${tradeRef?.current?.srcBridgeToken?.symbol}`,
          failed: `Something went wrong when trying to swap ${tradeRef?.current?.amountIn?.currency.symbol} to bridge token`,
        },
        timestamp: groupTs.current,
        groupTimestamp: groupTs.current,
      })

      try {
        const receipt = await receiptPromise
        const trade = tradeRef.current
        if (receipt.status === 'success') {
          log.info('cross chain swap success (source)', {
            trade: stringify(trade),
          })
        } else {
          log.error('cross chain swap failed (source)', {
            trade: stringify(trade),
          })

          setStepStates({
            source: StepState.Failed,
            bridge: StepState.NotStarted,
            dest: StepState.NotStarted,
          })
        }

        setStepStates({
          source: StepState.Success,
          bridge: StepState.Pending,
          dest: StepState.NotStarted,
        })
      } catch {
        log.error('cross chain swap error (source)', {
          trade: stringify(trade),
        })
        setStepStates({
          source: StepState.Failed,
          bridge: StepState.NotStarted,
          dest: StepState.NotStarted,
        })
      } finally {
        await refetchBalances()
        setTradeId(nanoid())
      }
    },
    [
      setSwapAmount,
      chainId0,
      client0,
      address,
      trade,
      refetchBalances,
      setTradeId,
    ],
  )

  const onWriteError = useCallback(
    (e: Error) => {
      if (e instanceof UserRejectedRequestError) {
        onComplete()
        return
      }

      setStepStates({
        source: StepState.Failed,
        bridge: StepState.NotStarted,
        dest: StepState.NotStarted,
      })

      createErrorToast(e.message, false)

      log.error('cross chain swap error', {
        trade: stringify(trade),
        error: stringify(e),
      })
    },
    [onComplete, trade],
  )

  const {
    writeContractAsync,
    isLoading: isWritePending,
    data: hash,
  } = useWriteContract({
    mutation: {
      onSuccess: onWriteSuccess,
      onError: onWriteError,
      onMutate: () => {
        if (tradeRef && trade) {
          tradeRef.current = trade
        }
      },
    },
  })

  const write = useMemo(() => {
    if (!simulation) return undefined

    return async (confirm: () => void) => {
      setStepStates({
        source: StepState.Sign,
        bridge: StepState.NotStarted,
        dest: StepState.NotStarted,
      })

      confirm()
      try {
        await writeContractAsync(simulation.request)
      } catch {}
    }
  }, [writeContractAsync, simulation])

  const { data: lzData } = useLayerZeroScanLink({
    tradeId,
    network1: chainId1,
    network0: chainId0,
    txHash: hash,
    enabled: adapter === SushiXSwap2Adapter.Stargate,
  })

  const { data: axelarScanData } = useAxelarScanLink({
    tradeId,
    network1: chainId1,
    network0: chainId0,
    txHash: hash,
    enabled: adapter === SushiXSwap2Adapter.Squid,
  })

  const { data: receipt } = useTransaction({
    chainId: chainId1,
    hash: (adapter === SushiXSwap2Adapter.Stargate
      ? lzData?.dstTxHash
      : axelarScanData?.dstTxHash) as `0x${string}` | undefined,
    query: {
      enabled: Boolean(
        adapter === SushiXSwap2Adapter.Stargate
          ? lzData?.dstTxHash
          : axelarScanData?.dstTxHash,
      ),
    },
  })

  useEffect(() => {
    if (lzData?.status === 'DELIVERED') {
      setStepStates({
        source: StepState.Success,
        bridge: StepState.Success,
        dest: StepState.Success,
      })
    }
    if (lzData?.status === 'FAILED') {
      setStepStates((prev) => ({
        ...prev,
        dest: StepState.PartialSuccess,
      }))
    }
  }, [lzData?.status])

  useEffect(() => {
    if (axelarScanData?.status === 'success') {
      setStepStates({
        source: StepState.Success,
        bridge: StepState.Success,
        dest: StepState.Success,
      })
    }
    if (axelarScanData?.status === 'executed') {
      setStepStates((prev) => ({
        ...prev,
        dest: StepState.PartialSuccess,
      }))
    }
  }, [axelarScanData?.status])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (
      axelarScanData?.link &&
      groupTs.current &&
      stepStates.source === StepState.Success
    ) {
      void createInfoToast({
        account: address,
        type: 'squid',
        chainId: chainId0,
        href: axelarScanData.link,
        summary: `Bridging ${tradeRef?.current?.srcBridgeToken?.symbol} from ${
          Chain.from(chainId0)?.name
        } to ${Chain.from(chainId1)?.name}`,
        timestamp: new Date().getTime(),
        groupTimestamp: groupTs.current,
      })
    }
  }, [axelarScanData?.link])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (
      lzData?.link &&
      groupTs.current &&
      stepStates.source === StepState.Success
    ) {
      void createInfoToast({
        account: address,
        type: 'stargate',
        chainId: chainId0,
        href: lzData.link,
        summary: `Bridging ${tradeRef?.current?.srcBridgeToken?.symbol} from ${
          Chain.from(chainId0)?.name
        } to ${Chain.from(chainId1)?.name}`,
        timestamp: new Date().getTime(),
        groupTimestamp: groupTs.current,
      })
    }
  }, [lzData?.link])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (receipt && groupTs.current) {
      void createToast({
        account: address,
        type: 'swap',
        chainId: chainId1,
        txHash: receipt.hash,
        promise: client1.waitForTransactionReceipt({
          hash: receipt.hash,
        }),
        summary: {
          pending: `Swapping ${
            tradeRef?.current?.dstBridgeToken?.symbol
          } to ${tradeRef?.current?.amountOut?.toSignificant(6)} ${
            tradeRef?.current?.amountOut?.currency.symbol
          }`,
          completed: `Swap ${
            tradeRef?.current?.dstBridgeToken?.symbol
          } to ${tradeRef?.current?.amountOut?.toSignificant(6)} ${
            tradeRef?.current?.amountOut?.currency.symbol
          }`,
          failed: `Something went wrong when trying to swap ${
            tradeRef?.current?.dstBridgeToken?.symbol
          } to ${tradeRef?.current?.amountOut?.toSignificant(6)} ${
            tradeRef?.current?.amountOut?.currency.symbol
          }`,
        },
        timestamp: new Date().getTime(),
        groupTimestamp: groupTs.current,
      })
    }
  }, [receipt])

  return (
    <DialogProvider>
      <DialogReview>
        {({ confirm }) => (
          <>
            <div className="flex flex-col">
              <Collapsible
                open={Boolean(
                  +swapAmountString > 0 &&
                    stringify(error).includes('insufficient funds'),
                )}
              >
                <div className="pt-4">
                  <Message size="sm" variant="destructive">
                    Insufficient {Native.onChain(chainId0).symbol} balance on{' '}
                    {Chain.fromChainId(chainId0)?.name} to cover the network
                    fee. Please lower your input amount or{' '}
                    <a
                      href={`/swap?chainId=${chainId0}&token0=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&token1=NATIVE`}
                      className="underline decoration-dotted underline-offset-2"
                    >
                      swap for more {Native.onChain(chainId0).symbol}
                    </a>
                    .
                  </Message>
                </div>
              </Collapsible>
              <div className="mt-4">{children}</div>
            </div>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isFetching ? (
                    <SkeletonText fontSize="xs" className="w-2/3" />
                  ) : (
                    `Receive ${trade?.amountOut?.toSignificant(6)} ${
                      token1?.symbol
                    }`
                  )}
                </DialogTitle>
                <DialogDescription>
                  Swap {swapAmount?.toSignificant(6)} {token0?.symbol}{' '}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 overflow-x-hidden">
                <List>
                  <List.Control>
                    <List.KeyValue title="Network">
                      <div className="justify-end w-full gap-1 truncate whitespace-nowrap">
                        {chainName?.[chainId0]
                          ?.replace('Mainnet Shard 0', '')
                          ?.replace('Mainnet', '')
                          ?.trim()}
                        <br />
                        <span className="text-gray-400 dark:text-slate-500">
                          to
                        </span>{' '}
                        {chainName?.[chainId1]
                          ?.replace('Mainnet Shard 0', '')
                          ?.replace('Mainnet', '')
                          ?.trim()}
                      </div>
                    </List.KeyValue>
                    <List.KeyValue
                      title="Price impact"
                      subtitle="The impact your trade has on the market price of this pool."
                    >
                      {isFetching ? (
                        <SkeletonText
                          align="right"
                          fontSize="sm"
                          className="w-1/5"
                        />
                      ) : (
                        `${
                          trade?.priceImpact?.lessThan(ZERO)
                            ? '+'
                            : trade?.priceImpact?.greaterThan(ZERO)
                              ? '-'
                              : ''
                        }${Math.abs(Number(trade?.priceImpact?.toFixed(2)))}%`
                      )}
                    </List.KeyValue>
                    <List.KeyValue
                      title={`Min. received after slippage (${
                        slippageTolerance === 'AUTO' ? '0.5' : slippageTolerance
                      }%)`}
                      subtitle="The minimum amount you are guaranteed to receive."
                    >
                      {isFetching ? (
                        <SkeletonText
                          align="right"
                          fontSize="sm"
                          className="w-1/2"
                        />
                      ) : (
                        `${trade?.minAmountOut?.toSignificant(6)} ${
                          token1?.symbol
                        }`
                      )}
                    </List.KeyValue>
                  </List.Control>
                </List>
                <List className="!pt-2">
                  <List.Control>
                    <CrossChainSwapTradeReviewRoute />
                  </List.Control>
                </List>
                {recipient && (
                  <List className="!pt-2">
                    <List.Control>
                      <List.KeyValue title="Recipient">
                        <a
                          target="_blank"
                          href={Chain.accountUrl(chainId0, recipient) ?? '#'}
                          className="flex items-center gap-2 cursor-pointer text-blue"
                          rel="noreferrer"
                        >
                          {shortenAddress(recipient)}
                        </a>
                      </List.KeyValue>
                    </List.Control>
                  </List>
                )}
              </div>
              <DialogFooter>
                <Button
                  fullWidth
                  size="xl"
                  loading={!write && !isError}
                  onClick={() => write?.(confirm)}
                  disabled={
                    isWritePending ||
                    Boolean(!write && +swapAmountString > 0) ||
                    isError
                  }
                  color={
                    isError
                      ? 'red'
                      : warningSeverity(trade?.priceImpact) >= 3
                        ? 'red'
                        : 'blue'
                  }
                  testId="confirm-swap"
                >
                  {isError ? (
                    'Shoot! Something went wrong :('
                  ) : isWritePending ? (
                    <Dots>Confirm Swap</Dots>
                  ) : (
                    `Swap ${token0?.symbol} for ${token1?.symbol}`
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </>
        )}
      </DialogReview>
      <DialogCustom dialogType={DialogType.Confirm}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Cross-chain swap</DialogTitle>
            <DialogDescription asChild>
              <div>
                <ConfirmationDialogContent
                  dialogState={stepStates}
                  bridgeUrl={
                    adapter === SushiXSwap2Adapter.Stargate
                      ? lzData?.link
                      : axelarScanData?.link
                  }
                  adapter={adapter}
                  txHash={hash}
                  dstTxHash={
                    adapter === SushiXSwap2Adapter.Stargate
                      ? lzData?.dstTxHash
                      : axelarScanData?.dstTxHash
                  }
                />
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="py-5">
              <div className="relative flex gap-3">
                <GetStateComponent index={1} state={stepStates.source} />
                <Divider />
                <GetStateComponent index={2} state={stepStates.bridge} />
                <Divider />
                <GetStateComponent index={3} state={stepStates.dest} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button size="xl" fullWidth id="swap-dialog-close">
                {failedState(stepStates)
                  ? 'Try again'
                  : finishedState(stepStates)
                    ? 'Make another swap'
                    : 'Close'}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogCustom>
    </DialogProvider>
  )
}
