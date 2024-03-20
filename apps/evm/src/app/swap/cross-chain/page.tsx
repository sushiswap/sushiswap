import { Container } from '@sushiswap/ui'
import { CrossChainSwapWidget } from 'src/ui/swap/cross-chain/cross-chain-swap-widget'

export const metadata = {
  title: 'Cross-Chain Swap',
}

export default async function SwapCrossChainPage() {
  return (
    <Container maxWidth="lg" className="px-4">
      <CrossChainSwapWidget />
    </Container>
  )
}
