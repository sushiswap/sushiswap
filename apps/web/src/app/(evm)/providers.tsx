'use client'

import '@rainbow-me/rainbowkit/styles.css'

import { BaseProviders, OnramperProvider } from '@sushiswap/ui'

import { QueryClientProvider } from '../../providers/query-client-provider'
import { WagmiProvider } from '../../providers/wagmi-provider'
import { BalanceProvider } from './_common/ui/balance-provider/balance-provider'
import { PriceProvider } from './_common/ui/price-provider/price-provider/price-provider'

export function Providers({
  children,
  cookie,
}: { children: React.ReactNode; cookie: string | null }) {
  return (
    <BaseProviders>
      <OnramperProvider>
        <QueryClientProvider>
          <WagmiProvider cookie={cookie}>
            <PriceProvider>
              <BalanceProvider>{children}</BalanceProvider>
            </PriceProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </OnramperProvider>
    </BaseProviders>
  )
}
