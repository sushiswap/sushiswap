import { isPoolChainId } from '@sushiswap/graph-client/data-api'
import { Container } from '@sushiswap/ui'
import { POOL_SUPPORTED_NETWORKS } from 'src/config'
import { PoolsFiltersProvider } from 'src/ui/pool'
import { ChainId } from 'sushi/chain'
import { SidebarContainer, SidebarProvider } from '~evm/_common/ui/sidebar'
import { Header } from '../header'
import notFound from '../not-found'
import { Hero } from './hero'
import { NavigationItems } from './navigation-items'

export default function PositionsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { chainId: string }
}) {
  const chainId = +params.chainId as ChainId

  if (!isPoolChainId(chainId)) {
    return notFound()
  }

  return (
    <SidebarProvider>
      <Header chainId={chainId} />
      <SidebarContainer
        shiftContent
        selectedNetwork={chainId}
        supportedNetworks={POOL_SUPPORTED_NETWORKS}
        unsupportedNetworkHref={'/ethereum/pool'}
      >
        <main className="flex flex-col h-full flex-1">
          <Container maxWidth="7xl" className="px-4 py-16">
            <Hero chainId={chainId} />
          </Container>
          <Container maxWidth="7xl" className="px-4 flex gap-2 pb-4">
            <NavigationItems />
          </Container>
          <section className="flex flex-col flex-1">
            <div className="bg-gray-50 dark:bg-white/[0.02] border-t border-accent pt-4 pb-10 min-h-screen">
              <PoolsFiltersProvider>{children}</PoolsFiltersProvider>
            </div>
          </section>
        </main>
      </SidebarContainer>
    </SidebarProvider>
  )
}
