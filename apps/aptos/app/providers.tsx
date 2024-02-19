'use client'

import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import { MartianWallet } from '@martianwallet/aptos-wallet-adapter'
import { PontemWallet } from '@pontem/wallet-adapter-plugin'
import { RiseWallet } from '@rise-wallet/wallet-adapter'
import { ThemeProvider } from '@sushiswap/ui'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Modal } from 'components/Modal/Modal'
import { FewchaWallet } from 'fewcha-plugin-wallet-adapter'
import { PetraWallet } from 'petra-plugin-wallet-adapter'
import { MSafeWalletAdapter } from '@msafe/aptos-wallet-adapter'
import { MSafeOrigin } from 'lib/constants'

const wallets = [
  new PetraWallet(),
  new PontemWallet(),
  new FewchaWallet(),
  new MartianWallet(),
  new RiseWallet(),
  new MSafeWalletAdapter(MSafeOrigin),
]

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
          <ThemeProvider>
            <Modal.Provider>{children}</Modal.Provider>
          </ThemeProvider>
        </AptosWalletAdapterProvider>
      </QueryClientProvider>
    </>
  )
}
