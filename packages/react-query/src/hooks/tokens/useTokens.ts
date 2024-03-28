// import { saveTokens } from '@sushiswap/dexie'
import { useCustomTokens } from '@sushiswap/hooks'
import { useQuery } from '@tanstack/react-query'
import ms from 'ms'
import { Token } from 'sushi/currency'
import { getAddress } from 'viem'

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

export const fetchTokensQueryFn = async ({
  customTokenMap,
}: { customTokenMap: Record<string, Token> }) => {
  const resp = await fetch('https://tokens.sushi.com/v0')
  if (resp.status === 200) {
    const data: Data[] = await resp.json()

    // DO WE REALLY NEED THIS
    // await saveTokens({
    //   tokens: data.map(({ id, address, symbol, decimals, name }) => {
    //     const [chainId] = id.split(':')
    //     return {
    //       id,
    //       address,
    //       symbol,
    //       decimals,
    //       name,
    //       status: 'APPROVED',
    //       chainId: Number(chainId),
    //     }
    //   }),
    // })

    Object.entries(customTokenMap).forEach(
      ([id, { address, name, symbol, decimals }]) => {
        data.push({
          id,
          address: address!,
          name: name!,
          symbol: symbol!,
          decimals,
        })
      },
    )

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
  const { data: customTokenMap } = useCustomTokens()
  return useQuery({
    queryKey: ['tokens', Object.keys(customTokenMap).length],
    queryFn: () => fetchTokensQueryFn({ customTokenMap }),
    select: (data) => data[chainId],
    keepPreviousData: true,
    staleTime: ms('15m'), // 15 mins
    cacheTime: ms('24h'), // 24hs
  })
}
