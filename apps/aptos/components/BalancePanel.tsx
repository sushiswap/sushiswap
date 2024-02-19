import { SkeletonText, WalletIcon, classNames } from '@sushiswap/ui'
import React from 'react'

interface Props {
  coinData: number
  isLoading: boolean
  decimals: number
  onClick?: () => void
  type: 'INPUT' | 'OUTPUT'
}

export const BalancePanel = ({
  coinData,
  isLoading,
  decimals,
  onClick,
  type,
}: Props) => {
  let [big, portion] = (
    coinData ? `${coinData / 10 ** decimals}` : '0.00'
  ).split('.')
  portion = portion ? portion.substring(0, 6) : '00'
  return (
    <button
      id="swap-from-balance-button"
      testdata-id="swap-from-balance-button"
      type="button"
      onClick={onClick}
      className={classNames(
        type === 'INPUT'
          ? 'text-blue hover:text-blue-600 active:text-blue-700 hover:dark:text-slate-300'
          : 'text-gray-500 dark:text-slate-500',
        'font-medium flex gap-1.5 items-center py-1 dark:text-slate-400 px-2 rounded-md',
      )}
    >
      <WalletIcon width={18} height={18} />
      {isLoading ? (
        <div className="w-[60px] flex items-center">
          <SkeletonText fontSize="lg" className="w-full" />
        </div>
      ) : (
        <span className="text-lg">
          {big}.<span className="text-sm font-semibold">{portion}</span>
        </span>
      )}
    </button>
  )
}
