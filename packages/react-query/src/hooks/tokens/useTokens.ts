// import { saveTokens } from '@sushiswap/dexie'
import { useQuery } from '@tanstack/react-query'
import { WrappedTokenInfo } from 'sushi'
import { Token } from 'sushi/currency'
import { getAddress } from 'viem'

interface UseTokensParams {
  chainId: number
}

type Data = {
  address: string
  chainId: number
  name: string
  symbol: string
  decimals: number
  logoURI: string
}

export const fetchTokensQueryFn = async () => {
  const res = await fetch(
    'https://tokens-git-feature-tokens-v1-index.sushi.com/v1',
  )
  if (res.status === 200) {
    const data: Data[] = await res.json()
    // await saveTokens({
    //   tokens: data.map(
    //     ({ address, chainId, symbol, decimals, name, logoURI }) => {
    //       return {
    //         id: `${chainId}:${address}`,
    //         address,
    //         symbol,
    //         decimals,
    //         name,
    //         logoURI,
    //         status: 'APPROVED',
    //         chainId: Number(chainId),
    //       }
    //     },
    //   ),
    // })

    return data.reduce<Record<number, Record<string, WrappedTokenInfo>>>(
      (
        acc,
        {
          address: _address,
          chainId: _chainId,
          name,
          logoURI,
          symbol,
          decimals,
        },
      ) => {
        // const [_chainId, _address] = id.split(':')

        const chainId = Number(_chainId)
        const address = String(_address)

        if (!acc?.[chainId]) acc[chainId] = {}

        const map = acc[chainId] as Record<string, Token>

        map[getAddress(address)] = new WrappedTokenInfo({
          chainId,
          name,
          decimals,
          symbol,
          address,
          logoURI,
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
