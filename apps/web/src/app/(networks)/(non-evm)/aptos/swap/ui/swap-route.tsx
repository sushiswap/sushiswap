import React, { useMemo } from 'react'
import { Modal } from '~aptos/_common//components/Modal/Modal'
import { ModalType } from '~aptos/_common//components/Modal/ModalProvider'
import { useBaseTokens } from '~aptos/_common/lib/common/use-base-tokens'
import { useTokenWithCache } from '~aptos/_common/lib/common/use-token-with-cache'
import { CurrencyIcon } from '~aptos/_common/ui/currency/currency-icon'

interface SwapRoute {
  trade: string[]
}

export const SwapRoute = ({ trade }: SwapRoute) => {
  const rows: JSX.Element[] = []
  for (let i = 0; i < trade.length - 1; i++) {
    rows.push(
      <ComplexRoutePath
        key={i}
        fromTokenAddress={trade[i]}
        toTokenAddress={trade[i + 1]}
      />,
    )
  }
  return (
    <Modal.Panel
      modalType={ModalType.Review}
      variant="transparent"
      tag={'trade-state-routes'}
    >
      {() => (
        <>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2">
              <h3 className="font-medium flex justify-center text-xl leading-6 text-gray-900 dark:text-slate-100">
                Optimized route
              </h3>
            </div>
            {rows}
          </div>
        </>
      )}
    </Modal.Panel>
  )
}

interface ComplexRoutePath {
  fromTokenAddress: string
  toTokenAddress: string
}

const ComplexRoutePath = ({
  fromTokenAddress,
  toTokenAddress,
}: ComplexRoutePath) => {
  const { data: tokens } = useBaseTokens()

  const { data: queryToken0 } = useTokenWithCache({ address: fromTokenAddress })
  const { data: queryToken1 } = useTokenWithCache({ address: toTokenAddress })

  const fromToken = useMemo(() => {
    if (tokens?.[fromTokenAddress]) {
      return tokens[fromTokenAddress]
    }

    return queryToken0
  }, [tokens, fromTokenAddress, queryToken0])

  const toToken = useMemo(() => {
    if (tokens?.[toTokenAddress]) {
      return tokens[toTokenAddress]
    }

    return queryToken1
  }, [tokens, toTokenAddress, queryToken1])

  return (
    <div className="relative grid grid-cols-12 gap-3 rounded-full border-gray-200 dark:border-black/[0.12] bg-gray-200 dark:bg-black/[0.12] border-2 p-2">
      <div
        className="absolute z-[0] inset-0 rounded-full pointer-events-none bg-white dark:bg-slate-700/[0.6]"
        style={{ width: '100px)' }}
      />
      <div className="z-[1] col-span-3 text-xs font-semibold text-gray-900 dark:text-slate-200 flex items-center gap-2">
        <CurrencyIcon currency={fromToken} width={16} height={16} />
        <span className="truncate">{fromToken?.symbol}</span>
      </div>
      <div className="z-[1] col-span-2 text-xs font-semibold text-gray-500 dark:text-slate-500 truncate text-right">
        100.00%
      </div>
      <div className="z-[1] col-span-3 text-xs font-semibold text-gray-900 dark:text-slate-200 flex items-center justify-end gap-2">
        <CurrencyIcon currency={toToken} width={16} height={16} />
        <span className="text-xs font-semibold text-gray-900 dark:text-slate-200 truncate">
          {toToken?.symbol}
        </span>
      </div>
    </div>
  )
}
