'use client'

import { ChainId } from 'sushi/chain'

import { usePrevious } from '@sushiswap/hooks'
import {
  InterfaceEventName,
  WalletConnectionResult,
  sendAnalyticsEvent,
} from '@sushiswap/telemetry'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { HeaderNetworkSelector } from './header-network-selector'
import { UserPortfolio } from './user-portfolio'

interface WagmiHeaderComponentsProps {
  chainIds: ChainId[]
  onChange?(chainId: ChainId): void
}

export const WagmiHeaderComponents: React.FC<WagmiHeaderComponentsProps> = ({
  chainIds,
  onChange,
}) => {
  const { chainId, address, connector } = useAccount()
  const previousConnectedChainId = usePrevious(chainId)
  useEffect(() => {
    const chainChanged =
      previousConnectedChainId && previousConnectedChainId !== chainId
    if (chainChanged) {
      sendAnalyticsEvent(InterfaceEventName.CHAIN_CHANGED, {
        result: WalletConnectionResult.SUCCEEDED,
        wallet_address: address,
        wallet_type: connector?.name ?? 'Network',
        chain_id: chainId,
        previousConnectedChainId,
        page: window.origin,
      })
    }
  }, [address, chainId, connector, previousConnectedChainId])

  return (
    <>
      <HeaderNetworkSelector networks={chainIds} onChange={onChange} />
      <UserPortfolio />
    </>
  )
}
