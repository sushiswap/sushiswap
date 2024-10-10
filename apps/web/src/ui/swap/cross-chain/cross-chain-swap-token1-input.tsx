'use client'

import { Button, Collapsible, Label, SelectIcon } from '@sushiswap/ui'
import { NetworkIcon } from '@sushiswap/ui/icons/NetworkIcon'
import { Chain } from 'sushi/chain'

import { NetworkSelector } from 'src/lib/wagmi/components/network-selector'
import { Web3Input } from 'src/lib/wagmi/components/web3-input'
import {
  SUSHIXSWAP_2_SUPPORTED_CHAIN_IDS,
  isWNativeSupported,
} from 'sushi/config'
import {
  useCrossChainSwapTrade,
  useDerivedStateCrossChainSwap,
} from './derivedstate-cross-chain-swap-provider'

export const CrossChainSwapToken1Input = () => {
  const {
    state: { chainId1, token1 },
    mutate: { setToken1, setChainId1 },
    isToken1Loading: tokenLoading,
  } = useDerivedStateCrossChainSwap()

  const {
    isInitialLoading: isLoading,
    isFetching,
    data: trade,
  } = useCrossChainSwapTrade()

  return (
    <div className="border border-accent flex flex-col bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
      <Collapsible open={true}>
        <div className="flex p-3 border-b border-accent gap-2 items-center">
          <Label className="text-xs tracking-tighter text-muted-foreground">
            To
          </Label>
          <div>
            <NetworkSelector
              networks={SUSHIXSWAP_2_SUPPORTED_CHAIN_IDS}
              selected={chainId1}
              onSelect={(chainId, close) => {
                setChainId1(chainId)
                close()
              }}
            >
              <Button
                variant="secondary"
                size="xs"
                testId="network-selector-to"
              >
                <NetworkIcon chainId={chainId1} width={16} height={16} />
                {Chain.from(chainId1)?.name}
                <SelectIcon />
              </Button>
            </NetworkSelector>
          </div>
        </div>
      </Collapsible>
      <Web3Input.Currency
        id="swap-to"
        type="OUTPUT"
        disabled
        className="p-3 bg-white dark:bg-slate-800"
        value={trade?.amountOut?.toSignificant() ?? ''}
        chainId={chainId1}
        onSelect={setToken1}
        currency={token1}
        loading={isLoading}
        disableMaxButton
        fetching={isFetching}
        currencyLoading={tokenLoading}
        allowNative={isWNativeSupported(chainId1)}
      />
    </div>
  )
}
