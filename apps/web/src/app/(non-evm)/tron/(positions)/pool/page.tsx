import { Container } from '@sushiswap/ui'
import React from 'react'
import { TableFiltersResetButton } from 'src/ui/pool/TableFiltersResetButton'
import { TableFiltersSearchToken } from 'src/ui/pool/TableFiltersSearchToken'
import { PositionsTable } from '~tron/_common/ui/Pools/PositionsTable/PositionsTable'

export default function Page() {
  return (
    <Container maxWidth="7xl" className="px-4">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <TableFiltersSearchToken />
        <TableFiltersResetButton />
      </div>
      <PositionsTable hideNewPositionButton />
    </Container>
  )
}
