'use client'

import { createErrorToast, createToast } from '@sushiswap/notifications'
import { UseTradeReturn } from '@sushiswap/react-query'
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
import { log } from 'next-axiom'
import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { useSimulateTrade } from 'src/lib/hooks/useSimulateTrade'
import { useSlippageTolerance } from 'src/lib/hooks/useSlippageTolerance'
import { useBalanceWeb3Refetch } from 'src/lib/wagmi/hooks/balances/useBalanceWeb3Refetch'
import { useApproved } from 'src/lib/wagmi/systems/Checker/Provider'
import { Chain, ChainId } from 'sushi/chain'
import { Native } from 'sushi/currency'
import { shortenAddress } from 'sushi/format'
import { ZERO } from 'sushi/math'
import { Bridge, LiquidityProviders } from 'sushi/router'
import {
  SendTransactionReturnType,
  UserRejectedRequestError,
  stringify,
} from 'viem'
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
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

  const refetchBalances = useBalanceWeb3Refetch()

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

    log.error('swap prepare error', {
      route: stringify(trade?.route),
      slippageTolerance: slippagePercent.toPercentageString(),
      error: stringify(error),
    })
  }, [error, slippagePercent, trade?.route])

  const onSwapSuccess = useCallback(
    async (hash: SendTransactionReturnType) => {
      if (!trade || !chainId) return

      try {
        const ts = new Date().getTime()
        const receiptPromise = client.waitForTransactionReceipt({ hash })

        void createToast({
          account: address,
          type: 'swap',
          chainId: chainId,
          txHash: hash,
          promise: receiptPromise,
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

        const receipt = await receiptPromise
        {
          const trade = tradeRef.current
          if (receipt.status === 'success') {
            if (
              trade?.route?.legs?.every(
                (leg) =>
                  leg.poolName.startsWith('Wrap') ||
                  leg.poolName.startsWith(LiquidityProviders.SushiSwapV2) ||
                  leg.poolName.startsWith(LiquidityProviders.SushiSwapV3) ||
                  leg.poolName.startsWith(LiquidityProviders.Trident) ||
                  leg.poolName.startsWith(Bridge.BentoBox),
              )
            ) {
              log.info('internal route', {
                chainId: chainId,
                txHash: hash,
                exporerLink: Chain.txUrl(chainId, hash),
                route: stringify(trade?.route),
              })
            } else if (
              trade?.route?.legs?.some(
                (leg) =>
                  !leg.poolName.startsWith('Wrap') &&
                  (leg.poolName.startsWith(LiquidityProviders.SushiSwapV2) ||
                    leg.poolName.startsWith(LiquidityProviders.SushiSwapV3) ||
                    leg.poolName.startsWith(LiquidityProviders.Trident) ||
                    leg.poolName.startsWith(Bridge.BentoBox)),
              ) &&
              trade?.route?.legs?.some(
                (leg) =>
                  !leg.poolName.startsWith('Wrap') &&
                  (!leg.poolName.startsWith(LiquidityProviders.SushiSwapV2) ||
                    !leg.poolName.startsWith(LiquidityProviders.SushiSwapV3) ||
                    !leg.poolName.startsWith(LiquidityProviders.Trident) ||
                    !leg.poolName.startsWith(Bridge.BentoBox)),
              )
            ) {
              log.info('mix route', {
                chainId: chainId,
                txHash: hash,
                exporerLink: Chain.txUrl(chainId, hash),
                route: stringify(trade?.route),
              })
            } else if (
              trade?.route?.legs?.every(
                (leg) =>
                  leg.poolName.startsWith('Wrap') ||
                  (!leg.poolName.startsWith(LiquidityProviders.SushiSwapV2) &&
                    !leg.poolName.startsWith(LiquidityProviders.SushiSwapV3) &&
                    !leg.poolName.startsWith(LiquidityProviders.Trident) &&
                    !leg.poolName.startsWith(Bridge.BentoBox)),
              )
            ) {
              log.info('external route', {
                chainId: chainId,
                txHash: hash,
                exporerLink: Chain.txUrl(chainId, hash),
                route: stringify(trade?.route),
              })
            } else {
              log.info('unknown', {
                chainId: chainId,
                txHash: hash,
                exporerLink: Chain.txUrl(chainId, hash),
                route: stringify(trade?.route),
                args: stringify(trade?.writeArgs),
              })
            }
          } else {
            if (
              trade?.route?.legs?.every(
                (leg) =>
                  leg.poolName.startsWith('Wrap') ||
                  leg.poolName.startsWith(LiquidityProviders.SushiSwapV2) ||
                  leg.poolName.startsWith(LiquidityProviders.SushiSwapV3) ||
                  leg.poolName.startsWith(LiquidityProviders.Trident) ||
                  leg.poolName.startsWith(Bridge.BentoBox),
              )
            ) {
              log.error('internal route', {
                chainId: chainId,
                txHash: hash,
                route: stringify(trade?.route),
              })
            } else if (
              trade?.route?.legs?.some(
                (leg) =>
                  !leg.poolName.startsWith('Wrap') &&
                  (leg.poolName.startsWith(LiquidityProviders.SushiSwapV2) ||
                    leg.poolName.startsWith(LiquidityProviders.SushiSwapV3) ||
                    leg.poolName.startsWith(LiquidityProviders.Trident) ||
                    leg.poolName.startsWith(Bridge.BentoBox)),
              ) &&
              trade?.route?.legs?.some(
                (leg) =>
                  !leg.poolName.startsWith('Wrap') &&
                  (!leg.poolName.startsWith(LiquidityProviders.SushiSwapV2) ||
                    !leg.poolName.startsWith(LiquidityProviders.SushiSwapV3) ||
                    !leg.poolName.startsWith(LiquidityProviders.Trident) ||
                    !leg.poolName.startsWith(Bridge.BentoBox)),
              )
            ) {
              log.error('mix route', {
                chainId: chainId,
                txHash: hash,
                route: stringify(trade?.route),
              })
            } else if (
              trade?.route?.legs?.every(
                (leg) =>
                  leg.poolName.startsWith('Wrap') ||
                  (!leg.poolName.startsWith(LiquidityProviders.SushiSwapV2) &&
                    !leg.poolName.startsWith(LiquidityProviders.SushiSwapV3) &&
                    !leg.poolName.startsWith(LiquidityProviders.Trident) &&
                    !leg.poolName.startsWith(Bridge.BentoBox)),
              )
            ) {
              log.error('external route', {
                chainId: chainId,
                txHash: hash,
                route: stringify(trade?.route),
              })
            } else {
              log.error('unknown', {
                chainId: chainId,
                txHash: hash,
                route: stringify(trade?.route),
                args: stringify(trade?.writeArgs),
              })
            }
          }
        }
      } finally {
        setSwapAmount('')
        await refetchBalances()
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
    ],
  )

  const onSwapError = useCallback(
    (e: Error) => {
      if (e instanceof UserRejectedRequestError) {
        return
      }

      log.error('swap error', {
        route: stringify(trade?.route),
        args: stringify(trade?.writeArgs),
        error: stringify(e),
      })
      createErrorToast(e.message, false)
    },
    [trade?.route, trade?.writeArgs],
  )

  const {
    writeContractAsync,
    isLoading: isWritePending,
    data,
  } = useWriteContract({
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
    if (!writeContractAsync || !simulation) return undefined

    return async (confirm: () => void) => {
      try {
        await writeContractAsync(simulation.request)
        confirm()
      } catch {}
    }
  }, [simulation, writeContractAsync])

  const { status } = useWaitForTransactionReceipt({
    chainId: chainId,
    hash: data,
  })

  return (
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
                      High price impact. You will lose a significant portion of
                      your funds in this trade due to price impact.
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
                  <Button
                    fullWidth
                    size="xl"
                    loading={!write && !isError}
                    onClick={() => write?.(confirm)}
                    disabled={Boolean(
                      !!error ||
                        isWritePending ||
                        Boolean(
                          !writeContractAsync && swapAmount?.greaterThan(ZERO),
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
  )
}
