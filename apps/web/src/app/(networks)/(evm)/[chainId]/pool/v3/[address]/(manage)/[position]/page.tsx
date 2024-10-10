import { V3PositionView } from 'src/ui/pool/V3PositionView'

export default async function V3PositionsPage({
  params,
}: { params: { chainId: string; address: string; position: string } }) {
  return <V3PositionView params={params} />
}
