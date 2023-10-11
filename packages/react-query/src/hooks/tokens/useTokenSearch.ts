import { getAddress, isAddress } from '@ethersproject/address'
import { Token } from 'sushi/currency'
import { useLocalStorage } from '@sushiswap/hooks'
import { useQuery } from '@tanstack/react-query'

interface UseTokensParams {
  address: string | undefined
  enabled?: boolean
}

type Data = Array<{
  id: string
  address: string
  name: string
  symbol: string
  decimals: number
  status: 'UNKNOWN' | 'APPROVED'
}>

export const useTokenSearch = ({
  address,
  enabled = true,
}: UseTokensParams) => {
  const [tokenApi] = useLocalStorage('tokenApi', true)

  return useQuery({
    queryKey: ['tokenSearch', { address }, tokenApi],
    queryFn: async () => {
      const resp =
        tokenApi &&
        (await fetch(`https://tokens.sushi.com/v0/search/${address}`))

      let data: Data
      if (resp && resp.status === 200) {
        data = await resp.json()
      } else {
        data = (
          await import('@sushiswap/default-token-list').then(
            (list) => list.tokens,
          )
        )
          .filter(
            (token) => token.address.toLowerCase() === address?.toLowerCase(),
          )
          .map((token) => ({
            ...token,
            id: `${token.chainId}:${token.address.toLowerCase()}`,
            status: 'APPROVED',
          }))
      }

      return data.reduce<Record<string, { token: Token; official: boolean }>>(
        (acc, { id, name, symbol, decimals, status }) => {
          const [chainId, address] = id.split(':')
          acc[getAddress(String(address))] = {
            token: new Token({
              chainId: Number(chainId),
              name,
              decimals,
              symbol,
              address: String(address),
            }),
            official: status === 'APPROVED',
          }
          return acc
        },
        {},
      )
    },
    enabled: enabled && !!address && isAddress(address),
    staleTime: 900000, // 15 mins
    cacheTime: 86400000, // 24hs
  })
}
