'use client'

import { Container } from '@sushiswap/ui'
import { TableFiltersSearchToken } from 'components/TableFiltersSearchToken'
import { PoolsTable } from '../../../components/PoolsSection/Tables/PoolsTable'
import { TableFiltersFarmsOnly } from '../../../components/TableFiltersFarmsOnly'

export default async function PoolPage() {
  return (
    <Container maxWidth="7xl" className="px-4">
      <div className="flex flex-wrap gap-3 mb-4">
        <TableFiltersSearchToken />
        <TableFiltersFarmsOnly />
      </div>
      <PoolsTable />
    </Container>
  )
}
