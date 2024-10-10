import { SUPPORTED_NETWORKS, isSupportedChainId } from 'src/config'
import { ChainId } from 'sushi/chain'
import NotFound from '~evm/[chainId]/not-found'
import { SidebarContainer } from '~evm/_common/ui/sidebar'
import { Providers } from './providers'

export default function SwapLayout({
  children,
  params,
}: { children: React.ReactNode; params: { chainId: string } }) {
  const chainId = +params.chainId as ChainId

  if (!isSupportedChainId) {
    return NotFound()
  }

  return (
    <Providers>
      <SidebarContainer
        selectedNetwork={chainId}
        supportedNetworks={SUPPORTED_NETWORKS}
        unsupportedNetworkHref="/ethereum/swap"
      >
        <main className="lg:p-4 mt-16 mb-[86px]">{children}</main>
      </SidebarContainer>
    </Providers>
  )
}
