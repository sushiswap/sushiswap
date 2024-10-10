'use client'

import '@rainbow-me/rainbowkit/styles.css'

import { BaseProviders, OnramperProvider } from '@sushiswap/ui'
import { QueryClientProvider } from '../../providers/query-client-provider'
import { WagmiProvider } from '../../providers/wagmi-provider'

export function Providers({
  children,
  cookie,
}: { children: React.ReactNode; cookie: string | null }) {
  return (
    <BaseProviders>
      <OnramperProvider>
        <QueryClientProvider>
          <WagmiProvider cookie={cookie}>{children}</WagmiProvider>
        </QueryClientProvider>
      </OnramperProvider>
    </BaseProviders>
  )
}
