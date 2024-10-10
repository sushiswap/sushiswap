import { useMemo } from 'react'
import { SupportedNetwork, chains } from '~aptos/_common/config/chains'
import { useNetwork } from '~aptos/_common/lib/common/use-network'
import type { Token } from '~aptos/_common/lib/types/token'
import { usePoolsReserves } from './use-pools-reserves'

export enum PairState {
  LOADING = 'Loading',
  NOT_EXISTS = 'Not Exists',
  EXISTS = 'Exists',
  INVALID = 'Invalid',
}

export type Pair = {
  liquidityToken: Token
  tokenAmounts: string[]
  token0: Token
  token1: Token
}

interface UsePoolsByTokens {
  tokens: [Token | undefined, Token | undefined][]
  ledgerVersion?: number
}

export function usePoolsByTokens({ tokens, ledgerVersion }: UsePoolsByTokens) {
  const { network } = useNetwork()

  const poolAddresses = useMemo(
    () => [
      ...new Set(
        tokens.flatMap(([tokenA, tokenB]) => {
          if (!tokenA || !tokenB || tokenA.address === tokenB.address) {
            return []
          }
          return getReservesAddress(tokenA, tokenB, network)
        }),
      ),
    ],
    [tokens, network],
  )

  const { data: poolReserves, ...rest } = usePoolsReserves({
    poolAddresses,
    ledgerVersion,
  })

  const data = useMemo<[PairState, Pair | null][]>(() => {
    return tokens.map(([tokenA, tokenB]) => {
      if (!tokenA || !tokenB || tokenA?.address === tokenB.address) {
        return [PairState.INVALID, null]
      }
      const poolReservesAddress = getReservesAddress(tokenA, tokenB, network)

      if (poolReserves?.[poolReservesAddress]) {
        const [token0, token1] = sortToken(tokenA, tokenB)
        return [
          PairState.EXISTS,
          getPair(
            token0,
            token1,
            poolReserves[poolReservesAddress].reserve0,
            poolReserves[poolReservesAddress].reserve1,
            network,
          ),
        ]
      }
      return [PairState.NOT_EXISTS, null]
    })
  }, [poolReserves, tokens, network])

  return { data, ...rest }
}

const getReservesAddress = (
  tokenA: Token,
  tokenB: Token,
  network: SupportedNetwork,
) => {
  const [token0, token1] = sortToken(tokenA, tokenB)
  return `${chains[network].contracts.swap}::swap::TokenPairReserve<${token0.address}, ${token1.address}>`
}

const sortsBefore = (tokenA: Token, tokenB: Token) => {
  return tokenA?.address?.toLowerCase() < tokenB?.address?.toLowerCase()
}

const sortToken = (tokenA: Token, tokenB: Token) => {
  const [token0, token1] = sortsBefore(tokenA, tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA]
  return [token0, token1]
}

function getPair(
  token0: Token,
  token1: Token,
  currencyAmountA: string,
  tokenAmountB: string,
  network: SupportedNetwork,
) {
  const liquidityToken = getLiquidityToken(token0, token1, network)
  const tokenAmounts = sortsBefore(token0, token1)
    ? [currencyAmountA, tokenAmountB]
    : [tokenAmountB, currencyAmountA]
  return { liquidityToken, tokenAmounts, token0, token1 }
}

function getLiquidityToken(
  tokenA: Token,
  tokenB: Token,
  network: SupportedNetwork,
) {
  const [token0, token1] = sortToken(tokenA, tokenB)
  return {
    address: getAddress(tokenA, tokenB, network),
    decimals: 8,
    symbol: 'Sushi-LP',
    name: `sushi-${token0.symbol}-${token1.symbol}-LP`,
  }
}

function getAddress(tokenA: Token, tokenB: Token, network: SupportedNetwork) {
  const [token0, token1] = sortToken(tokenA, tokenB)
  return `${chains[network].contracts.swap}::swap::LPToken<${token0.address}, ${token1.address}>`
}
