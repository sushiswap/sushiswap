import { ChainId } from 'sushi/chain'
import {
  SUSHIXSWAP_2_SUPPORTED_CHAIN_IDS,
  isSushiXSwap2ChainId,
} from 'sushi/config'
import NotFound from '~evm/[chainId]/not-found'
import { SidebarContainer } from '~evm/_common/ui/sidebar'
import { Providers } from './providers'

export default function CrossChainSwapLayout({
  children,
  params,
}: { children: React.ReactNode; params: { chainId: string } }) {
  const chainId = +params.chainId as ChainId

  if (!isSushiXSwap2ChainId(chainId)) {
    return NotFound()
  }

  return (
    <Providers>
      <SidebarContainer
        selectedNetwork={chainId}
        supportedNetworks={SUSHIXSWAP_2_SUPPORTED_CHAIN_IDS}
        unsupportedNetworkHref="/ethereum/cross-chain-swap"
      >
        <main className="lg:p-4 mt-16 mb-[86px]">{children}</main>
      </SidebarContainer>
    </Providers>
  )
}
