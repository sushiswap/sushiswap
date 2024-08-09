import {
  Badge,
  Currency,
  SkeletonCircle,
  SkeletonText,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  classNames,
} from '@sushiswap/ui'
import { NetworkIcon } from '@sushiswap/ui/icons/NetworkIcon'
import { ColumnDef } from '@tanstack/react-table'
import { formatNumber, formatPercent } from 'sushi/format'

import { SteerAccountPositionExtended } from 'src/lib/wagmi/hooks/steer/useSteerAccountPositionsExtended'
import { SushiSwapProtocol } from 'sushi'
import { unwrapToken } from 'sushi/currency'
import { ProtocolBadge } from '../../../../PoolNameCell'
import { SteerStrategyCell } from './SteerStrategyCell'

export const STEER_NAME_COLUMN: ColumnDef<
  SteerAccountPositionExtended,
  unknown
> = {
  id: 'name',
  header: 'Name',
  cell: ({ row: { original } }) => {
    const vault = original.vault

    return (
      <div className="flex items-center gap-5">
        <div className="flex min-w-[54px]">
          <Badge
            className="border-2 border-slate-900 rounded-full z-[11]"
            position="bottom-right"
            badgeContent={
              <NetworkIcon chainId={original.chainId} width={14} height={14} />
            }
          >
            <Currency.IconList iconWidth={26} iconHeight={26}>
              <Currency.Icon disableLink currency={original.token0} />
              <Currency.Icon disableLink currency={original.token1} />
            </Currency.IconList>
          </Badge>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-slate-50">
            {unwrapToken(original.token0).symbol}{' '}
            <span className="font-normal text-gray-900 dark:text-slate-500">
              /
            </span>{' '}
            {unwrapToken(original.token1).symbol}{' '}
            <div
              className={classNames(
                'text-[10px] bg-gray-200 dark:bg-slate-700 rounded-lg px-1 ml-1',
              )}
            />
          </span>
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {ProtocolBadge[SushiSwapProtocol.SUSHISWAP_V3]}
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
                    {formatPercent(vault.swapFee)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Swap fee</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {vault.isIncentivized && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="whitespace-nowrap bg-green/20 text-green text-[10px] px-2 rounded-full">
                      🧑🌾{'  '}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Farm rewards available</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {vault.isDeprecated && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-red/50 dark:bg-red/80 text-[10px] px-2 rounded-full">
                      Deprecated
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {
                        "This vault is deprecated. It will not accrue any fees and won't be readjusted."
                      }
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
    )
  },
  meta: {
    skeleton: (
      <div className="flex items-center w-full gap-2">
        <div className="flex items-center">
          <SkeletonCircle radius={26} />
          <SkeletonCircle radius={26} className="-ml-[12px]" />
        </div>
        <div className="flex flex-col w-full">
          <SkeletonText fontSize="lg" />
        </div>
      </div>
    ),
  },
  size: 300,
}

export const STEER_STRATEGY_COLUMN: ColumnDef<
  SteerAccountPositionExtended,
  unknown
> = {
  id: 'strategy',
  header: 'Strategy',
  cell: (props) => <SteerStrategyCell vault={props.row.original.vault} />,
  meta: {
    skeleton: (
      <div className="flex items-center w-full gap-2">
        <SkeletonText fontSize="lg" />
      </div>
    ),
  },
  size: 300,
}

export const STEER_POSITION_SIZE_COLUMN: ColumnDef<
  SteerAccountPositionExtended,
  unknown
> = {
  id: 'positionSize',
  header: 'Position Size',
  accessorFn: (row) => row.totalAmountUSD ?? 0,
  cell: (props) => `$${formatNumber(props.row.original.totalAmountUSD)}`,
  meta: {
    skeleton: <SkeletonText fontSize="lg" />,
  },
}
