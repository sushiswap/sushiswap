import { Container } from '@sushiswap/ui'
import React from 'react'
import { TableFiltersResetButton } from 'src/ui/pool/TableFiltersResetButton'
import { TableFiltersSearchToken } from 'src/ui/pool/TableFiltersSearchToken'
import { PoolsTable } from '~tron/_common/ui/Pools/PoolsTable/PoolsTable'

export default async function PoolsPage() {
  return (
    <Container maxWidth="7xl" className="px-4">
      <div className="flex flex-wrap gap-3 mb-4">
        <TableFiltersSearchToken />
        <TableFiltersResetButton />
      </div>
      <PoolsTable />
    </Container>
  )
}
