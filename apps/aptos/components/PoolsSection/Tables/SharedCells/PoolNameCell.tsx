import { TooltipContent } from '@sushiswap/ui'
import { Tooltip, TooltipProvider, TooltipTrigger } from '@sushiswap/ui'
import { Icon } from 'components/Icon'
import { IconList } from 'components/IconList'
import React, { FC } from 'react'
import { isFarm, useFarms } from 'utils/useFarms'
import { Pool } from 'utils/usePools'
import { useTokensFromPools } from 'utils/useTokensFromPool'
import { Row } from './types'

export const PoolNameCell: FC<Row<Pool>> = ({ row }) => {
  const { token0, token1 } = useTokensFromPools(row)
  const lpAddress = row?.id
  const { data: farms } = useFarms()
  const _isFarm = isFarm(lpAddress, farms)

  return (
    <div className="flex items-center gap-1">
      <div className="flex min-w-[54px]">
        {token0 && token1 && (
          <IconList iconWidth={26} iconHeight={26}>
            <Icon currency={token0} />
            <Icon currency={token1} />
          </IconList>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-slate-50">
          {token0?.symbol}{' '}
          <span className="font-normal text-gray-900 dark:text-slate-500">
            /
          </span>{' '}
          {token1?.symbol}{' '}
        </span>
        <div className="flex gap-1">
          {_isFarm !== -1 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="whitespace-nowrap bg-green/20 text-green text-[10px] px-2 rounded-full">
                    🧑‍🌾
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Farm rewards available</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  )
}
