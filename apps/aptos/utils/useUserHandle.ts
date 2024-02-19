import { useQuery } from '@tanstack/react-query'
import { FETCH_URL_PREFIX, GRAPHQL_URL } from 'lib/constants'
const MASTERCHEF_CONTRACT =
  process.env['MASTERCHEF_CONTRACT'] ||
  process.env['NEXT_PUBLIC_MASTERCHEF_CONTRACT']
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

export type userStakes = {
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

const userHandleQueryFn = async (handle: string | undefined) => {
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
  const result = await fetch(GRAPHQL_URL, {
    method: 'POST',
    body: JSON.stringify({
      query: operationsDoc,
      variables: {},
      operationName: 'MyQuery',
    }),
  })
  const data: userStakes = await result.json()
  return data
}

const userPoolQueryFn = async (address: string | undefined) => {
  const response = await fetch(
    `${FETCH_URL_PREFIX}/v1/accounts/${address}/resource/${MASTERCHEF_CONTRACT}::masterchef::PoolUserInfo`,
  )
  if (response.status === 200) {
    const userPoolInfo: PoolUserInfo = await response.json()
    return userPoolInfo
  }
  return {} as PoolUserInfo
}

export const getPIdIndex = (
  farmIndex: number | undefined,
  stakes: userStakes | undefined,
) => {
  return stakes?.data?.current_table_items?.length
    ? stakes?.data?.current_table_items
        ?.map((key) => key.decoded_key)
        .indexOf(String(farmIndex))
    : -1
}

export function useUserPool(address: string | undefined) {
  return useQuery({
    queryKey: ['handle', { address }],
    queryFn: async () => userPoolQueryFn(address),
    enabled: Boolean(address),
    refetchInterval: 2000,
  })
}

export function useUserHandle({
  address,
  userHandle,
}: {
  address: string | undefined
  userHandle: PoolUserInfo | undefined
}) {
  // const { data: handle } = useUserPool(address)
  return useQuery({
    queryKey: ['userStackes', { userHandle }],
    queryFn: async () =>
      userHandleQueryFn(userHandle?.data?.pid_to_user_info?.inner?.handle),
    enabled: Boolean(
      userHandle?.data?.pid_to_user_info?.inner?.handle && address,
    ),
    refetchInterval: 2000,
  })
}
