import { useQuery } from '@tanstack/react-query'
import { FETCH_URL_PREFIX } from 'lib/constants'

export const tokenBalanceQueryFn = async (
  account: string,
  currency: string,
) => {
  if (account) {
    const response = await fetch(
      `${FETCH_URL_PREFIX}/v1/accounts/${account}/resource/0x1::coin::CoinStore<${currency}>`,
    )
    if (response.status === 200) {
      const data = await response.json()
      return Number(data.data.coin.value)
    }
  }
  return 0
}

interface Params {
  account: string
  currency: string
  enabled?: boolean
  refetchInterval?: number
}

export function useTokenBalance({
  account,
  currency,
  enabled = true,
  refetchInterval,
}: Params) {
  return useQuery({
    queryKey: ['balance', { currency, account }],
    queryFn: async () => tokenBalanceQueryFn(account, currency),
    enabled: Boolean(currency && enabled),
    refetchInterval: refetchInterval && refetchInterval,
  })
}
