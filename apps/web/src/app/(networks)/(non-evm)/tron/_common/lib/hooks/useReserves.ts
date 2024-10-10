import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { PAIR_ABI } from '~tron/_common/constants/abis/pair-abi'
import { sortTokens } from '~tron/_common/lib/utils/formatters'
import { isAddress } from '~tron/_common/lib/utils/helpers'
import { IToken } from '~tron/_common/types/token-type'
import { useTronWeb } from './useTronWeb'

export const useReserves = ({
  pairAddress,
  token0,
  token1,
  refetchInterval = false,
}: {
  pairAddress: string | undefined | null
  token0: IToken | undefined
  token1: IToken | undefined
  refetchInterval?: number | false
}) => {
  const { tronWeb } = useTronWeb()
  const [_token0, _token1] = useMemo(() => {
    if (!token0 || !token1) return []
    return sortTokens(token0, token1)
  }, [token0, token1])

  return useQuery({
    queryKey: ['useReserves', { pairAddress, token0, token1 }],
    queryFn: async () => {
      if (
        !pairAddress ||
        !tronWeb ||
        !isAddress(pairAddress) ||
        !token0 ||
        !token1
      )
        return []
      tronWeb.setAddress(pairAddress)
      try {
        const pairInstance = await tronWeb.contract(PAIR_ABI, pairAddress)
        const [reserve0, reserve1] = await pairInstance.getReserves().call()
        //@DEV reserves are returned in order of token0, token1 in the pair contract
        return [
          {
            ..._token0,
            reserve: reserve0.toString() as string,
          },
          { ..._token1, reserve: reserve1.toString() as string },
        ]
      } catch (error) {
        console.error('useReserves error', error)
        return []
      }
    },
    enabled:
      !!pairAddress &&
      isAddress(pairAddress) &&
      !!tronWeb &&
      !!token0 &&
      !!token1,
    refetchInterval,
  })
}
