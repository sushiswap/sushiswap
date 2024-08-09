import { Container, LinkInternal } from '@sushiswap/ui'
import { V3PositionView } from 'src/ui/pool/V3PositionView'

export default async function V3PositionsPage({
  params,
}: { params: { chainId: string; address: string; position: string } }) {
  return (
    <Container maxWidth="5xl" className="px-2 sm:px-4">
      <div className="flex flex-col gap-4">
        <LinkInternal
          href={`/pool/${params.chainId}`} // TODO
          className="text-blue hover:underline text-sm"
        >
          ← View all positions
        </LinkInternal>
        <V3PositionView params={params} />
      </div>
    </Container>
  )
}
