'use client'

import { Navigation } from '@sushiswap/ui/components/navigation'
import { WagmiHeaderComponents } from '@sushiswap/wagmi/components'
import React, { FC } from 'react'
import { SUPPORTED_CHAIN_IDS } from 'src/config'
import { useDerivedStateSimpleSwap } from 'src/ui/swap/simple/derivedstate-simple-swap-provider'

export const Header: FC = () => {
  const {
    state: { chainId },
    mutate: { setChainId },
  } = useDerivedStateSimpleSwap()
  return (
    <Navigation
      rightElement={
        <WagmiHeaderComponents
          chainIds={SUPPORTED_CHAIN_IDS}
          selectedNetwork={chainId}
          onChange={setChainId}
        />
      }
    />
  )
}
