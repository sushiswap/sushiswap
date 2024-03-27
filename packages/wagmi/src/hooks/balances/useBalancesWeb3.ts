import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { ChainId } from 'sushi/chain'
import { Amount, Native, Token, Type } from 'sushi/currency'
import { Address, erc20Abi, isAddress, zeroAddress } from 'viem'

import { getBalance, readContracts } from '@wagmi/core'
import { Config, serialize, useBalance, useConfig } from 'wagmi'
import { GetBalanceReturnType } from 'wagmi/actions'
import { useWatchByInterval } from '../watch'

interface QueryBalanceParams {
  chainId: ChainId | undefined
  currencies: (Type | undefined)[]
  account: Address | undefined
  nativeBalance?: GetBalanceReturnType
  config: Config
}

export const queryFnUseBalances = async ({
  chainId,
  currencies,
  account,
  nativeBalance,
  config,
}: QueryBalanceParams) => {
  if (!account || !chainId || !currencies) return null

  let native = nativeBalance
  if (typeof native === 'undefined') {
    native = await getBalance(config, {
      address: account,
      chainId,
    })
  }

  const [validatedTokens, validatedTokenAddresses] = currencies.reduce<
    [Token[], Address[]]
  >(
    (acc, currencies) => {
      if (chainId && currencies && isAddress(currencies.wrapped.address)) {
        acc[0].push(currencies.wrapped)
        acc[1].push(currencies.wrapped.address as Address)
      }

      return acc
    },
    [[], []],
  )

  const data = await readContracts(config, {
    contracts: validatedTokenAddresses.map(
      (token) =>
        ({
          chainId,
          address: token,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [account],
        }) as const,
    ),
  })

  const _data = data.reduce<Record<string, Amount<Type>>>((acc, _cur, i) => {
    const amount = data[i].result
    if (typeof amount === 'bigint') {
      acc[validatedTokens[i].address] = Amount.fromRawAmount(
        validatedTokens[i],
        amount,
      )
    }
    return acc
  }, {})

  _data[zeroAddress] = Amount.fromRawAmount(
    Native.onChain(chainId),
    native.value,
  )

  return _data
}

interface UseBalanceParams {
  chainId: ChainId | undefined
  currencies: (Type | undefined)[]
  account: Address | undefined
  enabled?: boolean
}

export const useBalancesWeb3 = ({
  chainId,
  currencies,
  account,
  enabled = true,
}: UseBalanceParams) => {
  const { data: nativeBalance, queryKey } = useBalance({
    chainId,
    address: account,
    query: { enabled },
  })

  const config = useConfig()

  useWatchByInterval({ key: queryKey, interval: 10000 })

  useEffect(() => {
    if (currencies && currencies.length > 100) {
      throw new Error(
        'useBalancesWeb3: currencies length > 100, this will hurt performance and cause rate limits',
      )
    }
  }, [currencies])

  return useQuery({
    queryKey: [
      'useBalancesWeb3',
      { chainId, currencies, account, nativeBalance: serialize(nativeBalance) },
    ],
    queryFn: () =>
      queryFnUseBalances({
        chainId,
        currencies,
        account,
        nativeBalance,
        config,
      }),
    refetchInterval: 10000,
    enabled: Boolean(chainId && account && enabled && currencies),
  })
}
