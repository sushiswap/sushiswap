import { Badge, TooltipContent } from '@sushiswap/ui'
import { Tooltip, TooltipProvider, TooltipTrigger } from '@sushiswap/ui'
import { AptosCircle } from '@sushiswap/ui/icons/network/circle/AptosCircle'
import React, { FC } from 'react'
// import { ProtocolBadge } from 'src/ui/pool/PoolNameCell'
import { formatNumber } from 'sushi'
import { CurrencyIcon } from '~aptos/_common/ui/currency/currency-icon'
import { CurrencyIconList } from '~aptos/_common/ui/currency/currency-icon-list'
import { TopPool } from '~aptos/pool/lib/use-top-pools'
import { Row } from '../../types'

export const PoolNameCell: FC<Row<TopPool>> = ({ row }) => {
  return (
    <div className="flex items-center gap-5">
      <div className="flex min-w-[54px]">
        <Badge
          className="border-2 border-slate-900 rounded-full z-[11]"
          position="bottom-right"
          badgeContent={<AptosCircle width={14} height={14} />}
        >
          <CurrencyIconList iconWidth={26} iconHeight={26}>
            <CurrencyIcon currency={row.token0} />
            <CurrencyIcon currency={row.token1} />
          </CurrencyIconList>
        </Badge>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-slate-50 whitespace-nowrap pr-2">
          {row.name}
        </span>
        <div className="flex gap-1">
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {ProtocolBadge[row.protocol as SushiSwapProtocol]}
              </TooltipTrigger>
              <TooltipContent>
                <p>Protocol version</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-gray-200 text-gray-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] px-2 rounded-full">
                  {formatNumber(row.swapFee * 100)}%
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Swap fee</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {row.isIncentivized && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="whitespace-nowrap bg-green/20 text-green text-[10px] px-2 rounded-full">
                    🧑‍🌾{' '}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Farm rewards available</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {row.isSmartPool && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-[#F2E9D6] dark:bg-yellow/60 text-[10px] px-2 rounded-full">
                    💡
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Smart Pool available</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  )
}
