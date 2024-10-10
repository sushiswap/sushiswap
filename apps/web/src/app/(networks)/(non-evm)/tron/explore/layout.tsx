import { Container } from '@sushiswap/ui'
import { POOL_SUPPORTED_NETWORKS } from 'src/config'
import { SidebarContainer, SidebarProvider } from '~tron/_common/ui/sidebar'
import { Header } from '~tron/header'
import { Hero } from './hero'
import { Providers } from './providers'

export const metadata = {
  title: 'Pools 💦',
}

export default function ExploreLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Header />
      <SidebarContainer
        supportedNetworks={POOL_SUPPORTED_NETWORKS}
        unsupportedNetworkHref={'/ethereum/explore/pools'}
        shiftContent
      >
        <main className="flex flex-col h-full flex-1">
          <Container maxWidth="7xl" className="px-4 py-[9.5rem]">
            <Hero />
          </Container>
          <section className="flex flex-col min-h-screen">
            <div className="flex-1 bg-gray-50 dark:bg-white/[0.02] border-t border-accent pt-4 pb-10">
              <Providers>{children}</Providers>
            </div>
          </section>
        </main>
      </SidebarContainer>
    </SidebarProvider>
  )
}
