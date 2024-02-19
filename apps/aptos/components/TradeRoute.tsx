import React from 'react'
import { Token } from 'utils/tokenType'
import useTokenWithCache from 'utils/useTokenWithCache'
import { useTokens } from 'utils/useTokens'
import { Icon } from './Icon'
import { Modal } from './Modal/Modal'
import { ModalType } from './Modal/ModalProvider'
interface Props {
  trade: string[]
}
export const TradeRoute = ({ trade }: Props) => {
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

interface ComplexRoutePathProps {
  fromTokenAddress: string
  toTokenAddress: string
}

const ComplexRoutePath = ({
  fromTokenAddress,
  toTokenAddress,
}: ComplexRoutePathProps) => {
  const { data: tokens } = useTokens()

  const { data: queryToken0 } = useTokenWithCache({ address: fromTokenAddress })
  const { data: queryToken1 } = useTokenWithCache({ address: toTokenAddress })

  const fromToken = (
    tokens && tokens[fromTokenAddress]
      ? tokens[fromTokenAddress]
      : queryToken0 && queryToken0
  ) as Token
  const toToken = (
    tokens && tokens[toTokenAddress]
      ? tokens[toTokenAddress]
      : queryToken1 && queryToken1
  ) as Token
  return (
    <div className="relative grid grid-cols-12 gap-3 rounded-full border-gray-200 dark:border-black/[0.12] bg-gray-200 dark:bg-black/[0.12] border-2 p-2">
      <div
        className="absolute z-[0] inset-0 rounded-full pointer-events-none bg-white dark:bg-slate-700/[0.6]"
        style={{ width: '100px)' }}
      />
      <div className="z-[1] col-span-3 text-xs font-semibold text-gray-900 dark:text-slate-200 flex items-center gap-2">
        <Icon currency={fromToken} width={16} height={16} />
        <span className="truncate">{fromToken?.symbol}</span>
      </div>
      <div className="z-[1] col-span-2 text-xs font-semibold text-gray-500 dark:text-slate-500 truncate text-right">
        100.00%
      </div>
      <div className="z-[1] col-span-3 text-xs font-semibold text-gray-900 dark:text-slate-200 flex items-center justify-end gap-2">
        <Icon currency={toToken} width={16} height={16} />
        <span className="text-xs font-semibold text-gray-900 dark:text-slate-200 truncate">
          {toToken?.symbol}
        </span>
      </div>
    </div>
  )
}
