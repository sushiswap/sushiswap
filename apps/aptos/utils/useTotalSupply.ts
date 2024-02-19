import { useQuery } from '@tanstack/react-query'
import { FETCH_URL_PREFIX } from 'lib/constants'

const CONTRACT_ADDRESS =
  process.env['SWAP_CONTRACT'] || process.env['NEXT_PUBLIC_SWAP_CONTRACT']

export type CoinInfo = {
  type: string
  data: {
    decimals: number
    name: string
    supply: {
      vec: [
        {
          aggregator: {
            vec: []
          }
          integer: {
            vec: [
              {
                limit: string
                value: string
              },
            ]
          }
        },
      ]
    }
    symbol: string
  }
}

const totalSupplyQueryFn = async (tokenAddress: string) => {
  if (tokenAddress) {
    const response = await fetch(
      `${FETCH_URL_PREFIX}/v1/accounts/${CONTRACT_ADDRESS}/resource/0x1::coin::CoinInfo<${CONTRACT_ADDRESS}::swap::LPToken<${tokenAddress}>>`,
    )
    if (response.status === 200) {
      const data = await response.json()
      return data as CoinInfo
    }
  }
  return {} as CoinInfo
}

export function useTotalSupply(tokenAddress: string) {
  return useQuery({
    queryKey: ['totalSupply', { tokenAddress }],
    queryFn: async () => totalSupplyQueryFn(tokenAddress),
  })
}
