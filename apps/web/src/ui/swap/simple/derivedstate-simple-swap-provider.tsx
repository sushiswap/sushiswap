'use client'

import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation'
import {
  FC,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTrade as useApiTrade } from 'src/lib/hooks/react-query'
import { useSlippageTolerance } from 'src/lib/hooks/useSlippageTolerance'
import { useTokenWithCache } from 'src/lib/wagmi/hooks/tokens/useTokenWithCache'
import { ChainId } from 'sushi/chain'
import {
  defaultCurrency,
  defaultQuoteCurrency,
  isWNativeSupported,
} from 'sushi/config'
import { Amount, Native, Type, tryParseAmount } from 'sushi/currency'
import { Percent, ZERO } from 'sushi/math'
import { Address, isAddress } from 'viem'
import { useAccount, useGasPrice } from 'wagmi'
import { SupportedChainId, isSupportedChainId } from '../../../config'
import { useCarbonOffset } from '../../../lib/swap/useCarbonOffset'

const getTokenAsString = (token: Type | string) =>
  typeof token === 'string'
    ? token
    : token.isNative
      ? 'NATIVE'
      : token.wrapped.address
const getDefaultCurrency = (chainId: number) =>
  getTokenAsString(defaultCurrency[chainId as keyof typeof defaultCurrency])
const getQuoteCurrency = (chainId: number) =>
  getTokenAsString(
    defaultQuoteCurrency[chainId as keyof typeof defaultQuoteCurrency],
  )

interface State {
  mutate: {
    setToken0(token0: Type | string): void
    setToken1(token1: Type | string): void
    setTokens(token0: Type | string, token1: Type | string): void
    setSwapAmount(swapAmount: string): void
    switchTokens(): void
    setTokenTax(tax: Percent | false | undefined): void
  }
  state: {
    token0: Type | undefined
    token1: Type | undefined
    chainId: ChainId
    swapAmountString: string
    swapAmount: Amount<Type> | undefined
    recipient: string | undefined
    tokenTax: Percent | false | undefined
  }
  isLoading: boolean
  isToken0Loading: boolean
  isToken1Loading: boolean
}

const DerivedStateSimpleSwapContext = createContext<State>({} as State)

interface DerivedStateSimpleSwapProviderProps {
  children: React.ReactNode
}

/* Parses the URL and provides the chainId, token0, and token1 globally.
 * URL example:
 * /swap?token0=NATIVE&token1=0x6b3595068778dd592e39a122f4f5a5cf09c90fe2
 */
const DerivedstateSimpleSwapProvider: FC<DerivedStateSimpleSwapProviderProps> =
  ({ children }) => {
    const { push } = useRouter()
    const { chainId: _chainId } = useParams()
    const { address } = useAccount()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [tokenTax, setTokenTax] = useState<Percent | false | undefined>(
      undefined,
    )
    const [localTokenCache, setLocalTokenCache] = useState<Map<string, Type>>(
      new Map(),
    )

    const chainId = isSupportedChainId(+_chainId)
      ? (+_chainId as SupportedChainId)
      : ChainId.ETHEREUM

    // Get the searchParams and complete with defaults.
    // This handles the case where some params might not be provided by the user
    const defaultedParams = useMemo(() => {
      const params = new URLSearchParams(searchParams)

      if (!params.has('token0')) {
        params.set('token0', getDefaultCurrency(chainId))
      }
      if (!params.has('token1')) {
        params.set('token1', getQuoteCurrency(chainId))
      }
      return params
    }, [chainId, searchParams])

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
      // console.log('switchTokens', {
      //   token0: defaultedParams.get('token1'),
      //   token1: defaultedParams.get('token0'),
      // })
      push(
        `${pathname}?${createQueryString([
          { name: 'swapAmount', value: null },
          { name: 'token0', value: defaultedParams.get('token1') as string },
          { name: 'token1', value: defaultedParams.get('token0') as string },
        ])}`,
        { scroll: false },
      )
    }, [createQueryString, defaultedParams, pathname, push])

    // Update the URL with a new token0
    const setToken0 = useCallback<{ (_token0: string | Type): void }>(
      (_token0) => {
        // If entity is provided, parse it to a string
        const token0 = getTokenAsString(_token0)

        if (typeof _token0 !== 'string') {
          setLocalTokenCache(localTokenCache.set(token0, _token0))
        }

        // Switch tokens if the new token0 is the same as the current token1
        if (
          defaultedParams.get('token1')?.toLowerCase() === token0.toLowerCase()
        ) {
          switchTokens()
        }

        // Push new route
        else {
          push(
            `${pathname}?${createQueryString([
              { name: 'token0', value: token0 },
            ])}`,
            { scroll: false },
          )
        }
      },
      [
        createQueryString,
        defaultedParams,
        localTokenCache,
        pathname,
        push,
        switchTokens,
      ],
    )

    // Update the URL with a new token1
    const setToken1 = useCallback<{ (_token1: string | Type): void }>(
      (_token1) => {
        // If entity is provided, parse it to a string
        const token1 = getTokenAsString(_token1)

        if (typeof _token1 !== 'string') {
          setLocalTokenCache(localTokenCache.set(token1, _token1))
        }

        // Switch tokens if the new token0 is the same as the current token1
        if (
          defaultedParams.get('token0')?.toLowerCase() === token1.toLowerCase()
        ) {
          switchTokens()
        }

        // Push new route
        else {
          push(
            `${pathname}?${createQueryString([
              { name: 'token1', value: token1 },
            ])}`,
            { scroll: false },
          )
        }
      },
      [
        createQueryString,
        defaultedParams,
        localTokenCache,
        pathname,
        push,
        switchTokens,
      ],
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
    const setSwapAmount = useCallback<{ (value: string): void }>(
      (value) => {
        push(
          `${pathname}?${createQueryString([
            { name: 'swapAmount', value: value },
          ])}`,
          { scroll: false },
        )
      },
      [createQueryString, pathname, push],
    )

    const token0Param = defaultedParams.get('token0') as string
    const token1Param = defaultedParams.get('token1') as string

    const token0FromLocalCache = localTokenCache.get(token0Param)
    const token1FromLocalCache = localTokenCache.get(token1Param)

    // Derive token0
    const { data: token0FromCache, isInitialLoading: token0Loading } =
      useTokenWithCache({
        chainId,
        address: token0Param as Address,
        enabled:
          isAddress(token0Param, { strict: false }) && !token0FromLocalCache,
        keepPreviousData: false,
      })

    // Derive token1
    const { data: token1FromCache, isInitialLoading: token1Loading } =
      useTokenWithCache({
        chainId,
        address: token1Param as Address,
        enabled:
          isAddress(token1Param, { strict: false }) && !token1FromLocalCache,
        keepPreviousData: false,
      })

    const token0 = token0FromLocalCache ?? token0FromCache
    const token1 = token1FromLocalCache ?? token1FromCache

    return (
      <DerivedStateSimpleSwapContext.Provider
        value={useMemo(() => {
          const swapAmountString = defaultedParams.get('swapAmount') || ''
          const _token0 =
            defaultedParams.get('token0') === 'NATIVE' &&
            isWNativeSupported(chainId)
              ? Native.onChain(chainId)
              : token0
          const _token1 =
            defaultedParams.get('token1') === 'NATIVE' &&
            isWNativeSupported(chainId)
              ? Native.onChain(chainId)
              : token1

          return {
            mutate: {
              setToken0,
              setToken1,
              setTokens,
              switchTokens,
              setSwapAmount,
              setTokenTax,
            },
            state: {
              recipient: address ?? '',
              chainId,
              swapAmountString,
              swapAmount: tryParseAmount(swapAmountString, _token0),
              token0: _token0,
              token1: _token1,
              tokenTax,
            },
            isLoading: token0Loading || token1Loading,
            isToken0Loading: token0Loading,
            isToken1Loading: token1Loading,
          }
        }, [
          address,
          chainId,
          defaultedParams,
          setSwapAmount,
          setToken0,
          setToken1,
          setTokens,
          switchTokens,
          token0,
          token0Loading,
          token1,
          token1Loading,
          tokenTax,
        ])}
      >
        {children}
      </DerivedStateSimpleSwapContext.Provider>
    )
  }

const useDerivedStateSimpleSwap = () => {
  const context = useContext(DerivedStateSimpleSwapContext)
  if (!context) {
    throw new Error(
      'Hook can only be used inside Simple Swap Derived State Context',
    )
  }

  return context
}

const useSimpleSwapTrade = () => {
  const {
    state: { token0, chainId, swapAmount, token1, recipient, tokenTax },
    mutate: { setTokenTax },
  } = useDerivedStateSimpleSwap()

  const [slippagePercent] = useSlippageTolerance()
  const [carbonOffset] = useCarbonOffset()
  const { data: gasPrice } = useGasPrice({ chainId })

  const adjustedSlippage = useMemo(
    () => (tokenTax ? slippagePercent.add(tokenTax) : slippagePercent),
    [slippagePercent, tokenTax],
  )

  const trade = useApiTrade({
    chainId,
    fromToken: token0,
    toToken: token1,
    amount: swapAmount,
    slippagePercentage: adjustedSlippage.toFixed(2),
    gasPrice,
    recipient: recipient as Address,
    enabled: Boolean(swapAmount?.greaterThan(ZERO)),
    carbonOffset,
    tokenTax,
  })

  // Reset tokenTax when token0 or token1 changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setTokenTax(undefined)
  }, [token0, token1, setTokenTax])

  return trade
}

export {
  DerivedstateSimpleSwapProvider,
  useDerivedStateSimpleSwap,
  useSimpleSwapTrade,
}
