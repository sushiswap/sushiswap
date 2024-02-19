import { Card, CardContent, CardHeader, CardTitle } from '@sushiswap/ui'
import { FC } from 'react'
import { Pool } from 'utils/usePools'
import { PoolPositionDesktop } from './PoolPositionDesktop'
import { PoolPositionStakedDesktop } from './PoolPositionStakedDesktop'

interface PoolPositionProps {
  row: Pool
  isLoading: boolean
  stakeAmount: number
}

export const PoolPosition: FC<PoolPositionProps> = ({
  row,
  isLoading,
  stakeAmount,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Position</CardTitle>
      </CardHeader>
      <CardContent>
        <PoolPositionDesktop row={row} isLoading={isLoading} />
        <PoolPositionStakedDesktop
          row={row}
          isLoading={isLoading}
          stakeAmount={stakeAmount}
        />
      </CardContent>
    </Card>
  )
}
