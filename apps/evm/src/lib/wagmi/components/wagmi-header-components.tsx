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
import { UserProfile } from './user-profile'

interface WagmiHeaderComponentsProps {
  chainIds: ChainId[]
  selectedNetwork?: ChainId
  onChange?(chainId: ChainId): void
}

export const WagmiHeaderComponents: React.FC<WagmiHeaderComponentsProps> = ({
  chainIds,
  selectedNetwork,
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
      <HeaderNetworkSelector
        networks={chainIds}
        selectedNetwork={selectedNetwork}
        onChange={onChange}
      />
      <UserProfile networks={chainIds} />
    </>
  )
}
