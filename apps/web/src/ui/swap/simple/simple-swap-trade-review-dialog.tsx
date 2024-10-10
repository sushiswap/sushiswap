'use client'

import * as Sentry from '@sentry/nextjs'
import { createErrorToast, createToast } from '@sushiswap/notifications'
import {
  BrowserEvent,
  InterfaceElementName,
  InterfaceModalName,
  SwapEventName,
  Trace,
  TraceEvent,
  sendAnalyticsEvent,
  useTrace,
} from '@sushiswap/telemetry'
import {
  Button,
  DialogConfirm,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogProvider,
  DialogReview,
  DialogTitle,
  List,
  SkeletonBox,
  SkeletonText,
  classNames,
} from '@sushiswap/ui'
import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { UseTradeReturn } from 'src/lib/hooks/react-query'
import { useSimulateTrade } from 'src/lib/hooks/useSimulateTrade'
import { useSlippageTolerance } from 'src/lib/hooks/useSlippageTolerance'
import { useApproved } from 'src/lib/wagmi/systems/Checker/Provider'
import { Chain, ChainId } from 'sushi/chain'
import { Native } from 'sushi/currency'
import { shortenAddress } from 'sushi/format'
import { Percent, ZERO } from 'sushi/math'
import {
  SendTransactionReturnType,
  UserRejectedRequestError,
  stringify,
} from 'viem'
import {
  useAccount,
  usePublicClient,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { useRefetchBalances } from '~evm/_common/ui/balance-provider/use-refetch-balances'
import { APPROVE_TAG_SWAP } from '../../../lib/constants'
import {
  warningSeverity,
  warningSeverityClassName,
} from '../../../lib/swap/warningSeverity'
import {
  useDerivedStateSimpleSwap,
  useSimpleSwapTrade,
} from './derivedstate-simple-swap-provider'
import { SimpleSwapErrorMessage } from './simple-swap-error-message'

export const SimpleSwapTradeReviewDialog: FC<{
  children({
    error,
    isSuccess,
  }: { error: Error | null; isSuccess: boolean }): ReactNode
}> = ({ children }) => {
  const {
    state: { token0, token1, chainId, swapAmount, recipient },
    mutate: { setSwapAmount },
  } = useDerivedStateSimpleSwap()

  const { approved } = useApproved(APPROVE_TAG_SWAP)
  const [slippagePercent] = useSlippageTolerance()
  const { data: trade, isFetching } = useSimpleSwapTrade()
  const { address, chain } = useAccount()
  const tradeRef = useRef<UseTradeReturn | null>(null)
  const client = usePublicClient()

  const { refetchChain: refetchBalances } = useRefetchBalances()

  useEffect(() => {
    if (!trade) return
    Sentry.setContext('swap-context', {
      chainId,
      amountIn: trade?.amountIn?.toSignificant(6),
      amountOut: trade?.amountOut?.toSignificant(6),
      minAmountOut: trade?.minAmountOut?.toSignificant(6),
      fromToken: trade?.route?.fromToken,
      toToken: trade?.route?.toToken,
      priceImpact: trade?.priceImpact?.toPercentageString(),
      tokenTax:
        trade?.tokenTax instanceof Percent
          ? trade.tokenTax.toPercentageString()
          : trade?.tokenTax,
      tx: trade.tx,
    })
  }, [trade, chainId])

  const isWrap =
    token0?.isNative &&
    token1?.wrapped.address === Native.onChain(chainId).wrapped.address
  const isUnwrap =
    token1?.isNative &&
    token0?.wrapped.address === Native.onChain(chainId).wrapped.address
  const isSwap = !isWrap && !isUnwrap

  const {
    data: simulation,
    isError,
    error,
    isFetching: isPrepareFetching,
    isSuccess: isPrepareSuccess,
  } = useSimulateTrade({
    trade,
    enabled: Boolean(
      approved && chain?.id === chainId && token1?.chainId === chainId,
    ),
  })

  useEffect(() => {
    if (!error) return

    console.error('swap prepare error', error)
    const message = error.message.toLowerCase()
    if (
      message.includes('user rejected') ||
      message.includes('user cancelled')
    ) {
      return
    }

    sendAnalyticsEvent(SwapEventName.SWAP_ESTIMATE_GAS_CALL_FAILED, {
      route: stringify(trade?.route),
      slippageTolerance: slippagePercent.toPercentageString(),
      error: error.message,
    })
  }, [error, slippagePercent, trade?.route])

  const trace = useTrace()

  const onSwapSuccess = useCallback(
    async (hash: SendTransactionReturnType) => {
      if (!trade || !chainId) return

      try {
        const ts = new Date().getTime()
        const promise = client.waitForTransactionReceipt({
          hash,
        })

        sendAnalyticsEvent(SwapEventName.SWAP_SIGNED, {
          ...trace,
          route: stringify(trade?.route),
          txHash: hash,
        })

        void createToast({
          account: address,
          type: 'swap',
          chainId: chainId,
          txHash: hash,
          promise,
          summary: {
            pending: `${
              isWrap ? 'Wrapping' : isUnwrap ? 'Unwrapping' : 'Swapping'
            } ${trade.amountIn?.toSignificant(6)} ${
              trade.amountIn?.currency.symbol
            } ${
              isWrap ? 'to' : isUnwrap ? 'to' : 'for'
            } ${trade.amountOut?.toSignificant(6)} ${
              trade.amountOut?.currency.symbol
            }`,
            completed: `${
              isWrap ? 'Wrap' : isUnwrap ? 'Unwrap' : 'Swap'
            } ${trade.amountIn?.toSignificant(6)} ${
              trade.amountIn?.currency.symbol
            } ${
              isWrap ? 'to' : isUnwrap ? 'to' : 'for'
            } ${trade.amountOut?.toSignificant(6)} ${
              trade.amountOut?.currency.symbol
            }`,
            failed: `Something went wrong when trying to ${
              isWrap ? 'wrap' : isUnwrap ? 'unwrap' : 'swap'
            } ${trade.amountIn?.currency.symbol} ${
              isWrap ? 'to' : isUnwrap ? 'to' : 'for'
            } ${trade.amountOut?.currency.symbol}`,
          },
          timestamp: ts,
          groupTimestamp: ts,
        })

        const receipt = await promise
        {
          const trade = tradeRef.current
          if (receipt.status === 'success') {
            sendAnalyticsEvent(SwapEventName.SWAP_TRANSACTION_COMPLETED, {
              txHash: hash,
              from: receipt.from,
              chain_id: chainId,
              route: stringify(trade?.route),
              tx: stringify(trade?.tx),
            })
          } else {
            sendAnalyticsEvent(SwapEventName.SWAP_TRANSACTION_FAILED, {
              txHash: hash,
              from: receipt.from,
              chain_id: chainId,
              route: stringify(trade?.route),
              tx: stringify(trade?.tx),
            })
          }
        }
      } finally {
        setSwapAmount('')
        refetchBalances(chainId)
      }
    },
    [
      setSwapAmount,
      trade,
      chainId,
      client,
      address,
      isWrap,
      isUnwrap,
      refetchBalances,
      trace,
    ],
  )

  const onSwapError = useCallback(
    (e: Error) => {
      if (e.cause instanceof UserRejectedRequestError) {
        return
      }

      sendAnalyticsEvent(SwapEventName.SWAP_ERROR, {
        route: stringify(trade?.route),
        tx: stringify(trade?.tx),
        error: e instanceof Error ? e.message : undefined,
      })
      createErrorToast(e.message, false)
    },
    [trade?.route, trade?.tx],
  )

  const {
    sendTransactionAsync,
    isPending: isWritePending,
    data,
  } = useSendTransaction({
    mutation: {
      onMutate: () => {
        // Set reference of current trade
        if (tradeRef && trade) {
          tradeRef.current = trade
        }
      },
      onSuccess: onSwapSuccess,
      onError: onSwapError,
    },
  })

  const write = useMemo(() => {
    if (!sendTransactionAsync || !simulation) return undefined

    return async (confirm: () => void) => {
      try {
        await sendTransactionAsync(simulation)
        confirm()
      } catch (e) {
        Sentry.captureException(e)
        throw e
      }
    }
  }, [simulation, sendTransactionAsync])

  const { status } = useWaitForTransactionReceipt({
    chainId: chainId,
    hash: data,
  })

  return (
    <Trace modal={InterfaceModalName.CONFIRM_SWAP}>
      <DialogProvider>
        <DialogReview>
          {({ confirm }) => (
            <>
              <div className="flex flex-col">
                <SimpleSwapErrorMessage
                  error={error}
                  isSuccess={isPrepareSuccess}
                  isLoading={isPrepareFetching}
                />
                <div className="mt-4">
                  {children({ error, isSuccess: isPrepareSuccess })}
                </div>
              </div>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Buy {trade?.amountOut?.toSignificant(6)} {token1?.symbol}
                  </DialogTitle>
                  <DialogDescription>
                    {isWrap ? 'Wrap' : isUnwrap ? 'Unwrap' : 'Sell'}{' '}
                    {swapAmount?.toSignificant(6)} {token0?.symbol}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  {warningSeverity(trade?.priceImpact) >= 3 && (
                    <div className="px-4 py-3 mt-4 rounded-xl bg-red/20">
                      <span className="text-sm font-medium text-red-600">
                        High price impact. You will lose a significant portion
                        of your funds in this trade due to price impact.
                      </span>
                    </div>
                  )}
                  <List className="!pt-0">
                    <List.Control>
                      <List.KeyValue title="Network">
                        {Chain.from(chainId)?.name}
                      </List.KeyValue>
                      {isSwap && (
                        <List.KeyValue
                          title="Price impact"
                          subtitle="The impact your trade has on the market price of this pool."
                        >
                          <span
                            className={classNames(
                              warningSeverityClassName(
                                warningSeverity(trade?.priceImpact),
                              ),
                              'text-right',
                            )}
                          >
                            {isFetching ? (
                              <SkeletonBox className="h-4 py-0.5 w-[60px] rounded-md" />
                            ) : (
                              `${
                                trade?.priceImpact?.lessThan(ZERO)
                                  ? '+'
                                  : trade?.priceImpact?.greaterThan(ZERO)
                                    ? '-'
                                    : ''
                              }${Math.abs(
                                Number(trade?.priceImpact?.toFixed(2)),
                              )}%` ?? '-'
                            )}
                          </span>
                        </List.KeyValue>
                      )}
                      {isSwap && trade?.tokenTax && (
                        <List.KeyValue
                          title="Token tax"
                          subtitle="
                        Certain tokens incur a fee upon purchase or sale. Sushiswap does not collect any of these fees."
                        >
                          <span className="text-right text-yellow">
                            {trade.tokenTax.toPercentageString()}
                          </span>
                        </List.KeyValue>
                      )}
                      {isSwap && (
                        <List.KeyValue
                          title={`Min. received after slippage (${slippagePercent.toPercentageString()})`}
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
                      )}
                      <List.KeyValue title="Network fee">
                        {chainId === ChainId.SKALE_EUROPA ? (
                          'FREE'
                        ) : isFetching ||
                          !trade?.gasSpent ||
                          trade.gasSpent === '0' ? (
                          <SkeletonText
                            align="right"
                            fontSize="sm"
                            className="w-1/3"
                          />
                        ) : (
                          `${trade.gasSpent} ${Native.onChain(chainId).symbol}`
                        )}
                      </List.KeyValue>
                    </List.Control>
                  </List>
                  {recipient && (
                    <List className="!pt-0">
                      <List.Control>
                        <List.KeyValue title="Recipient">
                          <Button variant="link" size="sm" asChild>
                            <a
                              target="_blank"
                              href={
                                Chain.fromChainId(chainId)?.getAccountUrl(
                                  recipient,
                                ) ?? '#'
                              }
                              rel="noreferrer"
                            >
                              {shortenAddress(recipient)}
                            </a>
                          </Button>
                        </List.KeyValue>
                      </List.Control>
                    </List>
                  )}
                </div>
                <DialogFooter>
                  <div className="flex flex-col gap-4 w-full">
                    <TraceEvent
                      events={[BrowserEvent.onClick]}
                      element={InterfaceElementName.CONFIRM_SWAP_BUTTON}
                      name={SwapEventName.SWAP_SUBMITTED_BUTTON_CLICKED}
                      properties={{
                        route: stringify(trade?.route),
                        ...trace,
                      }}
                    >
                      <Button
                        fullWidth
                        size="xl"
                        loading={!write && !isError}
                        onClick={() => write?.(confirm)}
                        disabled={Boolean(
                          !!error ||
                            isWritePending ||
                            Boolean(
                              !sendTransactionAsync &&
                                swapAmount?.greaterThan(ZERO),
                            ) ||
                            isError,
                        )}
                        color={
                          isError
                            ? 'red'
                            : warningSeverity(trade?.priceImpact) >= 3
                              ? 'red'
                              : 'blue'
                        }
                        testId="confirm-swap"
                      >
                        {isError
                          ? 'Shoot! Something went wrong :('
                          : isWrap
                            ? 'Wrap'
                            : isUnwrap
                              ? 'Unwrap'
                              : `Swap ${token0?.symbol} for ${token1?.symbol}`}
                      </Button>
                    </TraceEvent>
                  </div>
                </DialogFooter>
              </DialogContent>
            </>
          )}
        </DialogReview>
        <DialogConfirm
          chainId={chainId}
          status={status}
          testId="make-another-swap"
          buttonText="Make another swap"
          txHash={data}
          successMessage={`You ${
            isWrap ? 'wrapped' : isUnwrap ? 'unwrapped' : 'sold'
          } ${tradeRef.current?.amountIn?.toSignificant(6)} ${token0?.symbol} ${
            isWrap ? 'to' : isUnwrap ? 'to' : 'for'
          } ${tradeRef.current?.amountOut?.toSignificant(6)} ${token1?.symbol}`}
        />
      </DialogProvider>
    </Trace>
  )
}
