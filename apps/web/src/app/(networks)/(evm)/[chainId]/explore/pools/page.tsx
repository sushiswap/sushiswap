import { isPoolChainId } from '@sushiswap/graph-client/data-api'
import { Container } from '@sushiswap/ui'
import React from 'react'
import { POOL_SUPPORTED_NETWORKS } from 'src/config'
import { PoolsTable } from 'src/ui/pool/PoolsTable'
import { TableFiltersSmartPoolsOnly } from 'src/ui/pool/TableFilterSmartPoolsOnly'
import { TableFiltersFarmsOnly } from 'src/ui/pool/TableFiltersFarmsOnly'
import { TableFiltersNetwork } from 'src/ui/pool/TableFiltersNetwork'
import { TableFiltersPoolType } from 'src/ui/pool/TableFiltersPoolType'
import { TableFiltersResetButton } from 'src/ui/pool/TableFiltersResetButton'
import { TableFiltersSearchToken } from 'src/ui/pool/TableFiltersSearchToken'
import { ChainId } from 'sushi/chain'
import notFound from '../../not-found'

export default async function PoolsPage({
  params,
}: {
  params: { chainId: string }
}) {
  const chainId = +params.chainId as ChainId
  if (!isPoolChainId(chainId)) return notFound()

  return (
    <Container maxWidth="7xl" className="px-4">
      <div className="flex flex-wrap gap-3 mb-4">
        <TableFiltersSearchToken />
        <TableFiltersPoolType />
        <TableFiltersNetwork
          network={chainId}
          supportedNetworks={POOL_SUPPORTED_NETWORKS}
          unsupportedNetworkHref="/ethereum/explore/pools"
          className="lg:hidden block"
        />
        <TableFiltersFarmsOnly />
        <TableFiltersSmartPoolsOnly />
        <TableFiltersResetButton />
      </div>
      <PoolsTable chainId={chainId} />
    </Container>
  )
}
