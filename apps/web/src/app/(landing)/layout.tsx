import { classNames } from '@sushiswap/ui'
import React from 'react'
import { QueryClientProvider } from 'src/providers/query-client-provider'
import { WagmiProvider } from 'src/providers/wagmi-provider'
import { BalanceProvider } from '~evm/_common/ui/balance-provider/balance-provider'
import { PriceProvider } from '~evm/_common/ui/price-provider/price-provider/price-provider'
import { Header } from './header'

export default function LandingLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <QueryClientProvider>
      <WagmiProvider>
        <PriceProvider>
          <BalanceProvider>
            {/* A CurrencyInput component is used on the landing page */}
            <div className={classNames('flex flex-col flex-1')}>
              <Header />
              <div className="flex flex-col flex-1">{children}</div>
            </div>
          </BalanceProvider>
        </PriceProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
