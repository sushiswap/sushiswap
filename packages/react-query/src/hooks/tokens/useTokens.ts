import { saveTokens } from '@sushiswap/dexie'
import { useQuery } from '@tanstack/react-query'
import { Token } from 'sushi/currency'
import { getAddress } from 'viem'

interface UseTokensParams {
  chainId: number
}

type Data = {
  // id: string
  chainId: number
  address: string
  name: string
  symbol: string
  decimals: number
}

export const fetchTokensQueryFn = async () => {
  const resp = await fetch('https://tokens.sushi.com/v2')
  if (resp.status === 200) {
    const data: Data[] = await resp.json()
    await saveTokens({
      tokens: data.map(({ chainId, address, symbol, decimals, name }) => {
        // const [chainId] = id.split(':')
        return {
          id: `${chainId}:${address}`,
          address,
          symbol,
          decimals,
          name,
          status: 'APPROVED',
          chainId: Number(chainId),
        }
      }),
    })

    return data.reduce<Record<number, Record<string, Token>>>(
      (acc, { chainId, address, name, symbol, decimals }) => {
        // const [_chainId, _address] = id.split(':')

        // const chainId = Number(_chainId)
        // const address = String(_address)

        if (!acc?.[chainId]) acc[chainId] = {}

        const map = acc[chainId] as Record<string, Token>

        map[getAddress(address)] = new Token({
          chainId,
          name,
          decimals,
          symbol,
          address,
        })

        return acc
      },
      {},
    )
  }

  throw new Error('Could not fetch tokens')
}

export const useTokens = ({ chainId }: UseTokensParams) => {
  return useQuery({
    queryKey: ['tokens'],
    queryFn: fetchTokensQueryFn,
    select: (data) => data[chainId],
    keepPreviousData: true,
    staleTime: 900000, // 15 mins
    cacheTime: 86400000, // 24hs
  })
}
