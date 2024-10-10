'use client'

import { PoolProvider } from '~tron/_common/ui/Pools/pool-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return <PoolProvider>{children}</PoolProvider>
}
