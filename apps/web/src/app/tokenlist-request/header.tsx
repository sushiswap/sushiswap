'use client'

import { Navigation } from '@sushiswap/ui'
import React, { FC } from 'react'
import { SUPPORTED_CHAIN_IDS } from 'src/config'
import { WagmiHeaderComponents } from 'src/lib/wagmi/components/wagmi-header-components'
import { useChainId } from 'wagmi'
import { headerElements } from '~evm/_common/header-elements'

export const Header: FC = () => {
  const chainId = useChainId()
  return (
    <Navigation
      leftElements={headerElements({ chainId })}
      rightElement={<WagmiHeaderComponents chainIds={SUPPORTED_CHAIN_IDS} />}
    />
  )
}
