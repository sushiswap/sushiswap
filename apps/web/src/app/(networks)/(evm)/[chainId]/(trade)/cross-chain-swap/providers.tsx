import { getCrossChainSwapEdgeConfig } from './get-cross-chain-swap-edge-config'

import { EdgeProvider } from 'src/providers/edge-config-provider'
import { DerivedstateCrossChainSwapProvider } from 'src/ui/swap/cross-chain/derivedstate-cross-chain-swap-provider'

export async function Providers({ children }: { children: React.ReactNode }) {
  const config = await getCrossChainSwapEdgeConfig()

  return (
    <EdgeProvider config={config}>
      <DerivedstateCrossChainSwapProvider>
        {children}
      </DerivedstateCrossChainSwapProvider>
    </EdgeProvider>
  )
}
