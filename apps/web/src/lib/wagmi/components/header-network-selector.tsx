import { createErrorToast } from '@sushiswap/notifications'
import { Button } from '@sushiswap/ui'
import { NetworkSelector, NetworkSelectorOnSelectCallback } from '@sushiswap/ui'
import { NetworkIcon } from '@sushiswap/ui/icons/NetworkIcon'
import React, { FC, Suspense, useCallback } from 'react'
import { Chain, ChainId } from 'sushi/chain'
import { ProviderRpcError, UserRejectedRequestError } from 'viem'
import { useChainId, useSwitchChain } from 'wagmi'

export const HeaderNetworkSelector: FC<{
  networks: ChainId[]
  selectedNetwork?: ChainId
  onChange?(chainId: ChainId): void
  hideNetworkName?: boolean
}> = ({ networks, selectedNetwork, onChange, hideNetworkName = false }) => {
  const { switchChainAsync } = useSwitchChain()
  const chainId = useChainId()

  const onSwitchNetwork = useCallback<NetworkSelectorOnSelectCallback>(
    async (el, close) => {
      console.debug('onSwitchNetwork', el)
      try {
        if (switchChainAsync && chainId !== el) {
          await switchChainAsync({ chainId: el })
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
    [chainId, onChange, selectedNetwork, switchChainAsync],
  )

  return (
    <NetworkSelector
      showNonEvm
      selected={chainId}
      onSelect={onSwitchNetwork}
      networks={networks}
    >
      <Button variant="secondary" testId="network-selector">
        <Suspense fallback={null}>
          <NetworkIcon chainId={chainId} width={20} height={20} />
          {hideNetworkName ? null : (
            <div className="hidden xl:block">{Chain.from(chainId)?.name}</div>
          )}
        </Suspense>
      </Button>
    </NetworkSelector>
  )
}
