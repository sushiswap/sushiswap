import { useQuery } from '@tanstack/react-query'
import { isPromiseFulfilled } from 'sushi'
import {
  SupportedNetwork,
  networkNameToNetwork,
} from '~aptos/_common/config/chains'
import { AptosSDK } from './aptos-sdk'
import { useNetwork } from './use-network'

interface TokenBalanceQueryFn {
  account: string
  currency: string
  network: SupportedNetwork
}

export const tokenBalanceQueryFn = async ({
  account,
  currency,
  network,
}: TokenBalanceQueryFn) => {
  const aptos = AptosSDK.onNetwork(networkNameToNetwork(network))

  try {
    const fungibleAssetBalances = await aptos.getCurrentFungibleAssetBalances({
      options: {
        where: {
          owner_address: {
            _eq: account,
          },
          asset_type: {
            _eq: currency,
          },
        },
      },
    })

    return { currency, balance: fungibleAssetBalances?.[0].amount || 0 }
  } catch {
    return { currency, balance: 0 }
  }
}

interface UseTokenBalance {
  account?: string
  currency?: string
  enabled?: boolean
  refetchInterval?: number
}

export function useTokenBalance({
  account,
  currency,
  enabled = true,
  refetchInterval,
}: UseTokenBalance) {
  const { network } = useNetwork()

  return useQuery({
    queryKey: ['balance', { currency, account, network }],
    queryFn: async () => {
      if (!account || !currency) {
        throw new Error('Account and currency is required')
      }

      return tokenBalanceQueryFn({ account, currency, network })
    },
    select: (data) => data?.balance,
    refetchInterval,
    enabled: Boolean(account && currency && enabled),
  })
}

interface UseTokenBalances {
  account?: string
  currencies: string[]
  enabled?: boolean
  refetchInterval?: number
}

export function useTokenBalances({
  account,
  currencies,
  enabled = true,
  refetchInterval,
}: UseTokenBalances) {
  const { network } = useNetwork()

  return useQuery({
    queryKey: ['balance', { currencies, account, network }],
    queryFn: async () => {
      if (!account) {
        throw new Error('Account is required')
      }

      const promises = currencies.map((currency) =>
        tokenBalanceQueryFn({ account, currency, network }),
      )

      const balances = await Promise.allSettled(promises)

      return balances
        .map((balance, i) => {
          if (isPromiseFulfilled(balance)) {
            return balance.value
          }

          return {
            currency: currencies[i],
            balance: 0,
          }
        })
        .reduce<Record<string, number>>((acc, cur) => {
          acc[cur.currency] = cur.balance
          return acc
        }, {})
    },
    refetchInterval: refetchInterval,
    enabled: Boolean(account && enabled),
  })
}
