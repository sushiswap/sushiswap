import { RemoveProvider } from '~tron/_common/ui/Pools/Remove/pool-remove-provider'
import { PoolProvider } from '~tron/_common/ui/Pools/pool-provider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PoolProvider>
      <RemoveProvider>{children}</RemoveProvider>
    </PoolProvider>
  )
}
