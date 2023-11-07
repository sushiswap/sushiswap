import { getCrossChainSwapEdgeConfig } from 'src/lib/edge/get-cross-chain-swap-edge-config'
import { DerivedstateCrossChainSwapProvider } from 'src/ui/swap/cross-chain/derivedstate-cross-chain-swap-provider'
import { EdgeProvider } from '../../../providers/edge-config-provider'
import { CrossChainSwapPendingTransactionsProvider } from '../../../ui/swap/cross-chain/cross-chain-swap-pending-transactions-provider'

export async function Providers({ children }: { children: React.ReactNode }) {
  const config = await getCrossChainSwapEdgeConfig()

  return (
    <EdgeProvider config={config}>
      <DerivedstateCrossChainSwapProvider>
        <CrossChainSwapPendingTransactionsProvider>
          {children}
        </CrossChainSwapPendingTransactionsProvider>
      </DerivedstateCrossChainSwapProvider>
    </EdgeProvider>
  )
}
