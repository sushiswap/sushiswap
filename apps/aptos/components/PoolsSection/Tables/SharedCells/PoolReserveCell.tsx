import React, { FC, useMemo } from 'react'
import { Row } from './types'
import { Pool } from 'utils/usePools'
import { useTokensFromPools } from 'utils/useTokensFromPool'
import { formatNumber } from 'utils/utilFunctions'

export const PoolReserveCell: FC<Row<Pool>> = ({ row }) => {
  const { token0, token1 } = useTokensFromPools(row)

  const [reserve_x, reserve_y] = useMemo(() => {
    return [
      formatNumber(Number(row?.data?.balance_x?.value), token0.decimals),
      formatNumber(Number(row?.data?.balance_y?.value), token1.decimals),
    ]
  }, [row, token0, token1])

  return (
    <div className="flex items-center gap-1">
      <div className="flex flex-col gap-0.5">
        <span className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-slate-50">
          {parseFloat(reserve_x)} {token0?.symbol}{' '}
          <span className="font-normal text-gray-900 dark:text-slate-500">
            /
          </span>{' '}
          {parseFloat(reserve_y)} {token1?.symbol}{' '}
        </span>
      </div>
    </div>
  )
}
