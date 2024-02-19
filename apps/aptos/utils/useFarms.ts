import { useQuery } from '@tanstack/react-query'
import { FETCH_URL_PREFIX } from 'lib/constants'
import { useMemo } from 'react'
const MASTERCHEF_CONTRACT =
  process.env['MASTERCHEF_CONTRACT'] ||
  process.env['NEXT_PUBLIC_MASTERCHEF_CONTRACT']
const CONTRACT_ADDRESS =
  process.env['SWAP_CONTRACT'] || process.env['NEXT_PUBLIC_SWAP_CONTRACT']

type PoolInfo = {
  acc_aptos_per_share: string
  alloc_point: string
  is_regular: boolean
  last_reward_timestamp: string
  total_amount: string
}

export type FarmLP = {
  type: string
  data: {
    admin: string
    end_timestamp: string
    last_upkeep_timestamp: string
    lp_to_pid: {
      inner: {
        handle: string
      }
      length: string
    }
    lps: string[]
    pool_info: PoolInfo[]
    signer_cap: {
      account: string
    }
    aptos_per_second: string
    aptos_rate_to_regular: string
    aptos_rate_to_special: string
    total_regular_alloc_point: string
    total_special_alloc_point: string
    upkeep_admin: string
  }
}

const farmsQueryFn = async () => {
  const response = await fetch(
    `${FETCH_URL_PREFIX}/v1/accounts/${MASTERCHEF_CONTRACT}/resource/${MASTERCHEF_CONTRACT}::masterchef::MasterChef`,
  )
  if (response.status === 200) {
    const data: FarmLP = await response.json()
    return data
  }
  return {} as FarmLP
}

export const isFarm = (address: string, farms: FarmLP | undefined) => {
  return useMemo(
    () =>
      farms?.data?.lps.indexOf(
        `${CONTRACT_ADDRESS}::swap::LPToken<${address}>`,
      ),
    [address, farms],
  )
}

export function useFarms() {
  return useQuery({
    queryKey: ['farms'],
    queryFn: () => farmsQueryFn(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })
}
