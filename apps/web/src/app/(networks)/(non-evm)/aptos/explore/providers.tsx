'use client'

import { Suspense } from 'react'
import { PoolsFiltersProvider } from 'src/ui/pool'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <PoolsFiltersProvider>{children}</PoolsFiltersProvider>
    </Suspense>
  )
}
