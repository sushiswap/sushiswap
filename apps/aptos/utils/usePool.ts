import { useQuery } from '@tanstack/react-query'
import { Pool } from './usePools'
import { FETCH_URL_PREFIX } from 'lib/constants'
const CONTRACT_ADDRESS =
  process.env['SWAP_CONTRACT'] || process.env['NEXT_PUBLIC_SWAP_CONTRACT']

export const getPoolQueryFn = async (address: string) => {
  if (address) {
    const response = await fetch(
      `${FETCH_URL_PREFIX}/v1/accounts/${CONTRACT_ADDRESS}/resource/${CONTRACT_ADDRESS}::swap::TokenPairMetadata<${address}>`,
    )
    if (response.status === 200) {
      const pair = await response.json()
      pair.id =
        pair?.data?.token_x_details?.token_address +
        ', ' +
        pair?.data?.token_y_details?.token_address
      return pair as Pool
    }
  }
  return {} as Pool
}

export function usePool(address: string) {
  return useQuery({
    queryKey: ['pool', { address }],
    queryFn: async () => getPoolQueryFn(address),
    keepPreviousData: true,
    enabled: Boolean(address),
  })
}
