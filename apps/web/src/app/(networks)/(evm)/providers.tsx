'use client'

import '@rainbow-me/rainbowkit/styles.css'

import { PriceProvider } from './_common/ui/price-provider/price-provider/price-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return <PriceProvider>{children}</PriceProvider>
}
