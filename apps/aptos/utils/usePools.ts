import { useQuery } from '@tanstack/react-query'
import { FETCH_URL_PREFIX } from 'lib/constants'

export type Pool = {
  id: string
  type: string
  data: {
    balance_x: {
      value: string
    }
    balance_y: {
      value: string
    }
    burn_cap: {
      dummy_field: boolean
    }
    creator: string
    fee_amount: {
      value: string
    }
    freeze_cap: {
      dummy_field: boolean
    }
    k_last: string
    mint_cap: {
      dummy_field: boolean
    }
    token_x_details: {
      decimals: number
      name: string
      symbol: string
      token_address: string
    }
    token_y_details: {
      decimals: number
      name: string
      symbol: string
      token_address: string
    }
  }
}

export async function fetchPoolsQueryFn() {
  const CONTRACT_ADDRESS = process.env['NEXT_PUBLIC_SWAP_CONTRACT']
  const response = await fetch(
    `${FETCH_URL_PREFIX}/v1/accounts/${CONTRACT_ADDRESS}/resources`,
  )
  if (response.status === 200) {
    const data = await response.json()
    const coinPair: Pool[] = data.filter((pair: Pool) => {
      pair.id =
        pair?.data?.token_x_details?.token_address +
        ', ' +
        pair?.data?.token_y_details?.token_address
      return pair.type.includes(`${CONTRACT_ADDRESS}::swap::TokenPairMetadata`)
    })
    return coinPair
  }
  return []
}

export function usePools(enable = true) {
  return useQuery({
    queryKey: ['pools'],
    queryFn: async () => fetchPoolsQueryFn(),
    keepPreviousData: true,
    enabled: Boolean(enable),
  })
}
