import { useMemo } from 'react'
import { Token } from './tokenType'
import { UseQueryResult, useQueries } from '@tanstack/react-query'
import { FETCH_URL_PREFIX } from 'lib/constants'
import fromPairs from 'lodash.frompairs'

const CONTRACT_ADDRESS =
  process.env['SWAP_CONTRACT'] || process.env['NEXT_PUBLIC_SWAP_CONTRACT']

export enum PairState {
  LOADING = 0,
  NOT_EXISTS = 1,
  EXISTS = 2,
  INVALID = 3,
}

export type Pair = {
  liquidityToken: Token
  tokenAmounts: string[]
  token0: Token
  token1: Token
}
export function usePairReservesQueries(pairAddresses: (string | undefined)[]) {
  const pairReservesQueries = useQueries({
    queries: useMemo(
      () =>
        pairAddresses.map((pairAddress) => ({
          enabled: Boolean(pairAddress),
          queryFn: async () => {
            if (!pairAddress) throw new Error('No pair address')
            const response = await fetch(
              `${FETCH_URL_PREFIX}/v1/accounts/${CONTRACT_ADDRESS}/resource/${pairAddress}`,
            )
            if (response.status === 200) {
              const data = response.json()
              return data
            }
            return {}
          },
          queryKey: [
            {
              entity: 'pairResource',
              pairAddress,
              resourceType: CONTRACT_ADDRESS,
            },
          ],
          staleTime: Infinity,
          // refetchInterval: 3000,
        })),
      [pairAddresses],
    ),
  }) as UseQueryResult<{
    type: string
    data: { reserve_x: string; reserve_y: string; block_timestamp_last: string }
  }>[]

  const pairReserves = useMemo(
    () =>
      fromPairs(
        pairReservesQueries
          .filter((p) => Boolean(p.data))
          .map(
            (p) =>
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              [p.data!.type, p.data] as [
                string,
                {
                  type: string
                  data: {
                    reserve_x: string
                    reserve_y: string
                    block_timestamp_last: string
                  }
                },
              ],
          ),
      ),
    [pairReservesQueries],
  )
  return pairReserves || {}
}

export default function usePairs(
  currencies: [Token | undefined, Token | undefined][],
): [PairState, Pair | null][] {
  const tokens = useMemo(() => currencies.map(([a, b]) => [a, b]), [currencies])
  const pairAddresses = useMemo(
    () => [
      ...new Set(
        tokens.map(([tokenA, tokenB]) => {
          if (!tokenA || !tokenB || tokenA.address === tokenB.address) {
            return undefined
          }
          return getReservesAddress(tokenA, tokenB)
        }),
      ),
    ],
    [tokens],
  )
  const pairReserves = usePairReservesQueries(pairAddresses)
  return useMemo(() => {
    return tokens.map(([tokenA, tokenB]) => {
      if (!tokenA || !tokenB || tokenA?.address === tokenB.address) {
        return [PairState.INVALID, null]
      }
      const pairReservesAddress = getReservesAddress(tokenA, tokenB)

      if (pairReserves?.[pairReservesAddress]) {
        const [token0, token1] = sortToken(tokenA, tokenB)
        return [
          PairState.EXISTS,
          getPair(
            token0,
            token1,
            pairReserves[pairReservesAddress].data.reserve_x,
            pairReserves[pairReservesAddress].data.reserve_y,
          ),
        ]
      }
      return [PairState.NOT_EXISTS, null]
    })
  }, [pairReserves, tokens])
}

export const getReservesAddress = (tokenA: Token, tokenB: Token) => {
  const [token0, token1] = sortToken(tokenA, tokenB)
  return `${CONTRACT_ADDRESS}::swap::TokenPairReserve<${token0.address}, ${token1.address}>`
}

export const sortsBefore = (tokenA: Token, tokenB: Token) => {
  return tokenA?.address?.toLowerCase() < tokenB?.address?.toLowerCase()
}

export const sortToken = (tokenA: Token, tokenB: Token) => {
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
) {
  const liquidityToken = getLiquidityToken(token0, token1)
  const tokenAmounts = sortsBefore(token0, token1)
    ? [currencyAmountA, tokenAmountB]
    : [tokenAmountB, currencyAmountA]
  return { liquidityToken, tokenAmounts, token0, token1 }
}

function getLiquidityToken(tokenA: Token, tokenB: Token) {
  const [token0, token1] = sortToken(tokenA, tokenB)
  return {
    address: getAddress(tokenA, tokenB),
    decimals: 8,
    symbol: 'Sushi-LP',
    name: `sushi-${token0.symbol}-${token1.symbol}-LP`,
  }
}

function getAddress(tokenA: Token, tokenB: Token) {
  const [token0, token1] = sortToken(tokenA, tokenB)
  return `${CONTRACT_ADDRESS}::swap::LPToken<${token0.address}, ${token1.address}>`
}
