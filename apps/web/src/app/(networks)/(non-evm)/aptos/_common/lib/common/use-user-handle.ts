import { useQuery } from '@tanstack/react-query'
import {
  SupportedNetwork,
  chains,
  isSupportedNetwork,
} from '~aptos/_common/config/chains'
import { useNetwork } from './use-network'

export type PoolUserInfo = {
  type: string
  data: {
    pid_to_user_info: {
      inner: {
        handle: string
      }
      length: string
    }
    pids: string[]
  }
}

export type UserStakes = {
  data: {
    current_table_items: {
      decoded_value: {
        amount: string
        reward_debt: string
      }
      decoded_key: string
    }[]
  }
}

interface UserHandleQueryFn {
  handle: string
  network: SupportedNetwork
}

const userHandleQueryFn = async ({ handle, network }: UserHandleQueryFn) => {
  const operationsDoc = `
			query MyQuery {
				current_table_items(
					where: {table_handle: {_eq: "${handle}"}}
				) {
					decoded_value
          decoded_key
				}
			}
		`

  const result = await fetch(chains[network].api.graphqlUrl, {
    method: 'POST',
    body: JSON.stringify({
      query: operationsDoc,
      variables: {},
      operationName: 'MyQuery',
    }),
  })

  const data: UserStakes = await result.json()
  return data
}

interface UserPoolQueryFn {
  address: string
  network: SupportedNetwork
}

const userPoolQueryFn = async ({ address, network }: UserPoolQueryFn) => {
  const response = await fetch(
    `${chains[network].api.fetchUrlPrefix}/v1/accounts/${address}/resource/${chains[network].contracts.masterchef}::masterchef::PoolUserInfo`,
  )

  if (response.status === 200) {
    const userPoolInfo: PoolUserInfo = await response.json()
    return userPoolInfo
  }

  return undefined
}

export const getPIdIndex = (
  farmIndex: number | undefined,
  stakes: UserStakes | undefined,
) => {
  return stakes?.data?.current_table_items?.length
    ? stakes?.data?.current_table_items
        ?.map((key) => key.decoded_key)
        .indexOf(String(farmIndex))
    : -1
}

export function useUserPool(address: string | undefined) {
  const {
    network,
    contracts: { masterchef },
  } = useNetwork()

  return useQuery({
    queryKey: ['handle', { address, network }],
    queryFn: async () =>
      userPoolQueryFn({
        address: address as string,
        network: network,
      }),
    enabled: Boolean(address && isSupportedNetwork(network) && masterchef),
    refetchInterval: 2000,
  })
}

export function useUserHandle({
  userHandle,
}: { userHandle: PoolUserInfo | undefined }) {
  const {
    network,
    contracts: { masterchef },
  } = useNetwork()

  return useQuery({
    queryKey: ['userStackes', { userHandle, network: network }],
    queryFn: async () =>
      userHandleQueryFn({
        handle: userHandle?.data?.pid_to_user_info?.inner?.handle as string,
        network: network as SupportedNetwork,
      }),
    enabled: Boolean(
      userHandle?.data?.pid_to_user_info?.inner?.handle &&
        isSupportedNetwork(network) &&
        masterchef,
    ),
    refetchInterval: 2000,
  })
}
