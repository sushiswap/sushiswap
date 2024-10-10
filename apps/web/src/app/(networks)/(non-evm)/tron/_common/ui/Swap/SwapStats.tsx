import { Transition } from '@headlessui/react'
import {
  SlippageToleranceStorageKey,
  useSlippageTolerance,
} from '@sushiswap/hooks'
import { classNames } from '@sushiswap/ui'
import { SkeletonBox } from '@sushiswap/ui'
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import Link from 'next/link'
import { useMemo } from 'react'
import { formatPercent } from 'sushi/format'
import { truncateText } from '~tron/_common/lib/utils/formatters'
import { getIfWrapOrUnwrap } from '~tron/_common/lib/utils/helpers'
import { getTronscanAddressLink } from '~tron/_common/lib/utils/tronscan-helpers'
import {
  warningSeverity,
  warningSeverityClassName,
} from '~tron/_common/lib/utils/warning-severity'
import { useSwapState } from '~tron/swap/swap-provider'
import { SwapRoutesDialog } from './SwapRoutesDialog'

export const SwapStats = () => {
  const { token0, token1, amountOut, amountIn, priceImpactPercentage, route } =
    useSwapState()
  const { address } = useWallet()

  const swapType = useMemo(() => {
    return getIfWrapOrUnwrap(token0, token1)
  }, [token0, token1])

  const isLoading =
    priceImpactPercentage === undefined ||
    (priceImpactPercentage === 0 && swapType === 'swap') ||
    amountOut === '' ||
    amountOut === ''

  const [slippageTolerance] = useSlippageTolerance(
    SlippageToleranceStorageKey.Swap,
  )

  const slippage =
    slippageTolerance === 'AUTO' ? 0.005 : Number(slippageTolerance) / 100

  const minOutput = useMemo(() => {
    if (!amountOut) return ''
    if (
      (token0?.symbol === 'WTRX' && token1?.address === 'TRON') ||
      (token0?.address === 'TRON' && token1?.symbol === 'WTRX')
    ) {
      return amountIn
    }

    const output = Number(amountOut) * (1 - slippage)
    return output
  }, [amountOut, slippage, token0, token1, amountIn])

  const severityColor = useMemo(() => {
    return warningSeverityClassName(warningSeverity(priceImpactPercentage))
  }, [priceImpactPercentage])

  return (
    <Transition
      show={amountIn !== '' && amountOut !== '' && route && route.length > 0}
      enter="transition duration-300 ease-out"
      enterFrom="transform translate-y-[16px] opacity-0"
      enterTo="transform translate-y-0 opacity-100"
      leave="transition duration-300 ease-out"
      leaveFrom="transform translate-y-0 opacity-100"
      leaveTo="transform translate-y-[16px] opacity-0"
    >
      <div className="w-full px-2 flex flex-col gap-1 pb-8">
        <div className="flex justify-between items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-slate-400">
            Price impact
          </span>
          <span
            className={classNames(
              'text-sm font-semibold text-gray-700 text-right dark:text-slate-400',
            )}
          >
            {isLoading ? (
              <SkeletonBox className="h-4 py-0.5 w-[120px] rounded-md" />
            ) : (
              <span style={{ color: severityColor }}>
                {priceImpactPercentage
                  ? `-${formatPercent(priceImpactPercentage / 100)}`
                  : formatPercent(0)}
              </span>
            )}
          </span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-slate-400">
            Est. received
          </span>
          <span className="text-sm font-semibold text-gray-700 text-right dark:text-slate-400">
            {isLoading ? (
              <SkeletonBox className="h-4 py-0.5 w-[120px] rounded-md" />
            ) : (
              `${amountOut} ${token1.symbol}`
            )}
          </span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-slate-400">
            Min. received
          </span>
          <span className="text-sm font-semibold text-gray-700 text-right dark:text-slate-400">
            {isLoading ? (
              <SkeletonBox className="h-4 py-0.5 w-[120px] rounded-md" />
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
            {isLoading ? (
              <SkeletonBox className="h-4 py-0.5 w-[120px] rounded-md" />
            ) : (
              <SwapRoutesDialog />
            )}
          </span>
        </div>
        {address && (
          <div className="flex justify-between items-center border-t border-gray-200 dark:border-slate-200/5 mt-2 pt-2">
            <span className="font-medium text-sm text-gray-700 dark:text-slate-300">
              Recipient
            </span>
            <span className="font-semibold text-gray-700 text-right dark:text-slate-400">
              <Link
                target="_blank"
                href={getTronscanAddressLink(address)}
                className={classNames(
                  'flex items-center gap-2 cursor-pointer text-blue',
                )}
                rel="noreferrer"
              >
                {truncateText(address)}
              </Link>
            </span>
          </div>
        )}
      </div>
    </Transition>
  )
}
