'use client'

import { ExternalLinkIcon } from '@heroicons/react-v1/solid'
import { ApprovedCommunityTokens } from '@sushiswap/graph-client/data-api/queries/token-list-submission'
import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  Container,
  DataTable,
  LinkExternal,
  SkeletonCircle,
  SkeletonText,
} from '@sushiswap/ui'
import { NetworkIcon } from '@sushiswap/ui/icons/NetworkIcon'
import { ColumnDef, SortingState, TableState } from '@tanstack/react-table'
import React, { useMemo, useState } from 'react'
import { useApprovedCommunityTokens } from 'src/lib/hooks'
import { Chain } from 'sushi/chain'
import { shortenAddress } from 'sushi/format'
import { NavigationItems } from '../navigation-items'

const COLUMNS: ColumnDef<ApprovedCommunityTokens[number], unknown>[] = [
  {
    id: 'chain',
    header: 'Network',
    accessorFn: (row) => row.chainId,
    cell: (props) => Chain.from(props.row.original.chainId)?.name,
    meta: { skeleton: <SkeletonText fontSize="lg" /> },
  },
  {
    id: 'logo',
    header: 'Logo',
    cell: (props) => (
      <div className="flex">
        <Badge
          className="border-2 border-slate-900 rounded-full z-[11]"
          position="bottom-right"
          badgeContent={
            <NetworkIcon
              chainId={props.row.original.chainId}
              width={12}
              height={12}
            />
          }
        >
          <div className="h-8 w-8 rounded-full overflow-hidden border-2 ring-gray-50 dark:ring-slate-950">
            <img
              src={props.row.original.logoUrl}
              width={32}
              height={32}
              alt={props.row.original.symbol}
            />
          </div>
        </Badge>
      </div>
    ),
    meta: {
      skeleton: <SkeletonCircle radius={32} />,
    },
  },
  {
    id: 'name',
    header: 'Name',
    accessorFn: (row) => row.name,
    cell: (props) => props.row.original.name,
    meta: {
      skeleton: <SkeletonText fontSize="lg" />,
    },
  },
  {
    id: 'symbol',
    header: 'Symbol',
    accessorFn: (row) => row.symbol,
    cell: (props) => props.row.original.symbol,
    meta: {
      skeleton: <SkeletonText fontSize="lg" />,
    },
  },
  {
    id: 'address',
    header: 'Address',
    cell: (props) => (
      <div className="flex flex-nowrap gap-1">
        <span className="block sm:hidden">
          {shortenAddress(props.row.original.address)}
        </span>
        <span className="hidden sm:block">{props.row.original.address}</span>
        <LinkExternal
          target="_blank"
          href={Chain.from(props.row.original.chainId)?.getTokenUrl(
            props.row.original.address,
          )}
        >
          <ExternalLinkIcon className="w-4 h-4" />
        </LinkExternal>
      </div>
    ),
    meta: {
      skeleton: <SkeletonText fontSize="lg" />,
    },
  },
]

export default function ApprovedTokensPage() {
  const { data, isLoading } = useApprovedCommunityTokens()

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ])

  const state: Partial<TableState> = useMemo(() => {
    return {
      sorting,
      pagination: {
        pageIndex: 0,
        pageSize: data?.length ?? 0,
      },
    }
  }, [data?.length, sorting])

  return (
    <>
      <Container
        maxWidth="7xl"
        className="px-4 h-[200px] shrink-0 flex flex-col justify-center gap-2"
      >
        <h1 className="text-4xl font-bold">Approved List</h1>
        <p className="text-sm text-muted-foreground">
          Approved community tokens.
        </p>
      </Container>
      <NavigationItems />
      <div className="bg-gray-50 dark:bg-white/[0.02] border-t border-accent h-full">
        <Container maxWidth="7xl" className="px-4 py-10">
          <Card>
            <CardHeader>
              <CardTitle>Last 25 Approved Tokens</CardTitle>
            </CardHeader>
            <DataTable
              state={state}
              onSortingChange={setSorting}
              loading={isLoading}
              columns={COLUMNS}
              data={data ?? []}
            />
          </Card>
        </Container>
      </div>
    </>
  )
}
