'use client'

import { PoolProvider } from '~aptos/pool/ui/pool/add/pool-add-provider/pool-add-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return <PoolProvider>{children}</PoolProvider>
}
