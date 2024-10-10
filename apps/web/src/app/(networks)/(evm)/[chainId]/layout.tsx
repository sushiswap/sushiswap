import { isSupportedChainId } from 'src/config'
import notFound from './not-found'
import { Providers } from './providers'

export default function PoolLayout({
  children,
  params: { chainId },
}: { children: React.ReactNode; params: { chainId: string } }) {
  if (!isSupportedChainId(+chainId)) {
    return notFound()
  }

  return <Providers>{children}</Providers>
}
