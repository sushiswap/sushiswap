'use client'

import { useSlippageTolerance } from '@sushiswap/hooks'
import {
  useAccount,
  useConfig,
  useTokenWithCache,
  watchAccount,
} from '@sushiswap/wagmi'
import { nanoid } from 'nanoid'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Dispatch,
  FC,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { SushiXSwap2Adapter } from 'src/lib/swap/useCrossChainTrade/SushiXSwap2'
import { useSquidCrossChainTrade } from 'src/lib/swap/useCrossChainTrade/useSquidCrossChainTrade'
import { useStargateCrossChainTrade } from 'src/lib/swap/useCrossChainTrade/useStargateCrossChainTrade'
import { ChainId } from 'sushi/chain'
import {
  SquidAdapterChainId,
  StargateAdapterChainId,
  isSquidAdapterChainId,
  isStargateAdapterChainId,
  isSushiXSwap2ChainId,
} from 'sushi/config'
import { defaultQuoteCurrency } from 'sushi/config'
import { Amount, Native, Type, tryParseAmount } from 'sushi/currency'
import { ZERO } from 'sushi/math'
import { Address, isAddress } from 'viem'

const getTokenAsString = (token: Type | string) =>
  typeof token === 'string'
    ? token
    : token.isNative
      ? 'NATIVE'
      : token.wrapped.address
const getQuoteCurrency = (chainId: number) =>
  defaultQuoteCurrency[chainId as keyof typeof defaultQuoteCurrency].wrapped
    .address

interface State {
  mutate: {
    setChainId0(chainId: number): void
    setChainId1(chainId: number): void
    setToken0(token0: Type | string): void
    setToken1(token1: Type | string): void
    setTokens(token0: Type | string, token1: Type | string): void

    setSwapAmount(swapAmount: string): void
    switchTokens(): void
    setTradeId: Dispatch<SetStateAction<string>>
  }
  state: {
    tradeId: string
    token0: Type | undefined
    token1: Type | undefined
    chainId0: ChainId
    chainId1: ChainId
    swapAmountString: string
    swapAmount: Amount<Type> | undefined
    recipient: string | undefined
    adapter: SushiXSwap2Adapter | undefined
  }
  isLoading: boolean
  isToken0Loading: boolean
  isToken1Loading: boolean
}

const DerivedStateCrossChainSwapContext = createContext<State>({} as State)

interface DerivedStateCrossChainSwapProviderProps {
  children: React.ReactNode
}

/* Parses the URL and provides the chainId, token0, and token1 globally.
 * URL example:
 * /swap?chainId0=1&chainId1=2token0=NATIVE&token1=0x6b3595068778dd592e39a122f4f5a5cf09c90fe2
 *
 * If no chainId is provided, it defaults to current connected chainId or Ethereum if wallet is not connected.
 */
const DerivedstateCrossChainSwapProvider: FC<
  DerivedStateCrossChainSwapProviderProps
> = ({ children }) => {
  const { push } = useRouter()
  const { address, chain } = useAccount()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [tradeId, setTradeId] = useState(nanoid())

  // Get the searchParams and complete with defaults.
  // This handles the case where some params might not be provided by the user
  const defaultedParams = useMemo(() => {
    const params = new URLSearchParams(Array.from(searchParams.entries()))

    if (!params.has('chainId0'))
      params.set(
        'chainId0',
        (chain?.id && isSushiXSwap2ChainId(chain.id as ChainId)
          ? chain.id
          : ChainId.ETHEREUM
        ).toString(),
      )
    if (!params.has('chainId1'))
      params.set(
        'chainId1',
        params.get('chainId0') === ChainId.ARBITRUM.toString()
          ? ChainId.ETHEREUM.toString()
          : ChainId.ARBITRUM.toString(),
      )
    if (!params.has('token0')) params.set('token0', 'NATIVE')
    if (!params.has('token1'))
      params.set('token1', getQuoteCurrency(Number(params.get('chainId1'))))

    return params
  }, [chain, searchParams])

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (values: { name: string; value: string | null }[]) => {
      const params = new URLSearchParams(defaultedParams)
      values.forEach(({ name, value }) => {
        if (value === null) {
          params.delete(name)
        } else {
          params.set(name, value)
        }
      })
      return params.toString()
    },
    [defaultedParams],
  )

  // Switch token0 and token1
  const switchTokens = useCallback(() => {
    const params = new URLSearchParams(defaultedParams)
    const chainId0 = params.get('chainId0')
    const chainId1 = params.get('chainId1')
    const token0 = params.get('token0')
    const token1 = params.get('token1')

    // Can safely cast as defaultedParams are always defined
    params.set('token0', token1 as string)
    params.set('token1', token0 as string)
    params.set('chainId0', chainId1 as string)
    params.set('chainId1', chainId0 as string)
    if (params.has('swapAmount')) {
      params.delete('swapAmount')
    }

    push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, push, defaultedParams])

  // Update the URL with new from chainId
  const setChainId0 = useCallback<{ (chainId: number): void }>(
    (chainId) => {
      if (defaultedParams.get('chainId1') === chainId.toString()) {
        switchTokens()
      } else {
        push(
          `${pathname}?${createQueryString([
            { name: 'swapAmount', value: null },
            { name: 'chainId0', value: chainId.toString() },
            { name: 'token0', value: 'NATIVE' },
          ])}`,
          { scroll: false },
        )
      }
    },
    [createQueryString, defaultedParams, pathname, push, switchTokens],
  )

  // Update the URL with new to chainId
  const setChainId1 = useCallback<{ (chainId: number): void }>(
    (chainId) => {
      if (defaultedParams.get('chainId0') === chainId.toString()) {
        switchTokens()
      } else {
        push(
          `${pathname}?${createQueryString([
            { name: 'swapAmount', value: null },
            { name: 'chainId1', value: chainId.toString() },
            { name: 'token1', value: getQuoteCurrency(chainId) },
          ])}`,
          { scroll: false },
        )
      }
    },
    [createQueryString, defaultedParams, pathname, push, switchTokens],
  )

  // Update the URL with a new token0
  const setToken0 = useCallback<{ (_token0: string | Type): void }>(
    (_token0) => {
      // If entity is provided, parse it to a string
      const token0 = getTokenAsString(_token0)
      push(
        `${pathname}?${createQueryString([{ name: 'token0', value: token0 }])}`,
        { scroll: false },
      )
    },
    [createQueryString, pathname, push],
  )

  // Update the URL with a new token1
  const setToken1 = useCallback<{ (_token1: string | Type): void }>(
    (_token1) => {
      // If entity is provided, parse it to a string
      const token1 = getTokenAsString(_token1)
      push(
        `${pathname}?${createQueryString([{ name: 'token1', value: token1 }])}`,
        { scroll: false },
      )
    },
    [createQueryString, pathname, push],
  )

  // Update the URL with both tokens
  const setTokens = useCallback<{
    (_token0: string | Type, _token1: string | Type): void
  }>(
    (_token0, _token1) => {
      // If entity is provided, parse it to a string
      const token0 = getTokenAsString(_token0)
      const token1 = getTokenAsString(_token1)

      push(
        `${pathname}?${createQueryString([
          { name: 'token0', value: token0 },
          { name: 'token1', value: token1 },
        ])}`,
        { scroll: false },
      )
    },
    [createQueryString, pathname, push],
  )

  // Update the URL with a new swapAmount
  const setSwapAmount = useCallback<{ (swapAmount: string): void }>(
    (swapAmount) => {
      push(
        `${pathname}?${createQueryString([
          { name: 'swapAmount', value: swapAmount },
        ])}`,
        { scroll: false },
      )
    },
    [createQueryString, pathname, push],
  )

  // Derive chainId from defaultedParams
  const chainId0 = Number(defaultedParams.get('chainId0')) as ChainId
  const chainId1 = Number(defaultedParams.get('chainId1')) as ChainId

  // Derive token0
  const { data: token0, isInitialLoading: token0Loading } = useTokenWithCache({
    chainId: chainId0,
    address: defaultedParams.get('token0') as string,
    enabled: isAddress(defaultedParams.get('token0') as string),
    keepPreviousData: false,
  })

  // Derive token1
  const { data: token1, isInitialLoading: token1Loading } = useTokenWithCache({
    chainId: chainId1,
    address: defaultedParams.get('token1') as string,
    enabled: isAddress(defaultedParams.get('token1') as string),
    keepPreviousData: false,
  })

  const adapter =
    isStargateAdapterChainId(chainId0) && isStargateAdapterChainId(chainId1)
      ? SushiXSwap2Adapter.Stargate
      : isSquidAdapterChainId(chainId0) && isSquidAdapterChainId(chainId1)
        ? SushiXSwap2Adapter.Squid
        : undefined

  const config = useConfig()

  useEffect(() => {
    const unwatch = watchAccount(config, {
      onChange: ({ chain }) => {
        if (
          !chain ||
          chain.id === chainId0 ||
          !isSushiXSwap2ChainId(chain.id as ChainId)
        )
          return
        push(pathname, { scroll: false })
      },
    })
    return () => unwatch()
  }, [config, chainId0, pathname, push])

  return (
    <DerivedStateCrossChainSwapContext.Provider
      value={useMemo(() => {
        const swapAmountString = defaultedParams.get('swapAmount') || ''
        const _token0 =
          defaultedParams.get('token0') === 'NATIVE'
            ? Native.onChain(chainId0)
            : token0
        const _token1 =
          defaultedParams.get('token1') === 'NATIVE'
            ? Native.onChain(chainId1)
            : token1

        return {
          mutate: {
            setChainId0,
            setChainId1,
            setToken0,
            setToken1,
            setTokens,
            setTradeId,
            switchTokens,
            setSwapAmount,
          },
          state: {
            tradeId,
            recipient: address ?? '',
            chainId0,
            chainId1,
            swapAmountString,
            swapAmount: tryParseAmount(swapAmountString, _token0),
            token0: _token0,
            token1: _token1,
            adapter,
          },
          isLoading: token0Loading || token1Loading,
          isToken0Loading: token0Loading,
          isToken1Loading: token1Loading,
        }
      }, [
        address,
        chainId0,
        chainId1,
        defaultedParams,
        setChainId0,
        setChainId1,
        setSwapAmount,
        setToken0,
        setToken1,
        setTokens,
        switchTokens,
        token0,
        token0Loading,
        token1,
        token1Loading,
        tradeId,
        adapter,
      ])}
    >
      {children}
    </DerivedStateCrossChainSwapContext.Provider>
  )
}

const useDerivedStateCrossChainSwap = () => {
  const context = useContext(DerivedStateCrossChainSwapContext)
  if (!context) {
    throw new Error(
      'Hook can only be used inside CrossChain Swap Derived State Context',
    )
  }

  return context
}

const useCrossChainSwapTrade = () => {
  const {
    state: {
      tradeId,
      token0,
      chainId0,
      chainId1,
      swapAmount,
      token1,
      recipient,
      adapter,
    },
  } = useDerivedStateCrossChainSwap()
  const [slippageTolerance] = useSlippageTolerance()

  const stargateCrossChainTrade = useStargateCrossChainTrade({
    tradeId,
    network0: chainId0 as StargateAdapterChainId,
    network1: chainId1 as StargateAdapterChainId,
    token0,
    token1,
    amount: swapAmount,
    slippagePercentage:
      slippageTolerance === 'AUTO' ? '0.5' : slippageTolerance,
    recipient: recipient as Address,
    enabled: Boolean(
      adapter === SushiXSwap2Adapter.Stargate && swapAmount?.greaterThan(ZERO),
    ),
  })

  const squidCrossChainTrade = useSquidCrossChainTrade({
    tradeId,
    network0: chainId0 as SquidAdapterChainId,
    network1: chainId1 as SquidAdapterChainId,
    token0,
    token1,
    amount: swapAmount,
    slippagePercentage:
      slippageTolerance === 'AUTO' ? '0.5' : slippageTolerance,
    recipient: recipient as Address,
    enabled: Boolean(
      adapter !== SushiXSwap2Adapter.Stargate && swapAmount?.greaterThan(ZERO),
    ),
  })

  return adapter === SushiXSwap2Adapter.Stargate
    ? stargateCrossChainTrade
    : squidCrossChainTrade
}

export {
  DerivedstateCrossChainSwapProvider,
  useCrossChainSwapTrade,
  useDerivedStateCrossChainSwap,
}
