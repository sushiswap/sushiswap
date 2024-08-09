import { CardCurrencyAmountItem, CardGroup, CardLabel } from '@sushiswap/ui'
import { FC } from 'react'
import { formatUSD } from 'sushi/format'

import { V2Pool } from '@sushiswap/graph-client/data-api'
import { usePoolPositionStaked } from './PoolPositionStakedProvider'

interface PoolPositionStakedDesktopProps {
  pool: V2Pool
}

export const PoolPositionStakedDesktop: FC<PoolPositionStakedDesktopProps> = ({
  pool,
}) => {
  const { value1, value0, underlying1, underlying0, isLoading } =
    usePoolPositionStaked()

  if (!pool.incentives.length) return <></>

  return (
    <CardGroup>
      <CardLabel>Staked</CardLabel>
      <CardCurrencyAmountItem
        isLoading={isLoading}
        amount={underlying0}
        fiatValue={formatUSD(value0)}
      />
      <CardCurrencyAmountItem
        isLoading={isLoading}
        amount={underlying1}
        fiatValue={formatUSD(value1)}
      />
    </CardGroup>
  )
}
