'use client'

import { ExclamationCircleIcon } from '@heroicons/react/20/solid'
import {
  TWAP as TwapContainer,
  supportedChains,
} from '@orbs-network/twap-ui-sushiswap'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useCustomTokens } from '@sushiswap/hooks'
import {
  useOtherTokenListsQuery,
  usePrice,
  useTokens,
} from '@sushiswap/react-query'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  NetworkSelector,
  Tooltip as SushiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@sushiswap/ui'
import { useTheme } from 'next-themes'
import { ReactNode, useCallback, useEffect, useMemo } from 'react'
import { useSortedTokenList } from 'src/lib/wagmi/components/token-selector/hooks/useSortedTokenList'
import { Currency } from 'sushi/currency'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'

import { TokenSelector } from 'src/lib/wagmi/components/token-selector/TokenSelector'
import type { ChainId } from 'sushi'
import { Address } from 'viem'
import {
  useDerivedStateSimpleSwap,
  useSimpleSwapTrade,
} from '../simple/derivedstate-simple-swap-provider'
import { SimpleSwapBridgeBanner } from '../simple/simple-swap-bridge-banner'
import { SimpleSwapHeader } from '../simple/simple-swap-header'
import { SimpleSwapSettingsOverlay } from '../simple/simple-swap-settings-overlay'
import { SwapModeButtons } from '../swap-mode-buttons'

const Modal = ({
  open,
  onClose,
  title,
  children,
  header,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children?: ReactNode
  header?: ReactNode
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          {header}
          {title && <DialogTitle>{title}</DialogTitle>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

const TokenSelectModal = ({
  selected,
  children,
  onSelect,
}: {
  selected: Currency
  children: ReactNode
  onSelect: (currency: Currency) => void
}) => {
  const {
    state: { chainId },
  } = useDerivedStateSimpleSwap()

  return (
    <TokenSelector
      id={`twap-token-selector`}
      selected={selected}
      chainId={chainId}
      onSelect={onSelect}
      includeNative={true}
      hidePinnedTokens={false}
      hideSearch={false}
    >
      {children}
    </TokenSelector>
  )
}

const useTrade = () => {
  const { data: trade, isInitialLoading } = useSimpleSwapTrade()

  return {
    isLoading: isInitialLoading,
    outAmount: trade?.amountOut?.quotient.toString(),
  }
}

const usePriceUSD = (address?: Address) => {
  const {
    state: { chainId },
  } = useDerivedStateSimpleSwap()

  const { data: price } = usePrice({
    chainId,
    enabled: true,
    address,
  })

  return price?.toSignificant(6)
}

const getTokenLogo = (currency: Currency) => {
  try {
    const src = currency.isNative
      ? `native-currency/ethereum.svg`
      : `tokens/${currency.chainId}/${currency.wrapped.address}.jpg`
    const params = ['f_auto', 'c_limit', `w_${64}`]
    return `https://cdn.sushi.com/image/upload/${params.join(
      ',',
    )}/d_unknown.png/${src}`
  } catch {
    return ''
  }
}

const useTokenList = () => {
  const { data: customTokenMap } = useCustomTokens()
  const {
    state: { chainId },
  } = useDerivedStateSimpleSwap()

  const { data: otherTokenMap } = useOtherTokenListsQuery({
    chainId,
    query: undefined,
  })
  const { data: defaultTokenMap } = useTokens({
    chainId,
  })

  const tokenMap = useMemo(() => {
    return {
      ...defaultTokenMap,
      ...otherTokenMap,
    }
  }, [defaultTokenMap, otherTokenMap])

  const { data: sortedTokenList } = useSortedTokenList({
    query: '',
    customTokenMap,
    tokenMap,
    chainId,
    includeNative: true,
  })

  return sortedTokenList
}

const Tooltip = ({ tooltipText }: any) => {
  return (
    <TooltipProvider>
      <SushiTooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <ExclamationCircleIcon width={16} height={16} />
        </TooltipTrigger>
        <TooltipContent className="bg-background !p-4 shadow-xl w-80">
          <p>{tooltipText}</p>
        </TooltipContent>
      </SushiTooltip>
    </TooltipProvider>
  )
}

const TwapNetworkSelector = ({ children }: { children: ReactNode }) => {
  const { switchChain } = useSwitchChain()

  const chainId = useChainId()

  const onSelect = useCallback(
    (chainId: ChainId) => {
      switchChain({ chainId })
    },
    [switchChain],
  )

  return (
    <NetworkSelector
      networks={supportedChains as ChainId[]}
      onSelect={onSelect}
      selected={chainId}
    >
      {children}
    </NetworkSelector>
  )
}

const TwapButton = ({
  disabled,
  children,
}: { disabled?: boolean; children: ReactNode }) => {
  return (
    <Button
      size="xl"
      disabled={Boolean(disabled)}
      color={'blue'}
      fullWidth
      testId="swap-twap"
    >
      {children}
    </Button>
  )
}

function Provider({ isLimit }: { isLimit?: boolean }) {
  const { openConnectModal } = useConnectModal()
  const { connector } = useAccount()
  const {
    state,
    mutate: { setSwapAmount, ...mutate },
  } = useDerivedStateSimpleSwap()
  const { resolvedTheme } = useTheme()
  const tokens = useTokenList()
  const connectedChainId = useChainId()

  useEffect(() => {
    // we do this to get an indication of market price for single token
    if (state.swapAmountString !== '1') {
      setSwapAmount('1')
    }
  }, [state.swapAmountString, setSwapAmount])

  return (
    <div className="flex flex-col gap-4">
      <SimpleSwapBridgeBanner />
      <SimpleSwapHeader />
      <div className="flex items-center justify-between">
        <SwapModeButtons />
        <SimpleSwapSettingsOverlay />
      </div>

      <TwapContainer
        TokenSelectModal={TokenSelectModal}
        Modal={Modal}
        connect={openConnectModal}
        account={state.recipient}
        limit={isLimit}
        useTrade={useTrade}
        connector={connector}
        dappTokens={tokens}
        srcToken={state.token0}
        dstToken={state.token1}
        getTokenLogo={getTokenLogo}
        onSrcTokenSelected={mutate.setToken0}
        onDstTokenSelected={mutate.setToken1}
        useUSD={usePriceUSD}
        isDarkTheme={resolvedTheme === 'dark'}
        onSwitchTokens={mutate.switchTokens}
        configChainId={state.chainId}
        connectedChainId={connectedChainId}
        Tooltip={Tooltip}
        NetworkSelector={TwapNetworkSelector}
        Button={TwapButton}
      />
    </div>
  )
}
export const LimitPanel = () => {
  return <Provider isLimit={true} />
}

export const TWAPPanel = () => {
  return <Provider />
}
