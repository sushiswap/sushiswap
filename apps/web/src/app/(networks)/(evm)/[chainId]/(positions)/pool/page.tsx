'use client'

import { Container } from '@sushiswap/ui'
import { notFound } from 'next/navigation'
import React from 'react'
import { POOL_SUPPORTED_NETWORKS } from 'src/config'
import { PositionsTab } from 'src/ui/pool/PositionsTab'
import { TableFiltersNetwork } from 'src/ui/pool/TableFiltersNetwork'
import { TableFiltersResetButton } from 'src/ui/pool/TableFiltersResetButton'
import { TableFiltersSearchToken } from 'src/ui/pool/TableFiltersSearchToken'
import { ChainId } from 'sushi/chain'
import { isSushiSwapChainId } from 'sushi/config'

export default function MyPositionsPage({
  params,
}: {
  params: { chainId: string }
}) {
  const chainId = +params.chainId as ChainId

  if (!isSushiSwapChainId(chainId)) {
    return notFound()
  }

  return (
    <Container maxWidth="7xl" className="px-4">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <TableFiltersSearchToken />
        <TableFiltersNetwork
          network={chainId}
          supportedNetworks={POOL_SUPPORTED_NETWORKS}
          unsupportedNetworkHref="/ethereum/pool"
          className="lg:hidden block"
        />
        <TableFiltersResetButton />
      </div>
      <PositionsTab chainId={chainId} />
    </Container>
  )
}
