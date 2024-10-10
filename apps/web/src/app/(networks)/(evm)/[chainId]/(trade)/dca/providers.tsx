import { EdgeProvider } from 'src/providers/edge-config-provider'
import { DerivedstateSimpleSwapProvider } from 'src/ui/swap/simple/derivedstate-simple-swap-provider'
import { getDCAEdgeConfig } from './get-dca-edge-config'

export async function Providers({ children }: { children: React.ReactNode }) {
  const config = await getDCAEdgeConfig()

  return (
    <EdgeProvider config={config}>
      <DerivedstateSimpleSwapProvider>
        {children}
      </DerivedstateSimpleSwapProvider>
    </EdgeProvider>
  )
}
