import { ChainId } from 'sushi/chain'
import { isSushiSwapV2ChainId } from 'sushi/config'
import notFound from '../../not-found'

export default function Layout({
  children,
  params,
}: { children: React.ReactNode; params: { chainId: string } }) {
  const chainId = +params.chainId as ChainId
  if (!isSushiSwapV2ChainId(chainId)) {
    return notFound(chainId)
  }

  return <>{children}</>
}
