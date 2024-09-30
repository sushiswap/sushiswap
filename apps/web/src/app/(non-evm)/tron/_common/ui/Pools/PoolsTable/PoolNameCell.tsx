import { Badge, Currency, TooltipContent } from '@sushiswap/ui'
import { Tooltip, TooltipProvider, TooltipTrigger } from '@sushiswap/ui'
import React from 'react'
import { ProtocolBadge } from 'src/ui/pool/PoolNameCell'
import { SushiSwapProtocol, formatNumber } from 'sushi'
import { WTRX } from '~tron/_common/constants/token-list'
import { useTokenInfo } from '~tron/_common/lib/hooks/useTokenInfo'
import { TopPool } from '~tron/_common/lib/hooks/useTopPools'
import { Icon } from '../../General/Icon'

export const PoolNameCell = ({ data }: { data: TopPool }) => {
  const { data: token0 } = useTokenInfo({
    tokenAddress: data.token0Address,
  })

  const { data: token1 } = useTokenInfo({
    tokenAddress: data.token1Address,
  })

  return (
    <div className="flex items-center gap-5">
      <div className="flex min-w-[54px]">
        <Badge
          className="border-2 border-slate-900 rounded-full z-[11]"
          position="bottom-right"
          badgeContent={<Icon currency={WTRX} width={14} height={14} />}
        >
          <Currency.IconList iconWidth={26} iconHeight={26}>
            <Icon currency={token0} />
            <Icon currency={token1} />
          </Currency.IconList>
        </Badge>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-slate-50 whitespace-nowrap pr-2">
          {data.name}
        </span>
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {ProtocolBadge[data.protocol as SushiSwapProtocol]}
              </TooltipTrigger>
              <TooltipContent>
                <p>Protocol version</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-gray-200 text-gray-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] px-2 rounded-full">
                  {formatNumber(data.swapFee * 100)}%
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Swap fee</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {data.isIncentivized && (
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
          {data.isSmartPool && (
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
