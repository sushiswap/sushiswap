import { CheckCircleIcon } from '@heroicons/react/20/solid'
import { Badge, classNames } from '@sushiswap/ui'
import React, { CSSProperties } from 'react'
import { Modal } from '~aptos/_common/components/Modal/Modal'
import { Token } from '~aptos/_common/lib/types/token'
import { CurrencyIcon } from '../currency/currency-icon'

type TokenListItem = {
  id: string
  style: CSSProperties
  token: Token
  selected: boolean
  onSelect: (token: Token) => void
}
export function TokenListItem({
  id,
  style,
  token,
  selected,
  onSelect,
}: TokenListItem) {
  return (
    <div className="py-0.5 h-[64px]" style={style}>
      <Modal.Trigger tag={`${id}-token-selector-modal`}>
        {({ close }) => (
          <button
            type="button"
            className={classNames(
              selected ? 'bg-black/[0.06] dark:bg-white/[0.06]' : '',
              'group flex items-center w-full active:bg-black/[0.06] dark:active:bg-white/[0.06] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] h-full rounded-lg px-3 token-$TRDL cursor-pointer',
            )}
            onClick={() => {
              onSelect(token)
              close()
            }}
          >
            <div className="flex items-center justify-between flex-grow gap-2 rounded">
              <div className="flex flex-row items-center flex-grow gap-4">
                {selected ? (
                  <Badge
                    position="bottom-right"
                    badgeContent={
                      <div className="bg-white dark:bg-slate-800 rounded-full">
                        <CheckCircleIcon
                          width={20}
                          height={20}
                          className="text-blue rounded-full"
                        />
                      </div>
                    }
                  >
                    <div className="w-10 h-10">
                      <CurrencyIcon currency={token} />
                    </div>
                  </Badge>
                ) : (
                  <div className="w-10 h-10">
                    <CurrencyIcon currency={token} />
                  </div>
                )}
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-gray-900 group-hover:text-gray-900 dark:text-slate-50 group-hover:dark:text-white">
                    {token?.symbol}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-slate-400 group-hover:dark:text-blue-100">
                    {token?.name}
                  </span>
                </div>
              </div>
            </div>
          </button>
        )}
      </Modal.Trigger>
    </div>
  )
}
