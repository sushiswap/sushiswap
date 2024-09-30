import ArrowsUpDownIcon from '@heroicons/react/24/solid/ArrowsUpDownIcon'
import React from 'react'
import { useSwapDispatch } from '~tron/swap/swap-provider'

export const SwitchSwapDirection = () => {
  const { swapTokens } = useSwapDispatch()
  return (
    <div className="left-0 right-0 lg:mt-[-26px] lg:mb-[-26px] flex items-center justify-center">
      <button
        onClick={swapTokens}
        type="button"
        className="hover:shadow-sm transition-border z-10 group bg-background p-2 border border-accent transition-all rounded-full cursor-pointer"
      >
        <div className="transition-transform rotate-0 group-hover:rotate-180">
          <ArrowsUpDownIcon
            strokeWidth={3}
            className="w-4 h-4 lg:w-3 lg:h-3 text-blue"
          />
        </div>
      </button>
    </div>
  )
}
