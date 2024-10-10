import { BaseProviders, OnramperProvider } from '@sushiswap/ui'
import { headers } from 'next/headers'
import { QueryClientProvider } from 'src/providers/query-client-provider'
import { WagmiProvider } from 'src/providers/wagmi-provider'

export default function Layout({ children }: { children: React.ReactNode }) {
  const cookie = headers().get('cookie')
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
