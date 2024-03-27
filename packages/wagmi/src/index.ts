'use client'

import { PublicWagmiConfig } from '@sushiswap/wagmi-config'

// Export actions
export * from './actions'

// Export hooks
export * from './hooks'

// Export systems
export * from './systems'

// Export components
export * from './components'

// Re-export wagmi
export * from 'wagmi'

// Re-export useConnect to avoid ambiguity
export { useConnect } from './hooks'

declare module 'wagmi' {
  interface Register {
    config: PublicWagmiConfig
  }
}
