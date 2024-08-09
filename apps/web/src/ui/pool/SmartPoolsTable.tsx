'use client'

import { UploadIcon } from '@heroicons/react-v1/outline'
import { DownloadIcon } from '@heroicons/react-v1/solid'
import { ArrowDownRightIcon } from '@heroicons/react/20/solid'
import {
  EllipsisHorizontalIcon,
  GiftIcon,
  LightBulbIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { SmartPoolsV1 } from '@sushiswap/graph-client/data-api'
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Chip,
  Currency,
  DataTable,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  LinkExternal,
  SkeletonCircle,
  SkeletonText,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  classNames,
} from '@sushiswap/ui'
import { NetworkIcon } from '@sushiswap/ui/icons/NetworkIcon'
import {
  ColumnDef,
  PaginationState,
  SortingState,
  TableState,
} from '@tanstack/react-table'
import Link from 'next/link'
import React, { FC, useMemo, useState } from 'react'
import { isAngleEnabledChainId } from 'sushi/config'
import { Native, Token, unwrapToken } from 'sushi/currency'
import { formatPercent, formatUSD } from 'sushi/format'
import { SushiSwapProtocol } from 'sushi/types'
import { APRHoverCard } from './APRHoverCard'
import { ProtocolBadge } from './PoolNameCell'
import { usePoolFilters } from './PoolsFiltersProvider'
import { SteerStrategyConfig } from './Steer/constants'

const COLUMNS = [
  {
    id: 'poolName',
    header: 'Pool name',
    cell: ({ row: { original } }) => {
      const token0 = new Token({
        chainId: original.chainId,
        address: original.token0.address,
        decimals: original.token0.decimals,
        symbol: original.token0.symbol,
      })
      const token1 = new Token({
        chainId: original.chainId,
        address: original.token1.address,
        decimals: original.token1.decimals,
        symbol: original.token1.symbol,
      })

      return (
        <div className="flex items-center gap-5">
          <div className="flex min-w-[54px]">
            <Badge
              className="border-2 border-slate-900 rounded-full z-[11]"
              position="bottom-right"
              badgeContent={
                <NetworkIcon
                  chainId={original.chainId}
                  width={14}
                  height={14}
                />
              }
            >
              <Currency.IconList iconWidth={26} iconHeight={26}>
                <Currency.Icon disableLink currency={token0} />
                <Currency.Icon disableLink currency={token1} />
              </Currency.IconList>
            </Badge>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-slate-50">
              {unwrapToken(token0).symbol}{' '}
              <span className="font-normal text-gray-900 dark:text-slate-500">
                /
              </span>{' '}
              {unwrapToken(token1).symbol}{' '}
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
                    {ProtocolBadge[original.protocol as SushiSwapProtocol]}
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
                      {formatPercent(original.swapFee)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Swap fee</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {original.isIncentivized && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="whitespace-nowrap bg-green/20 text-green text-[10px] px-2 rounded-full">
                        🧑🌾{' '}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Farm rewards available</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
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
              {original.isDeprecated && (
                <div className="bg-red/50 dark:bg-red/80 text-[10px] px-2 rounded-full">
                  Deprecated
                </div>
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
  },
  {
    id: 'name',
    header: 'Strategy',
    cell: ({ row: { original } }) => (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <span className="underline decoration-dotted underline-offset-2">
              {original.strategy.replace(/([a-z0-9])([A-Z])/g, '$1 $2')}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-[320px]">
            <p>{SteerStrategyConfig[original.strategy].description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    meta: {
      skeleton: <SkeletonText fontSize="lg" />,
    },
  },
  {
    id: 'liquidityUSD',
    header: 'TVL',
    accessorFn: (row) => row.vaultLiquidityUSD,
    cell: ({ row: { original } }) => (
      <span className="flex gap-2">
        <span className="text-muted-foreground">
          {formatUSD(original.liquidityUSD).includes('NaN')
            ? '$0.00'
            : formatUSD(original.liquidityUSD)}
        </span>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <span className="underline decoration-dotted underline-offset-2">
                {formatUSD(original.vaultLiquidityUSD).includes('NaN')
                  ? '$0.00'
                  : formatUSD(original.vaultLiquidityUSD)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Amount of liquidity deposited in the smart pool.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </span>
    ),
    meta: {
      skeleton: <SkeletonText fontSize="lg" />,
    },
  },
  {
    id: 'fees1d',
    header: 'Fees (24h)',
    accessorFn: (row) => row.feeUSD1d,
    cell: (props) =>
      formatUSD(props.row.original.feeUSD1d).includes('NaN')
        ? '$0.00'
        : formatUSD(props.row.original.feeUSD1d),
    meta: {
      skeleton: <SkeletonText fontSize="lg" />,
    },
  },
  {
    id: 'totalApr1d',
    header: 'APR (24h)',
    accessorFn: (row) => (row.feeApr1d + row.incentiveApr) * 100,
    cell: (props) => {
      return (
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="line-through text-muted-foreground">
                  {formatPercent(props.row.original.feeAndIncentiveApr1d)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>APR when not staked within the vault.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <APRHoverCard
            pool={{
              id: props.row.original.id,
              address: props.row.original.poolAddress as `0x${string}`,
              chainId: props.row.original.chainId,
              protocol: SushiSwapProtocol.SUSHISWAP_V3,
              feeApr1d: props.row.original.feeApr1d,
              incentiveApr: props.row.original.incentiveApr,
              isIncentivized: props.row.original.isIncentivized,
              wasIncentivized: props.row.original.wasIncentivized,
            }}
            smartPoolAPR={props.row.original.stakedApr1d}
          >
            <span className="underline decoration-dotted underline-offset-2">
              {formatPercent(props.row.original.stakedAndIncentiveApr1d)}
            </span>
          </APRHoverCard>
        </div>
      )
    },
    meta: {
      skeleton: <SkeletonText fontSize="lg" />,
    },
  },
  {
    id: 'actions',
    cell: ({ row }) =>
      row.original.protocol === 'SUSHISWAP_V3' ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button icon={EllipsisHorizontalIcon} variant="ghost" size="sm">
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-fit">
            <DropdownMenuLabel>
              {row.original.token0.symbol} / {row.original.token1.symbol}
              <Chip variant="blue" className="ml-2">
                SushiSwap V3
              </Chip>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  onClick={(e) => e.stopPropagation()}
                  shallow={true}
                  className="flex items-center"
                  href={`/${row.original.chainId}/pool/v3/${row.original.poolAddress}`}
                >
                  <ArrowDownRightIcon width={16} height={16} className="mr-2" />
                  Pool details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  onClick={(e) => e.stopPropagation()}
                  shallow={true}
                  className="flex items-center"
                  href={`/${row.original.chainId}/pool/v3/${row.original.poolAddress}/positions/create`}
                >
                  <PlusIcon width={16} height={16} className="mr-2" />
                  Create position
                </Link>
              </DropdownMenuItem>
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem asChild>
                      <Link
                        onClick={(e) => e.stopPropagation()}
                        shallow={true}
                        className="flex items-center"
                        href={`/${row.original.chainId}/pool/v3/${row.original.poolAddress}/smart/${row.original.id}`}
                      >
                        <span className="relative">
                          <LightBulbIcon
                            width={16}
                            height={16}
                            className="mr-2"
                          />
                          <sup className="rounded-full bg-background absolute right-[3px]">
                            <PlusIcon width={12} height={12} />
                          </sup>
                        </span>
                        Create smart position
                      </Link>
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[240px]">
                    <p>
                      {`Smart pools optimize liquidity allocation within custom price ranges, enhancing trading efficiency by
          providing deeper liquidity around the current price, increasing Liquidity Providers (LP) fee earnings.`}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger
                    asChild={isAngleEnabledChainId(row.original.chainId)}
                  >
                    <DropdownMenuItem
                      asChild
                      disabled={!isAngleEnabledChainId(row.original.chainId)}
                    >
                      {/* FIX */}
                      <Link
                        onClick={(e) => e.stopPropagation()}
                        shallow={true}
                        className="flex items-center"
                        href={`/pool/incentivize?chainId=${
                          row.original.chainId
                        }&fromCurrency=${
                          row.original.token0.address ===
                          Native.onChain(row.original.chainId).wrapped.address
                            ? 'NATIVE'
                            : row.original.token0.address
                        }&toCurrency=${
                          row.original.token1.address ===
                          Native.onChain(row.original.chainId).wrapped.address
                            ? 'NATIVE'
                            : row.original.token1.address
                        }&feeAmount=${row.original.swapFee * 10_000 * 100}`}
                      >
                        <GiftIcon width={16} height={16} className="mr-2" />
                        Add incentive
                      </Link>
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[240px]">
                    <p>
                      {!isAngleEnabledChainId(row.original.chainId)
                        ? 'Not available on this network'
                        : 'Add rewards to a pool to incentivize liquidity providers joining in.'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button icon={EllipsisHorizontalIcon} variant="ghost" size="sm">
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-fit">
            <DropdownMenuLabel>
              {row.original.token0.symbol} / {row.original.token1.symbol}
              {row.original.protocol === 'SUSHISWAP_V2' && (
                <Chip variant="pink" className="ml-2">
                  SushiSwap V2
                </Chip>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  onClick={(e) => e.stopPropagation()}
                  shallow={true}
                  className="flex items-center"
                  href={`/pool/${row.original.id}/add`}
                >
                  <PlusIcon width={16} height={16} className="mr-2" />
                  Add liquidity
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  onClick={(e) => e.stopPropagation()}
                  shallow={true}
                  className="flex items-center"
                  href={`/pool/${row.original.id}/remove`}
                >
                  <MinusIcon width={16} height={16} className="mr-2" />
                  Remove liquidity
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuGroupLabel>Farm rewards</DropdownMenuGroupLabel>
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild={row.original.isIncentivized}>
                    <DropdownMenuItem
                      asChild
                      disabled={!row.original.isIncentivized}
                    >
                      <Link
                        onClick={(e) => e.stopPropagation()}
                        shallow={true}
                        className="flex items-center"
                        href={`/pool/${row.original.id}/stake`}
                      >
                        <DownloadIcon width={16} height={16} className="mr-2" />
                        Stake
                      </Link>
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[240px]">
                    <p>
                      {!row.original.isIncentivized
                        ? 'No rewards available on this pool'
                        : 'After adding liquidity, stake your liquidity tokens to benefit from extra rewards'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuItem asChild disabled={!row.original.isIncentivized}>
                <Link
                  onClick={(e) => e.stopPropagation()}
                  shallow={true}
                  className="flex items-center"
                  href={`/pool/${row.original.id}/unstake`}
                >
                  <UploadIcon width={16} height={16} className="mr-2" />
                  Unstake
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    meta: {
      disableLink: true,
      skeleton: <SkeletonText fontSize="lg" />,
    },
  },
] satisfies ColumnDef<SmartPoolsV1[number], unknown>[]

export const SmartPoolsTable: FC<{ smartPools: SmartPoolsV1 }> = ({
  smartPools,
}) => {
  const { tokenSymbols, protocols, farmsOnly } = usePoolFilters()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'liquidityUSD', desc: true },
  ])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const state: Partial<TableState> = useMemo(() => {
    return {
      sorting,
      pagination,
    }
  }, [sorting, pagination])

  const vaults = useMemo(
    () =>
      smartPools?.filter((smartPool) => {
        if (
          tokenSymbols.length &&
          !tokenSymbols.some((tokenSymbol) =>
            [
              smartPool.token0.symbol.toLowerCase(),
              smartPool.token1.symbol.toLowerCase(),
            ].includes(tokenSymbol.toLowerCase()),
          )
        )
          return false

        if (
          protocols.length &&
          !protocols.some((protocol) => smartPool.protocol === protocol)
        )
          return false

        if (farmsOnly && !smartPool.isIncentivized) return false

        return true
      }) ?? [],
    [smartPools, tokenSymbols, protocols, farmsOnly],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Smart Pools{' '}
          {vaults?.length ? (
            <span className="text-gray-400 dark:text-slate-500">
              ({vaults.length})
            </span>
          ) : null}
        </CardTitle>
        <CardDescription>
          Smart pools optimize liquidity allocation within custom price ranges,
          enhancing trading efficiency by providing deeper liquidity around the
          current price, increasing Liquidity Providers (LP) fee earnings. To
          learn more about Smart Pools, click{' '}
          <LinkExternal
            href="https://www.sushi.com/blog/faq-smart-pools"
            target="_blank"
          >
            here
          </LinkExternal>
          .
        </CardDescription>
      </CardHeader>
      <DataTable
        testId={(row) => `smart-pools-table-${row.id.replace(':', '-')}`}
        onPaginationChange={setPagination}
        pagination={true}
        state={state}
        linkFormatter={(row) =>
          `/${row.chainId}/pool/v3/${row.poolAddress}/smart/${row.address}`
        }
        onSortingChange={setSorting}
        loading={!vaults}
        columns={COLUMNS}
        data={vaults}
      />
    </Card>
  )
}
