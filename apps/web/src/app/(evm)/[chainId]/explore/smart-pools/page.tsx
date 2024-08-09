import { getSmartPools } from '@sushiswap/graph-client/data-api'
import { Container } from '@sushiswap/ui'
import { unstable_cache } from 'next/cache'
import React from 'react'
import { SmartPoolsTable } from 'src/ui/pool/SmartPoolsTable'
import { TableFiltersFarmsOnly } from 'src/ui/pool/TableFiltersFarmsOnly'
import { TableFiltersNetwork } from 'src/ui/pool/TableFiltersNetwork'
import { TableFiltersPoolType } from 'src/ui/pool/TableFiltersPoolType'
import { TableFiltersResetButton } from 'src/ui/pool/TableFiltersResetButton'
import { TableFiltersSearchToken } from 'src/ui/pool/TableFiltersSearchToken'
import { ChainId } from 'sushi/chain'

export default async function SmartPoolsPage({
  params,
}: {
  params: { chainId: string }
}) {
  const smartPools = await unstable_cache(
    async () => getSmartPools({ chainId: +params.chainId }),
    ['smart-pools', params.chainId],
    {
      revalidate: 60 * 3,
    },
  )()

  return (
    <Container maxWidth="7xl" className="px-4">
      <div className="flex flex-wrap gap-3 mb-4">
        <TableFiltersSearchToken />
        <TableFiltersPoolType />
        <TableFiltersNetwork chainId={+params.chainId as ChainId} />
        <TableFiltersFarmsOnly />
        <TableFiltersResetButton />
      </div>
      <SmartPoolsTable smartPools={smartPools} />
    </Container>
  )
}
