'use client'

import { Container } from '@sushiswap/ui'
import React from 'react'
import { ChainId } from 'sushi/chain'

import { PositionsTab } from 'src/ui/pool/PositionsTab'
import { TableFiltersNetwork } from 'src/ui/pool/TableFiltersNetwork'
import { TableFiltersResetButton } from 'src/ui/pool/TableFiltersResetButton'
import { TableFiltersSearchToken } from 'src/ui/pool/TableFiltersSearchToken'

export default function MyPositionsPage({
  params: { chainId },
}: {
  params: { chainId: string }
}) {
  return (
    <Container maxWidth="7xl" className="px-4">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <TableFiltersSearchToken />
        <TableFiltersNetwork chainId={+chainId as ChainId} />
        <TableFiltersResetButton />
      </div>
      <PositionsTab chainId={+chainId as ChainId} />
    </Container>
  )
}
