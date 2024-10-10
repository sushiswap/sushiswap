'use client'

import {
  createErrorToast,
  createInfoToast,
  createToast,
} from '@sushiswap/notifications'
import {
  BrowserEvent,
  InterfaceElementName,
  SwapEventName,
  TraceEvent,
  sendAnalyticsEvent,
  useTrace,
} from '@sushiswap/telemetry'
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
import { Collapsible } from '@sushiswap/ui'
import { Button } from '@sushiswap/ui'
import { Dots } from '@sushiswap/ui'
import { List } from '@sushiswap/ui'
import { SkeletonText } from '@sushiswap/ui'
import { nanoid } from 'nanoid'
import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { APPROVE_TAG_XSWAP } from 'src/lib/constants'
import { UseCrossChainTradeReturn } from 'src/lib/hooks'
import { useSlippageTolerance } from 'src/lib/hooks/useSlippageTolerance'
import {
  SushiXSwap2Adapter,
  SushiXSwapFunctionName,
  SushiXSwapWriteArgsBridge,
  SushiXSwapWriteArgsSwapAndBridge,
  useAxelarScanLink,
  useLayerZeroScanLink,
} from 'src/lib/swap/cross-chain'
import { warningSeverity } from 'src/lib/swap/warningSeverity'
import { useApproved } from 'src/lib/wagmi/systems/Checker/Provider'
import { sushiXSwap2Abi_swap, sushiXSwap2Abi_swapAndBridge } from 'sushi/abi'
import { Chain, chainName } from 'sushi/chain'
import {
  SUSHIXSWAP_2_ADDRESS,
  SushiXSwap2ChainId,
  isSushiXSwap2ChainId,
} from 'sushi/config'
import { Native } from 'sushi/currency'
import { shortenAddress } from 'sushi/format'
import { ZERO } from 'sushi/math'
import {
  SendTransactionReturnType,
  UserRejectedRequestError,
  stringify,
} from 'viem'
import {
  useAccount,
  usePublicClient,
  useSimulateContract,
  useTransaction,
  useWriteContract,
} from 'wagmi'
import { useRefetchBalances } from '~evm/_common/ui/balance-provider/use-refetch-balances'
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

function getConfig(trade: UseCrossChainTradeReturn | undefined) {
  if (!trade) return {}

  if (trade.functionName === SushiXSwapFunctionName.Bridge) {
    return {
      abi: sushiXSwap2Abi_swap,
      functionName: 'swap',
      args: trade.writeArgs as NonNullable<SushiXSwapWriteArgsBridge>,
      value: BigInt(trade.value ?? 0) as any,
    } as const
  }

  if (trade.functionName === SushiXSwapFunctionName.SwapAndBridge) {
    return {
      abi: sushiXSwap2Abi_swapAndBridge,
      functionName: 'swapAndBridge',
      args: trade.writeArgs as NonNullable<SushiXSwapWriteArgsSwapAndBridge>,
      value: BigInt(trade.value ?? 0) as any,
    } as const
  }
}

export const CrossChainSwapTradeReviewDialog: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [slippagePercent] = useSlippageTolerance()
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
  const { refetchChain: refetchBalances } = useRefetchBalances()

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
    address: SUSHIXSWAP_2_ADDRESS[chainId0 as SushiXSwap2ChainId],
    ...getConfig(trade),
    query: {
      enabled: Boolean(
        isSushiXSwap2ChainId(chainId0) &&
          isSushiXSwap2ChainId(chainId1) &&
          trade?.writeArgs &&
          trade?.writeArgs.length > 0 &&
          chain?.id === chainId0 &&
          approved &&
          trade?.status !== 'NoWay',
      ),
    },
  })

  // onSimulateError
  useEffect(() => {
    if (error) {
      console.error('cross chain swap prepare error', error)
      if (error.message.startsWith('user rejected transaction')) return

      sendAnalyticsEvent(SwapEventName.XSWAP_ESTIMATE_GAS_CALL_FAILED, {
        error: error.message,
      })
    }
  }, [error])

  const trace = useTrace()

  const onWriteSuccess = useCallback(
    async (hash: SendTransactionReturnType) => {
      setStepStates({
        source: StepState.Pending,
        bridge: StepState.NotStarted,
        dest: StepState.NotStarted,
      })

      setSwapAmount('')

      if (!tradeRef?.current || !chainId0) return

      sendAnalyticsEvent(SwapEventName.XSWAP_SIGNED, {
        ...trace,
        txHash: hash,
      })

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
          sendAnalyticsEvent(SwapEventName.XSWAP_SRC_TRANSACTION_COMPLETED, {
            txHash: hash,
            address: receipt.from,
            src_chain_id: trade?.amountIn?.currency?.chainId,
            dst_chain_id: trade?.amountOut?.currency?.chainId,
            transaction_type: trade?.transactionType,
          })
        } else {
          sendAnalyticsEvent(SwapEventName.XSWAP_SRC_TRANSACTION_FAILED, {
            txHash: hash,
            address: receipt.from,
            src_chain_id: trade?.amountIn?.currency?.chainId,
            dst_chain_id: trade?.amountOut?.currency?.chainId,
            transaction_type: trade?.transactionType,
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
        setStepStates({
          source: StepState.Failed,
          bridge: StepState.NotStarted,
          dest: StepState.NotStarted,
        })
      } finally {
        refetchBalances(chainId0)
        setTradeId(nanoid())
      }
    },
    [
      trace,
      setSwapAmount,
      chainId0,
      client0,
      address,
      refetchBalances,
      setTradeId,
    ],
  )

  const onWriteError = useCallback((e: Error) => {
    setStepStates({
      source: StepState.Failed,
      bridge: StepState.NotStarted,
      dest: StepState.NotStarted,
    })

    if (e.cause instanceof UserRejectedRequestError) {
      return
    }

    createErrorToast(e.message, false)

    sendAnalyticsEvent(SwapEventName.XSWAP_ERROR, {
      error: e instanceof Error ? e.message : undefined,
    })
  }, [])

  const {
    writeContractAsync,
    isPending: isWritePending,
    data: hash,
    reset,
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

  // Speeds up typechecking in the useMemo below
  const _simulation: { request: any } | undefined = simulation

  const write = useMemo(() => {
    if (!_simulation?.request) return undefined

    return async (confirm: () => void) => {
      setStepStates({
        source: StepState.Sign,
        bridge: StepState.NotStarted,
        dest: StepState.NotStarted,
      })

      confirm()
      try {
        await writeContractAsync(_simulation.request)
      } catch {}
    }
  }, [writeContractAsync, _simulation?.request])

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
    if (axelarScanData?.status === 'partial_success') {
      setStepStates((prev) => ({
        ...prev,
        bridge: StepState.Success,
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
        promise: client1
          .waitForTransactionReceipt({
            hash: receipt.hash,
          })
          .catch((e) => {
            sendAnalyticsEvent(SwapEventName.XSWAP_DST_TRANSACTION_FAILED, {
              chain_id: chainId1,
              txHash: receipt.hash,
              error: e instanceof Error ? e.message : undefined,
            })
            throw e
          })
          .then(() => {
            sendAnalyticsEvent(SwapEventName.XSWAP_DST_TRANSACTION_COMPLETED, {
              chain_id: chainId1,
              txHash: axelarScanData?.dstTxHash,
            })
            refetchBalances(chainId1)
          })
          .then(reset),
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
                      {isFetching || !trade?.priceImpact ? (
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
                      title={`Min. received after slippage (${slippagePercent.toPercentageString()})`}
                      subtitle="The minimum amount you are guaranteed to receive."
                    >
                      {isFetching || !trade?.amountOutMin ? (
                        <SkeletonText
                          align="right"
                          fontSize="sm"
                          className="w-1/2"
                        />
                      ) : (
                        `${trade?.amountOutMin?.toSignificant(6)} ${
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
                <TraceEvent
                  events={[BrowserEvent.onClick]}
                  element={InterfaceElementName.CONFIRM_SWAP_BUTTON}
                  name={SwapEventName.XSWAP_SUBMITTED_BUTTON_CLICKED}
                  properties={{
                    ...trace,
                  }}
                >
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
                </TraceEvent>
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
                  bridgeUrl={getBridgeUrl(adapter, lzData, axelarScanData)}
                  adapter={adapter}
                  txHash={hash}
                  dstTxHash={getDstTxHash(adapter, lzData, axelarScanData)}
                  tradeRef={tradeRef}
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

const getBridgeUrl = (
  adapter: SushiXSwap2Adapter | undefined,
  lzData: Awaited<ReturnType<typeof useLayerZeroScanLink>>['data'],
  axelarScanData: Awaited<ReturnType<typeof useAxelarScanLink>>['data'],
) =>
  adapter === SushiXSwap2Adapter.Stargate ? lzData?.link : axelarScanData?.link

const getDstTxHash = (
  adapter: SushiXSwap2Adapter | undefined,
  lzData: Awaited<ReturnType<typeof useLayerZeroScanLink>>['data'],
  axelarScanData: Awaited<ReturnType<typeof useAxelarScanLink>>['data'],
) =>
  adapter === SushiXSwap2Adapter.Stargate
    ? lzData?.dstTxHash
    : axelarScanData?.dstTxHash
