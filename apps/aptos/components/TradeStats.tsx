import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Transition } from '@headlessui/react'
import { SkeletonBox, SkeletonText, classNames } from '@sushiswap/ui'
import { useSwapState } from 'app/swap/trade/TradeProvider'
import { providerNetwork } from 'lib/constants'
import {
  warningSeverity,
  warningSeverityClassName,
} from 'lib/swap/warningSeverity'
import React from 'react'
import { useSwapRouter } from 'utils/useSwapRouter'
import { useTokenBalance } from 'utils/useTokenBalance'
import { formatNumber } from 'utils/utilFunctions'
import { Modal } from './Modal/Modal'
import { TradeRoute } from './TradeRoute'

export const TradeStats = () => {
  const {
    token0,
    token1,
    amount,
    bestRoutes,
    isLoadingPrice,
    isPriceFetching,
    outputAmount,
    slippageAmount,
  } = useSwapState()
  const { account } = useWallet()
  const loading =
    Boolean(isLoadingPrice && Number(amount) > 0) || isPriceFetching

  const outputSwapTokenAmount = outputAmount
    ? formatNumber(parseFloat(outputAmount), token1 ? token1.decimals : 8)
    : ''

  const minOutput = slippageAmount
    ? formatNumber(slippageAmount, token1 ? token1.decimals : 8)
    : 0
  const { data: balance } = useTokenBalance({
    account: account?.address as string,
    currency: token0?.address,
    refetchInterval: 2000,
  })
  const { data: routes } = useSwapRouter({
    balance,
  })

  return (
    <Transition
      show={Number(amount) > 0 && bestRoutes.length > 0}
      enter="transition duration-300 ease-out"
      enterFrom="transform translate-y-[16px] opacity-0"
      enterTo="transform translate-y-0 opacity-100"
      leave="transition duration-300 ease-out"
      leaveFrom="transform translate-y-0 opacity-100"
      leaveTo="transform translate-y-[16px] opacity-0"
    >
      <div className="w-full px-2 flex flex-col gap-1">
        <div className="flex justify-between items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-slate-400">
            Price impact
          </span>
          <span
            className={classNames(
              warningSeverityClassName(warningSeverity(routes?.priceImpact)),
              'text-sm font-semibold text-gray-700 text-right dark:text-slate-400',
            )}
          >
            {loading ? (
              <SkeletonBox className="h-4 py-0.5 w-[120px] rounded-md" />
            ) : (
              <>{routes?.priceImpact ? -routes?.priceImpact : 0}%</>
            )}
          </span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-slate-400">
            Est. received
          </span>
          <span className="text-sm font-semibold text-gray-700 text-right dark:text-slate-400">
            {loading || !outputSwapTokenAmount ? (
              <SkeletonText fontSize="sm" className="w-[120px]" />
            ) : (
              `${outputSwapTokenAmount} ${token1.symbol}`
            )}
          </span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-slate-400">
            Min. received
          </span>
          <span className="text-sm font-semibold text-gray-700 text-right dark:text-slate-400">
            {loading || !minOutput ? (
              <SkeletonText fontSize="sm" className="w-[120px]" />
            ) : (
              `${minOutput} ${token1.symbol}`
            )}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700 dark:text-slate-400">
            Route
          </span>
          <span className="text-sm font-semibold text-gray-700 text-right dark:text-slate-400">
            {loading ? (
              <SkeletonText fontSize="sm" className="w-[120px]" />
            ) : (
              <Modal.Trigger tag={'trade-state-routes'}>
                {({ open }) => (
                  <button
                    type="button"
                    onClick={open}
                    className="text-sm text-blue font-semibold"
                  >
                    View
                  </button>
                )}
              </Modal.Trigger>
            )}
            <TradeRoute trade={bestRoutes} />
          </span>
        </div>
        {account?.address && (
          <div className="flex justify-between items-center border-t border-gray-200 dark:border-slate-200/5 mt-2 pt-2">
            <span className="font-medium text-sm text-gray-700 dark:text-slate-300">
              Recipient
            </span>
            <span className="font-semibold text-gray-700 text-right dark:text-slate-400">
              <a
                target="_blank"
                href={`https://explorer.aptoslabs.com/account/${account?.address}?network=${providerNetwork}`}
                className={classNames('transition-all flex gap-1 items-center')}
                rel="noreferrer"
              >
                {`${account?.address.substring(
                  0,
                  6,
                )}...${account?.address.substring(66 - 4)}`}
              </a>
            </span>
          </div>
        )}
      </div>
    </Transition>
  )
}
