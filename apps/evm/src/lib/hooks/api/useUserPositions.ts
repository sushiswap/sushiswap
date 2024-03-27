'use client'

import { Pools, parseArgs } from '@sushiswap/client'
import { UserPosition } from '@sushiswap/graph-client'
import { useMemo } from 'react'
import { ChainId } from 'sushi/chain'
import useSWR from 'swr'

import { PositionWithPool } from '../../../types'
import { useGraphPools } from './useGraphPools'

export interface GetUserArgs {
  id?: string
  chainIds?: ChainId[]
}

export function getUserPositionsUrl(args: GetUserArgs) {
  return `/pool/api/user/${parseArgs(args)}`
}

const transformPositions = (positions?: UserPosition[], pools?: Pools) =>
  positions && pools
    ? positions
        .map((position) => {
          const pool = pools.find((pool) => pool.id === position.pool)

          return { ...position, pool }
        })
        .filter((position): position is PositionWithPool => !!position.pool)
    : undefined

export function useUserPositions(args: GetUserArgs, shouldFetch = true) {
  const { data: positions } = useSWR<UserPosition[]>(
    shouldFetch && args.id ? getUserPositionsUrl(args) : null,
    async (url) => fetch(url).then((data) => data.json()),
  )

  const _positions = useMemo(
    () => positions?.map((position) => position.pool) || [],
    [positions],
  )
  const pools = useGraphPools(_positions)

  const isValidating =
    !positions || !pools || (positions.length > 0 && pools.length === 0)

  return useMemo(
    () => ({
      data: !isValidating
        ? transformPositions(positions, pools)?.filter((position) =>
            Array.isArray(args.chainIds)
              ? args.chainIds?.includes(position.chainId as ChainId)
              : true,
          )
        : undefined,
      isValidating,
    }),
    [args.chainIds, isValidating, pools, positions],
  )
}
