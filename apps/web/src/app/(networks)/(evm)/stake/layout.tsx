import { Container } from '@sushiswap/ui'
import { BarHeader } from 'src/ui/stake'
import { ChainId } from 'sushi/chain'
import { Header } from '~evm/[chainId]/header'
import { SidebarContainer, SidebarProvider } from '~evm/_common/ui/sidebar'
import { Providers } from './providers'

export const metadata = {
  title: 'Stake',
  description: 'Stake SUSHI in the SushiBar to earn more SUSHI.',
}

const supportedNetworks = [ChainId.ETHEREUM]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <SidebarProvider defaultOpen={false}>
        <Header chainId={ChainId.ETHEREUM} />
        <SidebarContainer
          selectedNetwork={ChainId.ETHEREUM}
          supportedNetworks={supportedNetworks}
          shiftContent
        >
          <div className="flex flex-col flex-1 overflow-y-auto">
            <Container maxWidth="5xl" className="px-4 pt-16 mb-12">
              <BarHeader />
            </Container>
            <section className="flex flex-col flex-1">
              <div className="bg-gray-50 dark:bg-white/[0.02] border-t border-accent pt-9 pb-10 h-full">
                {children}
              </div>
            </section>
          </div>
        </SidebarContainer>
      </SidebarProvider>
    </Providers>
  )
}
