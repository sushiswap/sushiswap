import { TWAP_SUPPORTED_CHAIN_IDS, isTwapSupportedChainId } from 'src/config'
import { ChainId } from 'sushi/chain'
import NotFound from '~evm/[chainId]/not-found'
import { SidebarContainer } from '~evm/_common/ui/sidebar'
import { Providers } from './providers'

export default function SwapDCALayout({
  children,
  params,
}: { children: React.ReactNode; params: { chainId: string } }) {
  const chainId = +params.chainId as ChainId

  if (!isTwapSupportedChainId(chainId)) {
    return NotFound()
  }

  return (
    <Providers>
      <SidebarContainer
        selectedNetwork={chainId}
        supportedNetworks={TWAP_SUPPORTED_CHAIN_IDS}
        unsupportedNetworkHref="/ethereum/dca"
      >
        <main className="lg:p-4 mt-16 mb-[86px]">{children}</main>
      </SidebarContainer>
    </Providers>
  )
}
