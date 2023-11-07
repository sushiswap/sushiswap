import { useIsMounted } from '@sushiswap/hooks'
import { Button } from '@sushiswap/ui/components/button'
import { NetworkIcon } from '@sushiswap/ui/components/icons'
import {
  NetworkSelector,
  NetworkSelectorOnSelectCallback,
} from '@sushiswap/ui/components/network-selector'
import { createErrorToast } from '@sushiswap/ui/components/toast'
import React, { FC, Suspense, useCallback } from 'react'
import { Chain, ChainId } from 'sushi/chain'
import { ProviderRpcError, UserRejectedRequestError } from 'viem'
import { useNetwork, useSwitchNetwork } from 'wagmi'

export const HeaderNetworkSelector: FC<{
  networks: ChainId[]
  selectedNetwork?: ChainId
  onChange?(chainId: ChainId): void
}> = ({ networks, selectedNetwork, onChange }) => {
  const isMounted = useIsMounted()
  const { switchNetworkAsync } = useSwitchNetwork()
  const { chain } = useNetwork()

  const onSwitchNetwork = useCallback<NetworkSelectorOnSelectCallback>(
    async (el, close) => {
      console.debug('onSwitchNetwork', el)
      try {
        if (switchNetworkAsync && chain?.id !== el) {
          await switchNetworkAsync(el)
        }

        if (selectedNetwork !== el && onChange) {
          onChange(el)
        }

        close()
      } catch (e) {
        console.error(`Failed to switch network: ${e}`)
        if (e instanceof UserRejectedRequestError) return
        if (e instanceof ProviderRpcError) {
          createErrorToast(e.message, true)
        }
      }
    },
    [chain?.id, onChange, selectedNetwork, switchNetworkAsync],
  )

  const selected = isMounted
    ? selectedNetwork || (chain?.id as ChainId) || ChainId.ETHEREUM
    : ChainId.ETHEREUM

  return (
    <NetworkSelector
      selected={selected}
      onSelect={onSwitchNetwork}
      networks={networks}
    >
      <Button variant="outline" testId="network-selector">
        <Suspense fallback={null}>
          <NetworkIcon chainId={selected} width={20} height={20} />
          <div className="hidden xl:block">{Chain.from(selected)?.name}</div>
        </Suspense>
      </Button>
    </NetworkSelector>
  )
}
