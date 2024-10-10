import { isPoolChainId } from '@sushiswap/graph-client/data-api'
import { POOL_SUPPORTED_NETWORKS } from 'src/config'
import { ChainId } from 'sushi/chain'
import { SidebarContainer, SidebarProvider } from '~evm/_common/ui/sidebar'
import { Header } from '../header'
import notFound from '../not-found'

export const metadata = {
  title: 'Pool 💦',
}

export default function PoolLayout({
  children,
  params,
}: { children: React.ReactNode; params: { chainId: string } }) {
  const chainId = +params.chainId as ChainId
  if (!isPoolChainId(chainId)) {
    return notFound()
  }

  return (
    <SidebarProvider>
      <Header chainId={chainId} />
      <SidebarContainer
        selectedNetwork={chainId}
        supportedNetworks={POOL_SUPPORTED_NETWORKS}
        unsupportedNetworkHref={'/ethereum/explore/pools'}
        shiftContent
      >
        <main className="flex flex-col h-full flex-1">{children}</main>
      </SidebarContainer>
    </SidebarProvider>
  )
}
