import { ChainId } from 'sushi/chain'
import { isSushiSwapV2ChainId } from 'sushi/config'
import notFound from '../../not-found'

export default function Layout({
  children,
  params,
}: { children: React.ReactNode; params: { chainId: string } }) {
  if (!isSushiSwapV2ChainId(+params.chainId as ChainId)) {
    return notFound()
  }

  return <>{children}</>
}
