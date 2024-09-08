import { HotJar, classNames } from '@sushiswap/ui'
import React from 'react'
import { QueryClientProvider } from 'src/providers/query-client-provider'
import { WagmiConfig } from 'src/providers/wagmi-provider'
import { PriceProvider } from '~evm/_common/ui/price-provider/price-provider/price-provider'
import { Header } from './header'

export default function LandingLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <QueryClientProvider>
      <WagmiConfig>
        <PriceProvider>
          {/* A CurrencyInput component is used on the landing page */}
          <div className={classNames('flex flex-col flex-1')}>
            <Header />
            <div className="flex flex-col flex-1">{children}</div>
          </div>
          <HotJar />
        </PriceProvider>
      </WagmiConfig>
    </QueryClientProvider>
  )
}
