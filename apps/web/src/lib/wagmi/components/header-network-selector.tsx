import { createErrorToast } from '@sushiswap/notifications'
import { Button } from '@sushiswap/ui'
import { NetworkIcon } from '@sushiswap/ui/icons/NetworkIcon'
import React, { FC, Suspense, useCallback } from 'react'
import { NonStandardChainId } from 'src/config'
import { getNetworkName } from 'src/lib/network'
import { ChainId } from 'sushi/chain'
import { ProviderRpcError, UserRejectedRequestError } from 'viem'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import {
  NetworkSelector,
  NetworkSelectorOnSelectCallback,
} from './network-selector'

export const HeaderNetworkSelector: FC<{
  networks: readonly (ChainId | NonStandardChainId)[]
  selectedNetwork?: ChainId | NonStandardChainId
  onChange?(network: ChainId | NonStandardChainId): void
  hideNetworkName?: boolean
  className?: string
}> = ({
  networks,
  selectedNetwork,
  onChange,
  className,
  hideNetworkName = false,
}) => {
  const { switchChainAsync } = useSwitchChain()
  const chainId = useChainId()

  const { address } = useAccount()
  console.log('address', address)

  const onSwitchNetwork = useCallback<NetworkSelectorOnSelectCallback>(
    async (el, close) => {
      console.debug('onSwitchNetwork', el)
      try {
        if (typeof el === 'number' && switchChainAsync && chainId !== el) {
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
      selected={selectedNetwork ?? chainId}
      onSelect={onSwitchNetwork}
      networks={networks}
    >
      <Button
        variant="secondary"
        testId="network-selector"
        className={className}
      >
        <Suspense fallback={null}>
          <NetworkIcon
            chainId={selectedNetwork ?? chainId}
            width={20}
            height={20}
          />
          {hideNetworkName ? null : (
            <div className="hidden xl:block">
              {getNetworkName(selectedNetwork ?? chainId)}
            </div>
          )}
        </Suspense>
      </Button>
    </NetworkSelector>
  )
}
