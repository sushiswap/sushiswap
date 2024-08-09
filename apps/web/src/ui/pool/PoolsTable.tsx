'use client'

import { Slot } from '@radix-ui/react-slot'
import { TopPools } from '@sushiswap/graph-client/data-api'

import { UploadIcon } from '@heroicons/react-v1/outline'
import { DownloadIcon } from '@heroicons/react-v1/solid'
import {
  ArrowDownRightIcon,
  EllipsisHorizontalIcon,
  GiftIcon,
  LightBulbIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import {
  Badge,
  Button,
  Card,
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
  SkeletonText,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@sushiswap/ui'
import { NetworkIcon } from '@sushiswap/ui/icons/NetworkIcon'
import { ColumnDef, Row, SortingState, TableState } from '@tanstack/react-table'
import Link from 'next/link'
import React, { FC, ReactNode, useCallback, useMemo, useState } from 'react'
import { ChainId } from 'sushi/chain'
import { isAngleEnabledChainId } from 'sushi/config'
import { Native, Token } from 'sushi/currency'
import { formatNumber, formatUSD } from 'sushi/format'
import { SushiSwapProtocol } from 'sushi/types'
import { ProtocolBadge } from './PoolNameCell'
import { usePoolFilters } from './PoolsFiltersProvider'
import { APR_COLUMN, TVL_COLUMN, VOLUME_1D_COLUMN } from './columns'

const COLUMNS = [
  {
    id: 'name',
    header: 'Name',

    cell: (props) => {
      const [token0, token1] = useMemo(
        () => [
          new Token({
            chainId: props.row.original.chainId,
            address: props.row.original.token0Address,
            decimals: 0,
          }),
          new Token({
            chainId: props.row.original.chainId,
            address: props.row.original.token1Address,
            decimals: 0,
          }),
        ],
        [props.row.original],
      )

      return (
        <div className="flex items-center gap-5">
          <div className="flex min-w-[54px]">
            {token0 && token1 ? (
              <Badge
                className="border-2 border-slate-900 rounded-full z-[11]"
                position="bottom-right"
                badgeContent={
                  <NetworkIcon
                    chainId={props.row.original.chainId as ChainId}
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
            ) : null}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-slate-50">
              {props.row.original.name}
              <div
                className={
                  'text-[10px] bg-gray-200 dark:bg-slate-700 rounded-lg px-1 ml-1'
                }
              />
            </span>
            <div className="flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {
                      ProtocolBadge[
                        props.row.original.protocol as SushiSwapProtocol
                      ]
                    }
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
                      {formatNumber(props.row.original.swapFee * 100)}%
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Swap fee</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {props.row.original.isIncentivized && (
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
              {props.row.original.isSmartPool && (
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
    },
    size: 300,
  },
  TVL_COLUMN,
  {
    id: 'volumeUSD1h',
    header: 'Volume (60min)',
    accessorFn: (row) => row.volumeUSD1h,
    sortingFn: ({ original: rowA }, { original: rowB }) =>
      rowA.volumeUSD1h - rowB.volumeUSD1h,
    cell: (props) =>
      formatUSD(props.row.original.volumeUSD1h).includes('NaN')
        ? '$0.00'
        : formatUSD(props.row.original.volumeUSD1h),
  },
  VOLUME_1D_COLUMN,
  {
    id: 'feeUSD1h',
    header: 'Fees (60min)',
    accessorFn: (row) => row.feeUSD1h,
    sortingFn: ({ original: rowA }, { original: rowB }) =>
      rowA.feeUSD1h - rowB.feeUSD1h,
    cell: (props) =>
      formatUSD(props.row.original.feeUSD1h).includes('NaN')
        ? '$0.00'
        : formatUSD(props.row.original.feeUSD1h),
  },
  {
    id: 'feeUSD1d',
    header: 'Fees (24h)',
    accessorFn: (row) => row.feeUSD1d,
    sortingFn: ({ original: rowA }, { original: rowB }) =>
      rowA.feeUSD1d - rowB.feeUSD1d,
    cell: (props) =>
      formatUSD(props.row.original.feeUSD1d).includes('NaN')
        ? '$0.00'
        : formatUSD(props.row.original.feeUSD1d),
  },
  APR_COLUMN,
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
              {row.original.name}
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
                  href={`/${row.original.chainId}/pool/v3/${row.original.address}`}
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
                  href={`/${row.original.chainId}/pool/v3/${row.original.address}/positions/create`}
                >
                  <PlusIcon width={16} height={16} className="mr-2" />
                  Create position
                </Link>
              </DropdownMenuItem>
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild={row.original.isSmartPool}>
                    <DropdownMenuItem
                      asChild
                      disabled={!row.original.isSmartPool}
                    >
                      <Link
                        onClick={(e) => e.stopPropagation()}
                        shallow={true}
                        className="flex items-center"
                        href={`/${row.original.chainId}/pool/v3/${row.original.address}/smart`}
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
                      {!row.original.isSmartPool
                        ? 'No Steer vaults available for this pool'
                        : `Smart pools optimize liquidity allocation within custom price ranges, enhancing trading efficiency by
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
                      <Link
                        onClick={(e) => e.stopPropagation()}
                        shallow={true}
                        className="flex items-center"
                        href={`/${
                          row.original.chainId
                        }/pool/incentivize?fromCurrency=${
                          row.original.token0Address ===
                          Native.onChain(row.original.chainId).wrapped.address
                            ? 'NATIVE'
                            : row.original.token0Address
                        }&toCurrency=${
                          row.original.token1Address ===
                          Native.onChain(row.original.chainId).wrapped.address
                            ? 'NATIVE'
                            : row.original.token1Address
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
              {row.original.name}
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
                  href={`/${row.original.chainId}/pool/v2/${row.original.address}/add`}
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
                  href={`/${row.original.chainId}/pool/v2/${row.original.address}/remove`}
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
                        href={`/${row.original.chainId}/pool/v2/${row.original.address}/stake`}
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
                  href={`/${row.original.chainId}/pool/v2/${row.original.address}/unstake`}
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
  } satisfies ColumnDef<TopPools[number], unknown>,
] as ColumnDef<TopPools[number], unknown>[]

interface PositionsTableProps {
  pools: TopPools
  onRowClick?(row: TopPools[number]): void
}

export const PoolsTable: FC<PositionsTableProps> = ({ pools, onRowClick }) => {
  const { tokenSymbols, protocols, farmsOnly, smartPoolsOnly } =
    usePoolFilters()

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'liquidityUSD', desc: true },
  ])

  const data = useMemo(
    () =>
      pools?.flat()?.filter((pool) => {
        if (
          tokenSymbols.length &&
          !tokenSymbols.some((tokenSymbol) =>
            pool.name.toLowerCase().includes(tokenSymbol.toLowerCase()),
          )
        )
          return false

        if (
          protocols.length &&
          !protocols.some((protocol) => pool.protocol === protocol)
        )
          return false

        if (smartPoolsOnly && !pool.isSmartPool) return false

        if (farmsOnly && !pool.isIncentivized) return false

        return true
      }) || [],
    [pools, tokenSymbols, protocols, farmsOnly, smartPoolsOnly],
  )

  const state: Partial<TableState> = useMemo(() => {
    return {
      sorting,
      pagination: {
        pageIndex: 0,
        pageSize: data?.length,
      },
    }
  }, [data?.length, sorting])

  const rowRenderer = useCallback(
    (row: Row<TopPools[number]>, rowNode: ReactNode) => {
      if (onRowClick)
        return (
          <Slot
            className="cursor-pointer"
            onClick={() => onRowClick?.(row.original)}
          >
            {rowNode}
          </Slot>
        )
      return rowNode
    },
    [onRowClick],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Pools{' '}
          {data.length ? (
            <span className="text-gray-400 dark:text-slate-500">
              ({data.length})
            </span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <DataTable
        state={state}
        onSortingChange={setSorting}
        loading={!pools}
        linkFormatter={(row) =>
          `pool/${
            row.protocol === SushiSwapProtocol.SUSHISWAP_V2 ? 'v2' : 'v3'
          }/${row.address}`
        }
        rowRenderer={rowRenderer}
        columns={COLUMNS}
        data={data}
      />
    </Card>
  )
}
