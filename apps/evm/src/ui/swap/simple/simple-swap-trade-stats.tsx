'use client'

import { Collapsible, Explainer, SkeletonBox, classNames } from '@sushiswap/ui'
import { Address, useAccount } from '@sushiswap/wagmi'
import { AddressToEnsResolver } from '@sushiswap/wagmi/components/account/AddressToEnsResolver'
import React, { FC } from 'react'
import { Chain } from 'sushi/chain'
import { Native } from 'sushi/currency'
import { shortenAddress } from 'sushi/format'
import { ZERO } from 'sushi/math'
import { isAddress } from 'viem'
import {
  warningSeverity,
  warningSeverityClassName,
} from '../../../lib/swap/warningSeverity'
import { TradeRoutePathView } from '../trade-route-path-view'
import {
  useDerivedStateSimpleSwap,
  useSimpleSwapTrade,
} from './derivedstate-simple-swap-provider'

export const SimpleSwapTradeStats: FC = () => {
  const { address } = useAccount()
  const {
    state: { chainId, swapAmountString, recipient },
  } = useDerivedStateSimpleSwap()
  const { isInitialLoading: isLoading, data: trade } = useSimpleSwapTrade()
  const loading = Boolean(isLoading && !trade?.writeArgs)

  return (
    <Collapsible
      open={+swapAmountString > 0 && trade?.route?.status !== 'NoWay'}
    >
      <div className="w-full px-2 flex flex-col gap-1">
        <div className="flex justify-between items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-slate-400">
            Price impact
          </span>
          <span
            className={classNames(
              warningSeverityClassName(warningSeverity(trade?.priceImpact)),
              'text-sm font-semibold text-gray-700 text-right dark:text-slate-400',
            )}
          >
            {loading || !trade?.priceImpact ? (
              <SkeletonBox className="h-4 py-0.5 w-[40px]" />
            ) : trade?.priceImpact ? (
              `${
                trade?.priceImpact?.lessThan(ZERO)
                  ? '+'
                  : trade?.priceImpact?.greaterThan(ZERO)
                  ? '-'
                  : ''
              }${Math.abs(Number(trade?.priceImpact?.toFixed(2)))}%`
            ) : null}
          </span>
        </div>

        <div className="flex justify-between items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-slate-400">
            Est. received
          </span>
          <span className="text-sm font-semibold text-gray-700 text-right dark:text-slate-400">
            {loading || !trade?.amountOut ? (
              <SkeletonBox className="h-4 py-0.5 w-[120px]" />
            ) : (
              `${trade?.amountOut?.toFixed(6) ?? '0.00'} ${
                trade?.amountOut?.currency?.symbol ?? ''
              }`
            )}
          </span>
        </div>

        <div className="flex justify-between items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-slate-400">
            Min. received
          </span>
          <span className="text-sm font-semibold text-gray-700 text-right dark:text-slate-400">
            {loading || !trade?.minAmountOut ? (
              <SkeletonBox className="h-4 py-0.5 w-[100px]" />
            ) : (
              `${trade?.minAmountOut?.toFixed(6) ?? '0.00'} ${
                trade?.amountOut?.currency?.symbol ?? ''
              }`
            )}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700 dark:text-slate-400">
            Network fee
          </span>
          <span className="text-sm font-semibold text-gray-700 text-right dark:text-slate-400">
            {loading || !trade?.gasSpent || trade.gasSpent === '0' ? (
              <SkeletonBox className="h-4 py-0.5 w-[120px]" />
            ) : trade?.gasSpent ? (
              `${trade.gasSpent} ${Native.onChain(chainId).symbol}`
            ) : null}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700 dark:text-slate-400">
            Route
          </span>
          <span className="text-sm font-semibold text-gray-700 text-right dark:text-slate-400">
            {loading || !trade ? (
              <SkeletonBox className="h-4 py-0.5 w-[40px]" />
            ) : (
              <TradeRoutePathView trade={trade}>
                <button
                  type="button"
                  className="text-sm text-blue font-semibold"
                >
                  View
                </button>
              </TradeRoutePathView>
            )}
          </span>
        </div>
        {recipient && isAddress(recipient) && (
          <div className="flex justify-between items-center border-t border-gray-200 dark:border-slate-200/5 mt-2 pt-2">
            <span className="font-medium text-sm text-gray-700 dark:text-slate-300">
              Recipient
            </span>
            <span className="text-sm hover:underline underline-offset-1 font-semibold text-gray-700 text-right dark:text-slate-400">
              <a
                target="_blank"
                href={Chain.from(chainId)?.getAccountUrl(recipient)}
                className={classNames(
                  address !== recipient ? 'text-yellow-600' : 'text-blue',
                  'transition-all flex gap-1 items-center',
                )}
                rel="noreferrer"
              >
                <AddressToEnsResolver address={recipient as Address}>
                  {({ isLoading, data }) => {
                    return (
                      <>
                        {isLoading || !data ? shortenAddress(recipient) : data}
                      </>
                    )
                  }}
                </AddressToEnsResolver>
                {address !== recipient && (
                  <Explainer>
                    Recipient is different from the connected wallet address. If
                    this is expected, ignore this warning.
                  </Explainer>
                )}
              </a>
            </span>
          </div>
        )}
      </div>
    </Collapsible>
  )
}
