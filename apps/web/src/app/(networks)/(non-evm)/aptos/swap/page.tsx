'use client'

import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Container } from '@sushiswap/ui'
import React, { useEffect } from 'react'
import requiredNetworkAlert from '~aptos/_common/lib/common/required-network-alert'
import { SimpleSwapWidget } from '~aptos/swap/ui/simple/simple-swap-widget'

export default function SwapPage() {
  const { disconnect, network } = useWallet()

  useEffect(() => {
    requiredNetworkAlert(network, disconnect)
  }, [network, disconnect])

  return (
    <Container maxWidth="lg" className="px-4">
      <SimpleSwapWidget />
    </Container>
  )
}
