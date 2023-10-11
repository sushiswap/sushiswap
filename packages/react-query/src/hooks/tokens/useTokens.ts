import { getAddress } from '@ethersproject/address'
import { Token } from 'sushi/currency'
import { saveTokens } from '@sushiswap/dexie'
import { useQuery } from '@tanstack/react-query'
import { useLocalStorage } from '@sushiswap/hooks'

interface UseTokensParams {
  chainId: number
}

type Data = {
  id: string
  address: string
  name: string
  symbol: string
  decimals: number
}

export const fetchTokensQueryFn = async (tokenApi: boolean) => {
  const resp = tokenApi && (await fetch('https://tokens.sushi.com/v0'))

  let data: Array<Data>
  if (resp && resp.status === 200) {
    data = await resp.json()
  } else {
    data = (
      await import('@sushiswap/default-token-list').then((list) => list.tokens)
    ).map((data) => ({
      ...data,
      id: `${data.chainId}:${data.address?.toLowerCase()}`,
    }))
  }

  if (data) {
    await saveTokens({
      tokens: data.map(({ id, address, symbol, decimals, name }) => {
        const [chainId] = id.split(':')
        return {
          id,
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
      (acc, { id, name, symbol, decimals }) => {
        const [_chainId, _address] = id.split(':')

        const chainId = Number(_chainId)
        const address = String(_address)

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
  const [tokenApi] = useLocalStorage('tokenApi', true)

  return useQuery({
    queryKey: ['tokens', tokenApi],
    queryFn: () => fetchTokensQueryFn(tokenApi),
    select: (data) => data[chainId],
    keepPreviousData: true,
    staleTime: 900000, // 15 mins
    cacheTime: 86400000, // 24hs
  })
}
