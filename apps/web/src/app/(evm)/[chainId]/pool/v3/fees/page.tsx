import { getV3BasePools } from '@sushiswap/graph-client/data-api'
import { Card, Container } from '@sushiswap/ui'
import { unstable_cache } from 'next/cache'
import { TableFiltersNetwork } from 'src/ui/pool/TableFiltersNetwork'
import { V3FeesTable } from 'src/ui/pool/V3FeesTable'
import { ChainId } from 'sushi'
import { SushiSwapV3ChainId } from 'sushi/config'

export default async function Page({
  params,
}: { params: { chainId: string } }) {
  const pools = await unstable_cache(
    async () =>
      getV3BasePools({ chainId: +params.chainId as SushiSwapV3ChainId }),
    ['operational-v3-pools', params.chainId],
    {
      revalidate: 60 * 15,
    },
  )()

  return (
    <Container maxWidth="7xl" className="px-4 flex flex-col gap-4">
      <div className="text-right">
        <TableFiltersNetwork chainId={+params.chainId as ChainId} />
      </div>
      <Card>
        <V3FeesTable chainId={+params.chainId as ChainId} pools={pools} />
      </Card>
    </Container>
  )
}
