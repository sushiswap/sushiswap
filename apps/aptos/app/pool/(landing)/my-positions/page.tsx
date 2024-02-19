'use client'

import { Container } from '@sushiswap/ui'
import { TableFiltersFarmsOnly } from 'components/TableFiltersFarmsOnly'
import { PositionsTable } from '../../../../components/PoolsSection/Tables/PositionsTable'
import { TableFiltersSearchToken } from '../../../../components/TableFiltersSearchToken'

export default function MyPositionsPage() {
  return (
    <Container maxWidth="7xl" className="px-4">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <TableFiltersSearchToken />
        <TableFiltersFarmsOnly />
      </div>
      <PositionsTable />
    </Container>
  )
}
