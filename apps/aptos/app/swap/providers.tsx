import { EdgeProvider } from 'providers/edge-config-provider'
import { SwapProvider } from './trade/TradeProvider'
import { getSwapEdgeConfig } from 'lib/edge/get-swap-edge-config'

export async function Providers({ children }: { children: React.ReactNode }) {
  const config = await getSwapEdgeConfig()

  return (
    <EdgeProvider config={config}>
      <SwapProvider>{children}</SwapProvider>
    </EdgeProvider>
  )
}
