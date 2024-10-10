import { POOL_SUPPORTED_NETWORKS } from 'src/config'
import { SidebarContainer, SidebarProvider } from '~aptos/_common/ui/sidebar'
import { Header } from '../header'
import { Providers } from './providers'

export const metadata = {
  title: 'Pool',
}

export default function PoolLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <Providers>
      <SidebarProvider>
        <Header />
        <SidebarContainer
          supportedNetworks={POOL_SUPPORTED_NETWORKS}
          unsupportedNetworkHref={'/ethereum/explore/pools'}
          shiftContent
        >
          <main className="flex flex-col h-full flex-1">{children}</main>
        </SidebarContainer>
      </SidebarProvider>
    </Providers>
  )
}
