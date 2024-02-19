import React, { FC, useMemo } from 'react'
import { Row } from './types'
import { Pool } from 'utils/usePools'
import { useTokensFromPools } from 'utils/useTokensFromPool'
import { formatUSD } from 'sushi'
import useStablePrice from 'utils/useStablePrice'

export const PoolTVLCell: FC<Row<Pool>> = ({ row }) => {
  const { token0, token1 } = useTokensFromPools(row)

  const [reserve0, reserve1] = useMemo(() => {
    return [row?.data?.balance_x?.value, row?.data?.balance_y?.value]
  }, [row])

  const token0Price = useStablePrice(token0) ?? 0
  const token1Price = useStablePrice(token1) ?? 0

  console.log(
    formatUSD(token0Price * Number(reserve0) + token1Price * Number(reserve1)),
  )
  const poolTvl = formatUSD(
    token0Price * Number(reserve0) + token1Price * Number(reserve1),
  )

  return (
    <div className="flex items-center gap-1">
      <div className="flex flex-col gap-0.5">
        <span className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-slate-50">
          {formatUSD(poolTvl)}
        </span>
      </div>
    </div>
  )
}
