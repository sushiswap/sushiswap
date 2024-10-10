'use client'

import { useSkaleEuropaFaucet } from 'src/lib/hooks'
import { CheckerProvider } from 'src/lib/wagmi/systems/Checker/Provider'

export function Providers({ children }: { children: React.ReactNode }) {
  useSkaleEuropaFaucet()
  return <CheckerProvider>{children}</CheckerProvider>
}
