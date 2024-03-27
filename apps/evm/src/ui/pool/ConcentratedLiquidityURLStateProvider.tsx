'use client'

import { useAccount } from '@sushiswap/wagmi'
import { useTokenWithCache } from '@sushiswap/wagmi'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react'
import { SUPPORTED_CHAIN_IDS } from 'src/config'
import { ChainId } from 'sushi/chain'
import {
  SushiSwapV3ChainId,
  SushiSwapV3FeeAmount,
  currencyFromShortCurrencyName,
  isShortCurrencyName,
  isSushiSwapV3ChainId,
} from 'sushi/config'
import { Native, Token, Type } from 'sushi/currency'
import { isAddress } from 'viem'
import { z } from 'zod'

export const queryParamsSchema = z.object({
  chainId: z.coerce
    .number()
    .int()
    .gte(0)
    .lte(2 ** 256)
    .optional()
    .transform((chainId) => chainId as SushiSwapV3ChainId | undefined),
  fromCurrency: z.nullable(z.string()).transform((value) => value ?? 'NATIVE'),
  toCurrency: z.nullable(z.string()).transform((value) => value ?? 'SUSHI'),
  feeAmount: z.coerce
    .number()
    .int()
    .default(SushiSwapV3FeeAmount.MEDIUM)
    .transform((fee) => fee as SushiSwapV3FeeAmount),
  tokenId: z.coerce
    .number()
    .int()
    .nullable()
    .transform((val) => val?.toString())
    .optional(),
})

type State = {
  tokenId: string | undefined
  chainId: SushiSwapV3ChainId
  token0: Type | undefined
  token1: Type | undefined
  tokensLoading: boolean
  feeAmount: SushiSwapV3FeeAmount
  setNetwork(chainId: SushiSwapV3ChainId): void
  setToken0(currency: Type): void
  setToken1(currency: Type): void
  setFeeAmount(feeAmount: SushiSwapV3FeeAmount): void
  switchTokens(): void
}

export const ConcentratedLiquidityUrlStateContext = createContext<State>(
  {} as State,
)

interface ConcentratedLiquidityURLStateProvider {
  children: ReactNode | ((state: State) => ReactNode)
  supportedNetworks?: ChainId[]
}

const getTokenFromUrl = (
  chainId: ChainId,
  currencyId: string | undefined | null,
  token: Token | undefined,
  isLoading: boolean,
) => {
  if (isLoading) {
    return undefined
  } else if (currencyId && isShortCurrencyName(chainId, currencyId)) {
    return currencyFromShortCurrencyName(chainId, currencyId)
  } else if (currencyId && isAddress(currencyId) && token) {
    return token
  } else if (!currencyId) {
    return undefined
  } else {
    return Native.onChain(chainId ? chainId : ChainId.ETHEREUM)
  }
}

const getChainIdFromUrl = (
  urlChainId: ChainId | undefined,
  connectedChainId: ChainId | undefined,
): SushiSwapV3ChainId => {
  let chainId: SushiSwapV3ChainId = ChainId.ETHEREUM
  if (urlChainId && isSushiSwapV3ChainId(urlChainId)) {
    chainId = urlChainId
  } else if (connectedChainId && isSushiSwapV3ChainId(connectedChainId)) {
    chainId = connectedChainId
  }
  return chainId
}

export const ConcentratedLiquidityURLStateProvider: FC<
  ConcentratedLiquidityURLStateProvider
> = ({ children, supportedNetworks = SUPPORTED_CHAIN_IDS }) => {
  const { push } = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()!

  const {
    chainId: chainIdFromUrl,
    fromCurrency,
    toCurrency,
    feeAmount,
    tokenId,
  } = queryParamsSchema.parse({
    chainId: searchParams.get('chainId'),
    fromCurrency: searchParams.get('fromCurrency'),
    toCurrency: searchParams.get('toCurrency'),
    feeAmount: searchParams.get('feeAmount'),
    tokenId: searchParams.get('tokenId'),
  })
  const { chain } = useAccount()
  const [chainId] = useState(chain?.id)

  const tmp = getChainIdFromUrl(chainIdFromUrl, chainId as ChainId)
  const _chainId = supportedNetworks?.includes(tmp) ? tmp : ChainId.ETHEREUM

  const { data: tokenFrom, isInitialLoading: isTokenFromLoading } =
    useTokenWithCache({
      chainId: _chainId,
      address: fromCurrency,
    })

  const { data: tokenTo, isInitialLoading: isTokenToLoading } =
    useTokenWithCache({
      chainId: _chainId,
      address: toCurrency,
    })

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const state = useMemo(() => {
    const token0 = getTokenFromUrl(
      _chainId,
      fromCurrency,
      tokenFrom,
      isTokenFromLoading,
    )
    let token1 = getTokenFromUrl(
      _chainId,
      toCurrency,
      tokenTo,
      isTokenToLoading,
    )

    // Cant have two of the same tokens
    if (
      token1?.wrapped.address === token0?.wrapped.address ||
      (token0 && token1 && token0.chainId !== token1.chainId)
    ) {
      token1 = undefined
    }

    const setNetwork = (chainId: SushiSwapV3ChainId) => {
      const fromCurrency =
        state.token0?.chainId === chainId
          ? state.token0.isNative
            ? 'NATIVE'
            : state.token0.wrapped.address
          : 'NATIVE'
      const toCurrency =
        state.token1?.chainId === chainId
          ? state.token1.isNative
            ? 'NATIVE'
            : state.token1.wrapped.address
          : undefined

      const _searchParams = new URLSearchParams(
        Array.from(searchParams.entries()),
      )
      _searchParams.set('chainId', chainId.toString())
      _searchParams.set('fromCurrency', fromCurrency)
      if (toCurrency) _searchParams.set('toCurrency', toCurrency)
      void push(`${pathname}?${_searchParams.toString()}`)
    }

    const setToken0 = (currency: Type) => {
      const same = currency.wrapped.address === token1?.wrapped.address
      const _fromCurrency = currency.isNative
        ? 'NATIVE'
        : currency.wrapped.address
      const _searchParams = new URLSearchParams(
        Array.from(searchParams.entries()),
      )
      _searchParams.set('chainId', currency.chainId.toString())
      _searchParams.set('fromCurrency', _fromCurrency)
      if (toCurrency) {
        _searchParams.set(
          'toCurrency',
          toCurrency === _fromCurrency || same ? fromCurrency : toCurrency,
        )
      }
      void push(`${pathname}?${_searchParams.toString()}`)
    }
    const setToken1 = (currency: Type) => {
      const same = currency.wrapped.address === token0?.wrapped.address
      const _toCurrency = currency.isNative
        ? 'NATIVE'
        : currency.wrapped.address
      const _searchParams = new URLSearchParams(
        Array.from(searchParams.entries()),
      )
      _searchParams.set('chainId', currency.chainId.toString())
      _searchParams.set('toCurrency', _toCurrency)
      if (fromCurrency) {
        _searchParams.set(
          'fromCurrency',
          fromCurrency === _toCurrency || same ? toCurrency : fromCurrency,
        )
      }
      void push(`${pathname}?${_searchParams.toString()}`)
    }
    const setFeeAmount = (feeAmount: SushiSwapV3FeeAmount) => {
      const _searchParams = new URLSearchParams(
        Array.from(searchParams.entries()),
      )
      _searchParams.set('feeAmount', feeAmount.toString())
      void push(`${pathname}?${_searchParams.toString()}`)
    }
    const switchTokens = () => {
      const _searchParams = new URLSearchParams(
        Array.from(searchParams.entries()),
      )
      _searchParams.set(
        'fromCurrency',
        !token1 || token1.isNative ? 'NATIVE' : token1.wrapped.address,
      )
      _searchParams.set(
        'toCurrency',
        !token0 || token0.isNative ? 'NATIVE' : token0.wrapped.address,
      )
      void push(`${pathname}?${_searchParams.toString()}`)
    }

    return {
      tokenId,
      feeAmount,
      token0,
      token1,
      chainId: _chainId,
      tokensLoading: isTokenFromLoading || isTokenToLoading,
      setToken0,
      setToken1,
      setNetwork,
      setFeeAmount,
      switchTokens,
    }
  }, [
    _chainId,
    fromCurrency,
    tokenFrom,
    isTokenFromLoading,
    toCurrency,
    tokenTo,
    isTokenToLoading,
    tokenId,
    feeAmount,
    searchParams,
    push,
    pathname,
  ])

  return (
    <ConcentratedLiquidityUrlStateContext.Provider value={state}>
      {typeof children === 'function' ? children(state) : children}
    </ConcentratedLiquidityUrlStateContext.Provider>
  )
}

export const useConcentratedLiquidityURLState = () => {
  const context = useContext(ConcentratedLiquidityUrlStateContext)
  if (!context) {
    throw new Error('Hook can only be used inside Token State Context')
  }

  return context
}
