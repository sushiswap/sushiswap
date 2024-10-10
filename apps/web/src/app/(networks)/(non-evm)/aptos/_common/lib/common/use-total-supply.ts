import { useQuery } from '@tanstack/react-query'
import { SupportedNetwork, chains } from '~aptos/_common/config/chains'
import { useNetwork } from './use-network'

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

interface TotalSupplyQueryFn {
  tokenAddress: string
  network: SupportedNetwork
}

const totalSupplyQueryFn = async ({
  tokenAddress,
  network,
}: TotalSupplyQueryFn) => {
  const response = await fetch(
    `${chains[network].api.fetchUrlPrefix}/v1/accounts/${chains[network].contracts.swap}/resource/0x1::coin::CoinInfo<${chains[network].contracts.swap}::swap::LPToken<${tokenAddress}>>`,
  )
  if (response.status === 200) {
    const data = await response.json()
    return data as CoinInfo
  }

  return undefined
}

export function useTotalSupply(tokenAddress: string | undefined) {
  const { network } = useNetwork()

  return useQuery({
    queryKey: ['totalSupply', { tokenAddress, network }],
    queryFn: async () =>
      totalSupplyQueryFn({ tokenAddress: tokenAddress as string, network }),
    enabled: Boolean(tokenAddress),
  })
}
