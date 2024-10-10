'use client'

import { SplashController } from '@sushiswap/ui'
import { SushiBarProvider } from 'src/ui/stake'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SplashController>
      <SushiBarProvider>{children}</SushiBarProvider>
    </SplashController>
  )
}
