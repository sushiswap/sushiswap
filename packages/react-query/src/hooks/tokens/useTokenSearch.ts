import { useQuery } from '@tanstack/react-query'
import { Token } from 'sushi/currency'
import { getAddress, isAddress } from 'viem'

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
  return useQuery({
    queryKey: ['tokenSearch', { address }],
    queryFn: async () => {
      const data: Data = await fetch(
        `https://tokens.sushi.com/v2/search/${address}`,
      ).then((response) => response.json())
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
