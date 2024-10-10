import { ChainId } from 'sushi/chain'
import { SidebarProvider } from '~evm/_common/ui/sidebar'
import { Header } from '../header'
import { Providers } from './providers'

export default function TradeLayout({
  children,
  params,
}: { children: React.ReactNode; params: { chainId: string } }) {
  const chainId = +params.chainId as ChainId

  return (
    <Providers>
      <SidebarProvider>
        <Header chainId={chainId} />
        {children}
      </SidebarProvider>
    </Providers>
  )
}
