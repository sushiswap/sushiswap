import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { SupportedNetwork, chains } from '~aptos/_common/config/chains'
import { useNetwork } from '~aptos/_common/lib/common/use-network'

type PoolInfo = {
  acc_sushi_per_share: string
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
    sushi_per_second: string
    sushi_rate_to_regular: string
    sushi_rate_to_special: string
    total_regular_alloc_point: string
    total_special_alloc_point: string
    upkeep_admin: string
  }
}

interface FarmsQueryFn {
  network: SupportedNetwork
}

const farmsQueryFn = async ({ network }: FarmsQueryFn) => {
  const response = await fetch(
    `${chains[network].api.fetchUrlPrefix}/v1/accounts/${chains[network].contracts.masterchef}/resource/${chains[network].contracts.masterchef}::masterchef::MasterChef`,
  )

  if (response.status === 200) {
    const data: FarmLP = await response.json()
    return data
  }

  return undefined
}

interface UseIsFarm {
  poolAddress: string
  farms: FarmLP | undefined
}

export const useIsFarm = ({ poolAddress, farms }: UseIsFarm) => {
  const {
    contracts: { swap: swapContract },
  } = useNetwork()

  return useMemo(
    () =>
      farms?.data?.lps.indexOf(
        `${swapContract}::swap::LPToken<${poolAddress}>`,
      ),
    [poolAddress, swapContract, farms],
  )
}

export function useFarms() {
  const {
    network,
    contracts: { masterchef },
  } = useNetwork()

  return useQuery({
    queryKey: ['farms', { network }],
    queryFn: () => farmsQueryFn({ network }),
    enabled: Boolean(masterchef),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })
}
