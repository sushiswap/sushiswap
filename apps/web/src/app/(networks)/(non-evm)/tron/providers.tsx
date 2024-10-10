'use client'

import '@tronweb3/tronwallet-adapter-react-ui/style.css'

import { WalletError } from '@tronweb3/tronwallet-abstract-adapter'
import { WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks'
import { WalletModalProvider } from '@tronweb3/tronwallet-adapter-react-ui'
import { useCallback } from 'react'
import { useWalletAdapters } from '~tron/_common/lib/hooks/useWalletAdapters'

export function Providers({ children }: { children: React.ReactNode }) {
  const { adapters } = useWalletAdapters()
  const onError = useCallback((e: WalletError) => {
    console.log(e)
    // if (e instanceof WalletNotFoundError) {
    // 	alert(e.message);
    // } else if (e instanceof WalletDisconnectedError) {
    // 	alert(e.message);
    // } else alert(e.message);
  }, [])

  return (
    <WalletProvider onError={onError} adapters={adapters}>
      <WalletModalProvider>{children}</WalletModalProvider>
    </WalletProvider>
  )
}
