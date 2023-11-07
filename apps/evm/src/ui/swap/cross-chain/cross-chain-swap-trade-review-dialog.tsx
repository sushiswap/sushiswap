'use client'

import { useSlippageTolerance } from '@sushiswap/hooks'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogProvider,
  DialogReview,
  DialogSuccess,
  DialogTitle,
  Message,
  useToast,
} from '@sushiswap/ui'
import { Collapsible } from '@sushiswap/ui/components/animation/Collapsible'
import { Button } from '@sushiswap/ui/components/button'
import { Dots } from '@sushiswap/ui/components/dots'
import { List } from '@sushiswap/ui/components/list/List'
import { SkeletonText } from '@sushiswap/ui/components/skeleton'
import {
  getSushiXSwap2ContractConfig,
  useAccount,
  useBalanceWeb3Refetch,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from '@sushiswap/wagmi'
import {
  SendTransactionResult,
  waitForTransaction,
} from '@sushiswap/wagmi/actions'
import { nanoid } from 'nanoid'
import { log } from 'next-axiom'
import React, { FC, ReactNode, useCallback, useRef } from 'react'
import { gasMargin } from 'sushi/calculate'
import { Chain, chainName } from 'sushi/chain'
import {
  StargateChainId,
  SushiXSwap2ChainId,
  isSushiXSwap2ChainId,
} from 'sushi/config'
import { shortenAddress } from 'sushi/format'
import { ZERO } from 'sushi/math'
import { stringify } from 'viem'

import { useApproved } from '@sushiswap/wagmi/systems/Checker/Provider'
import { APPROVE_TAG_XSWAP } from 'src/lib/constants'
import { UseCrossChainTradeReturn } from '../../../lib/swap/useCrossChainTrade/types'
import { warningSeverity } from '../../../lib/swap/warningSeverity'
import { useCrossChainSwapPendingTransactionsActions } from './cross-chain-swap-pending-transactions-provider'
import {
  useCrossChainSwapTrade,
  useDerivedStateCrossChainSwap,
} from './derivedstate-cross-chain-swap-provider'

export const CrossChainSwapTradeReviewDialog: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [slippageTolerance] = useSlippageTolerance()
  const { address } = useAccount()
  const { chain } = useNetwork()
  const {
    mutate: { setTradeId, setSwapAmount },
    state: {
      tradeId,
      recipient,
      swapAmount,
      swapAmountString,
      chainId0,
      token0,
      token1,
      chainId1,
    },
  } = useDerivedStateCrossChainSwap()
  const { data: trade, isFetching } = useCrossChainSwapTrade()
  const { approved } = useApproved(APPROVE_TAG_XSWAP)
  const refetchBalances = useBalanceWeb3Refetch()
  const { toast } = useToast()
  const { push } = useCrossChainSwapPendingTransactionsActions()

  const tradeRef = useRef<UseCrossChainTradeReturn | null>(null)

  const { config, isError, error } = usePrepareContractWrite({
    ...getSushiXSwap2ContractConfig(chainId0 as SushiXSwap2ChainId),
    functionName: trade?.functionName,
    args: trade?.writeArgs,
    enabled: Boolean(
      isSushiXSwap2ChainId(chainId0) &&
        isSushiXSwap2ChainId(chainId1) &&
        trade?.writeArgs &&
        trade?.writeArgs.length > 0 &&
        chain?.id === chainId0 &&
        approved &&
        trade?.route?.status !== 'NoWay',
    ),
    value: trade?.value ?? 0n,
    onError: (error) => {
      console.error('cross chain swap prepare error', error)
      if (error.message.startsWith('user rejected transaction')) return
      log.error('cross chain swap prepare error', {
        trade: stringify(trade),
        error: stringify(error),
      })
    },
  })

  const onSettled = useCallback(
    (data: SendTransactionResult | undefined) => {
      const trade = tradeRef.current
      if (!trade || !chainId0 || !data || !address) return

      // For showing tx status on the page
      if (trade.amountIn && trade.amountOut) {
        push({
          tradeId,
          txHash: data.hash,
          amountOut: trade.amountOut,
          amountIn: trade.amountIn,
          chainId0: trade.amountIn.currency.chainId as StargateChainId,
          chainId1: trade.amountOut.currency.chainId as StargateChainId,
        })
      }

      waitForTransaction({ chainId: chainId0, hash: data.hash }).catch(() => {
        toast({
          variant: 'destructive',
          description: (
            <>
              <b>Oops!</b> Something went wrong.
            </>
          ),
        })
      })
    },
    [chainId0, address, push, tradeId, toast],
  )

  const {
    writeAsync,
    isLoading: isWritePending,
    data,
  } = useContractWrite({
    ...config,
    request: config?.request
      ? {
          ...config.request,
          gas:
            typeof config.request.gas === 'bigint'
              ? gasMargin(config.request.gas)
              : undefined,
        }
      : undefined,
    onMutate: () => {
      // Set reference of current trade
      if (tradeRef && trade) {
        tradeRef.current = trade
      }
    },
    onSuccess: async (data) => {
      // Clear input fields
      setSwapAmount('')

      waitForTransaction({ hash: data.hash })
        .then((receipt) => {
          const trade = tradeRef.current
          if (receipt.status === 'success') {
            log.info('cross chain swap success (source)', {
              trade: stringify(trade),
            })
          } else {
            log.error('cross chain swap failed (source)', {
              trade: stringify(trade),
            })
          }
        })
        .catch(() => {
          log.error('cross chain swap error (source)', {
            trade: stringify(trade),
          })
        })
        .finally(async () => {
          await refetchBalances()
          setTradeId(nanoid())
        })
    },
    onSettled,
    onError: (error) => {
      if (error.message.startsWith('user rejected transaction')) return
      log.error('cross chain swap error', {
        trade: stringify(trade),
        error: stringify(error),
      })

      toast({
        variant: 'destructive',
        description: <>Transaction rejected.</>,
      })
    },
  })

  return (
    <DialogProvider>
      <DialogReview>
        {({ confirm, close }) => (
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
                    Insufficient funds to pay for gas on the destination chain.
                    Please lower your input amount.
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
              <div className="flex flex-col gap-4">
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
                  loading={!writeAsync && !isError}
                  onClick={() => writeAsync?.().then(confirm).catch(close)}
                  disabled={
                    isWritePending ||
                    Boolean(!writeAsync && +swapAmountString > 0) ||
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
      <DialogSuccess
        chainId={chainId0}
        testId="make-another-swap"
        buttonText="Close"
        hash={data?.hash}
        summary={`Swapping ${
          tradeRef?.current?.dstBridgeToken?.symbol
        } to ${tradeRef?.current?.amountOut?.toSignificant(6)} ${
          tradeRef?.current?.amountOut?.currency.symbol
        }`}
      />
    </DialogProvider>
  )
}
