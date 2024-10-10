import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SupportedNetwork, chains } from '~aptos/_common/config/chains'
import { useNetwork } from '~aptos/_common/lib/common/use-network'
import { AptosPool, convertPoolToSushiPool } from './convert-pool-to-sushi-pool'

interface GetPoolQueryFn {
  poolAddress: string
  network: SupportedNetwork
}

export const getPoolQueryFn = async ({
  poolAddress,
  network,
}: GetPoolQueryFn) => {
  const response = await fetch(
    `${chains[network].api.fetchUrlPrefix}/v1/accounts/${chains[network].contracts.swap}/resource/${chains[network].contracts.swap}::swap::TokenPairMetadata<${poolAddress}>`,
  )

  if (response.status === 200) {
    const pair: AptosPool = await response.json()

    return convertPoolToSushiPool(pair)
  }
}

export function usePool(poolAddress: string) {
  const { network } = useNetwork()

  return useQuery({
    queryKey: ['pool', { poolAddress, network }],
    queryFn: async () => getPoolQueryFn({ poolAddress, network }),
    placeholderData: keepPreviousData,
    enabled: Boolean(poolAddress),
  })
}
