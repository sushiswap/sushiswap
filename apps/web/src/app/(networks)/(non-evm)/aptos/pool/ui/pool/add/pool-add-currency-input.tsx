'use client'

import { PlusIcon } from '@heroicons/react-v1/solid'
import { classNames } from '@sushiswap/ui'
import { FC, useCallback } from 'react'
import { CurrencyInput } from '~aptos/_common/ui/currency/currency-input/currency-input'
import {
  usePoolActions,
  usePoolState,
} from '~aptos/pool/ui/pool/add/pool-add-provider/pool-add-provider'

const themes = {
  default: {
    currencyInput: 'bg-white dark:bg-slate-800',
    plusButton: '',
  },
  outline: {
    currencyInput: 'border border-accent',
    plusButton: 'border border-accent bg-white dark:bg-slate-900',
  },
} as const

interface PoolAddCurrencyInputProps {
  theme?: keyof typeof themes
  disabled?: boolean
}

export const PoolAddCurrencyInput: FC<PoolAddCurrencyInputProps> = ({
  theme = 'default',
  disabled = false,
}) => {
  const { setToken0, setToken1, setAmount0, setAmount1, setIndependentField } =
    usePoolActions()
  const { token0, token1, amount0, amount1 } = usePoolState()

  const _setAmount0 = useCallback(
    (value: string) => {
      setAmount0(value)
      setIndependentField('token0')
    },
    [setAmount0, setIndependentField],
  )

  const _setAmount1 = useCallback(
    (value: string) => {
      setAmount1(value)
      setIndependentField('token1')
    },
    [setAmount1, setIndependentField],
  )

  return (
    <div className="flex flex-col gap-4">
      <CurrencyInput
        id={'liquidity-from'}
        token={token0}
        value={String(amount0)}
        onSelect={disabled ? undefined : setToken0}
        onChange={_setAmount0}
        type="INPUT"
        className={classNames('p-3 rounded-xl', themes[theme].currencyInput)}
      />
      <div className="left-0 right-0 mt-[-24px] mb-[-24px] flex items-center justify-center">
        <div
          className={classNames(
            'z-10 p-2 bg-gray-100 rounded-full dark:bg-slate-900',
            themes[theme].plusButton,
          )}
        >
          <PlusIcon
            strokeWidth={3}
            className="w-4 h-4 dark:text-slate-400 text-slate-600"
          />
        </div>
      </div>
      <CurrencyInput
        id={'liquidity-to'}
        token={token1}
        value={String(amount1)}
        onSelect={disabled ? undefined : setToken1}
        onChange={_setAmount1}
        type="INPUT"
        className={classNames('p-3 rounded-xl', themes[theme].currencyInput)}
      />
    </div>
  )
}
