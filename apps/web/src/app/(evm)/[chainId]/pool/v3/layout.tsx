import { ChainId } from 'sushi/chain'
import { isSushiSwapV3ChainId } from 'sushi/config'
import notFound from '../../not-found'

export default function Layout({
  children,
  params,
}: { children: React.ReactNode; params: { chainId: string } }) {
  if (!isSushiSwapV3ChainId(+params.chainId as ChainId)) {
    return notFound()
  }

  return <>{children}</>
}
