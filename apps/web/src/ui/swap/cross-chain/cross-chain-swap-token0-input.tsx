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
import { useDerivedStateCrossChainSwap } from './derivedstate-cross-chain-swap-provider'

export const CrossChainSwapToken0Input = () => {
  const {
    state: { swapAmountString, chainId0, token0 },
    mutate: { setSwapAmount, setToken0, setChainId0 },
    isToken0Loading: isLoading,
  } = useDerivedStateCrossChainSwap()

  return (
    <div className="border border-accent flex flex-col bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
      <Collapsible open={true}>
        <div className="p-3 border-b border-accent flex gap-2 items-center">
          <Label className="text-xs tracking-tighter text-muted-foreground">
            From
          </Label>
          <NetworkSelector
            networks={SUSHIXSWAP_2_SUPPORTED_CHAIN_IDS}
            selected={chainId0}
            onSelect={(chainId, close) => {
              setChainId0(chainId)
              close()
            }}
          >
            <Button
              variant="secondary"
              size="xs"
              testId="network-selector-from"
            >
              <NetworkIcon chainId={chainId0} width={16} height={16} />
              {Chain.from(chainId0)?.name}
              <SelectIcon />
            </Button>
          </NetworkSelector>
        </div>
      </Collapsible>
      <Web3Input.Currency
        id="swap-from"
        type="INPUT"
        className="p-3 bg-white dark:bg-slate-800"
        chainId={chainId0}
        onSelect={setToken0}
        value={swapAmountString}
        onChange={setSwapAmount}
        currency={token0}
        loading={isLoading}
        currencyLoading={isLoading}
        allowNative={isWNativeSupported(chainId0)}
      />
    </div>
  )
}
