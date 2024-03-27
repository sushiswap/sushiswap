import { WagmiProvider } from '@sushiswap/wagmi'
import { PublicWagmiConfig } from '@sushiswap/wagmi-config'
import { type FC, type ReactNode, useMemo } from 'react'
import { createProductionConfig, createTestConfig } from 'src/lib/wagmi'

const isTest = process.env.NEXT_PUBLIC_APP_ENV === 'test'

export const WagmiConfig: FC<{ children: ReactNode }> = ({ children }) => {
  const config = useMemo(() => {
    if (isTest) {
      return createTestConfig() as unknown as PublicWagmiConfig
    }
    return createProductionConfig()
  }, [])

  return <WagmiProvider config={config}>{children}</WagmiProvider>
}
