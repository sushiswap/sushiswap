import { Container } from '@sushiswap/ui'
import React from 'react'
import { POOL_SUPPORTED_NETWORKS } from 'src/config'
import { TableFiltersNetwork } from 'src/ui/pool/TableFiltersNetwork'
import { TableFiltersSearchToken } from 'src/ui/pool/TableFiltersSearchToken'
import { PoolsTable } from '~aptos/pool/ui/tables/pools/pools-table'

export default async function PoolsPage() {
  return (
    <Container maxWidth="7xl" className="px-4">
      <div className="flex flex-wrap gap-3 mb-4">
        <TableFiltersSearchToken />
        <TableFiltersNetwork
          network={'aptos'}
          supportedNetworks={POOL_SUPPORTED_NETWORKS}
          unsupportedNetworkHref="/ethereum/explore/pools"
          className="lg:hidden block"
        />
      </div>
      <PoolsTable />
    </Container>
  )
}
