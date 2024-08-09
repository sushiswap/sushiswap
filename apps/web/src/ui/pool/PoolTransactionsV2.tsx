'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  Toggle,
} from '@sushiswap/ui'
import { useQuery } from '@tanstack/react-query'
import { PaginationState } from '@tanstack/react-table'
import { FC, useMemo, useState } from 'react'
import { Chain, ChainId } from 'sushi/chain'
import { SushiSwapV2ChainId, isSushiSwapV2ChainId } from 'sushi/config'

import {
  V2Pool,
  getSushiV2Burns,
  getSushiV2Mints,
  getSushiV2Swaps,
} from '@sushiswap/graph-client/data-api'

import {
  TX_AMOUNT_IN_V2_COLUMN,
  TX_AMOUNT_OUT_V2_COLUMN,
  TX_AMOUNT_USD_V2_COLUMN,
  TX_CREATED_TIME_V2_COLUMN,
  TX_SENDER_V2_COLUMN,
} from './columns'

export enum TransactionType {
  Mint = 'Mint',
  Burn = 'Burn',
  Swap = 'Swap',
}

interface UseTransactionsV2Opts {
  type?: TransactionType | 'All'
  refetchInterval?: number
  first: number
  skip?: number
}

const fetchMints = async (address: string, chainId: SushiSwapV2ChainId) => {
  const mints = await getSushiV2Mints({
    chainId,
    address,
  })

  return mints.map((mint) => ({
    ...mint.transaction,
    mints: [mint],
    burns: [],
    swaps: [],
  }))
}

const fetchBurns = async (address: string, chainId: SushiSwapV2ChainId) => {
  const burns = await getSushiV2Burns({
    chainId,
    address,
  })

  return burns.map((burn) => ({
    ...burn.transaction,
    mints: [],
    burns: [burn],
    swaps: [],
  }))
}

const fetchSwaps = async (address: string, chainId: SushiSwapV2ChainId) => {
  const swaps = await getSushiV2Swaps({
    chainId,
    address,
  })

  return swaps.map((swap) => ({
    ...swap.transaction,
    mints: [],
    burns: [],
    swaps: [swap],
  }))
}

// Will only support the last 1k txs
// The fact that there are different subtransactions aggregated under one transaction makes paging a bit difficult
function useTransactionsV2(
  pool: V2Pool | undefined | null,
  poolId: string,
  opts: UseTransactionsV2Opts,
) {
  return useQuery({
    queryKey: ['poolTransactionsV2', poolId, pool?.chainId, opts],
    queryFn: async () => {
      const chainId = pool?.chainId as ChainId

      if (!pool || !isSushiSwapV2ChainId(chainId)) return []

      let transactions

      switch (opts.type) {
        case TransactionType.Burn:
          transactions = await fetchBurns(poolId, chainId)
          break
        case TransactionType.Mint:
          transactions = await fetchMints(poolId, chainId)
          break
        case TransactionType.Swap:
          transactions = await fetchSwaps(poolId, chainId)
          break
        default:
          transactions = await fetchSwaps(poolId, chainId)
      }

      if (!transactions.length) return []

      return transactions.flatMap((transaction) => {
        const mints = (
          transaction.mints as NonNullable<(typeof transaction.mints)[0]>[]
        ).map((mint) => ({
          ...mint,
          sender: String(mint.sender),
          amount0: Number(mint.amount0),
          amount1: Number(mint.amount1),
          type: TransactionType.Mint as const,
        }))

        const burns = (
          transaction.burns as NonNullable<(typeof transaction.burns)[0]>[]
        ).map((burn) => ({
          ...burn,
          sender: String(burn.sender),
          amount0: Number(burn.amount0),
          amount1: Number(burn.amount1),
          type: TransactionType.Burn as const,
        }))

        const swaps = (
          transaction.swaps as NonNullable<(typeof transaction.swaps)[0]>[]
        ).map((swap) => ({
          ...swap,
          sender: String(swap.sender),
          to: String(swap.to),
          amountIn: Number(
            swap.amount0In !== '0' ? swap.amount0In : swap.amount1In,
          ),
          amountOut: Number(
            swap.amount0Out !== '0' ? swap.amount0Out : swap.amount1Out,
          ),
          type: TransactionType.Swap as const,
        }))

        return [...mints, ...burns, ...swaps]
          .flatMap((subtransaction) => ({
            symbol0: pool.token0.symbol,
            symbol1: pool.token1.symbol,
            chainId,
            txHash: transaction.id,
            createdAtTimestamp: Number(transaction.createdAtTimestamp),
            createdAtBlock: Number(transaction.createdAtBlock),
            ...subtransaction,
            amountUSD: Number(subtransaction.amountUSD),
            logIndex: Number(subtransaction.logIndex),
          }))
          .sort((a, b) => b.logIndex - a.logIndex)
      })
    },
    enabled: !!pool && isSushiSwapV2ChainId(pool?.chainId as ChainId),
    refetchInterval: opts?.refetchInterval,
  })
}

type Transaction = NonNullable<ReturnType<typeof useTransactionsV2>['data']>[0]

interface PoolTransactionsV2Props {
  pool: V2Pool | undefined | null
  poolId: string
}

const PoolTransactionsV2: FC<PoolTransactionsV2Props> = ({ pool, poolId }) => {
  const [type, setType] = useState<
    Parameters<typeof useTransactionsV2>['2']['type']
  >(TransactionType.Swap)
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const COLUMNS = useMemo(() => {
    return [
      TX_SENDER_V2_COLUMN,
      TX_AMOUNT_IN_V2_COLUMN(type),
      TX_AMOUNT_OUT_V2_COLUMN(type),
      TX_AMOUNT_USD_V2_COLUMN,
      TX_CREATED_TIME_V2_COLUMN,
    ]
  }, [type])

  const opts = useMemo(
    () =>
      ({
        refetchInterval: 60_000,
        first:
          paginationState.pageSize === 0 ? paginationState.pageIndex + 1 : 100,
        type,
      }) as const,
    [paginationState.pageIndex, paginationState.pageSize, type],
  )

  const { data, isLoading } = useTransactionsV2(pool, poolId, opts)

  const _data = useMemo(() => {
    return data ?? []
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex flex-col md:flex-row justify-between gap-y-4">
            Transactions
            <div className="flex items-center gap-1">
              <Toggle
                variant="outline"
                size="xs"
                pressed={type === TransactionType.Swap}
                onClick={() => setType(TransactionType.Swap)}
              >
                Swaps
              </Toggle>
              <Toggle
                variant="outline"
                size="xs"
                pressed={type === TransactionType.Mint}
                onClick={() => setType(TransactionType.Mint)}
              >
                Add
              </Toggle>
              <Toggle
                variant="outline"
                size="xs"
                pressed={type === TransactionType.Burn}
                onClick={() => setType(TransactionType.Burn)}
              >
                Remove
              </Toggle>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="!px-0">
        <DataTable
          linkFormatter={(row) =>
            Chain.from(row.chainId)?.getTxUrl(row.txHash) ?? ''
          }
          loading={isLoading}
          columns={COLUMNS}
          data={_data}
          pagination={true}
          externalLink={true}
          onPaginationChange={setPaginationState}
          state={{
            pagination: paginationState,
          }}
        />
      </CardContent>
    </Card>
  )
}

export { PoolTransactionsV2, useTransactionsV2 }
export type { Transaction }
