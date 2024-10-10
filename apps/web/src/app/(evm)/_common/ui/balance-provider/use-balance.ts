import { useMemo } from 'react'
import type { ChainId } from 'sushi'
import { nativeAddress } from 'sushi/config'
import { Amount, Type } from 'sushi/currency'
import type { Address } from 'viem'
import { useBalances } from './use-balances'

type Args = [Type | undefined] | [ChainId | undefined, Address | undefined]
type Return = Omit<ReturnType<typeof useBalances>, 'data'> & {
  data: bigint | undefined
}

export function useBalance(currency: Type | undefined): Return
export function useBalance(
  chainId: ChainId | undefined,
  tokenAddress: Address | undefined,
): Return

export function useBalance(arg1: Args[0], arg2?: Args[1]) {
  const [chainId, tokenAddresses] = useMemo(() => {
    if (!arg1) {
      return [undefined, []]
    }

    if (typeof arg1 === 'number') {
      return [arg1, arg2 ? [arg2] : []]
    }

    let address: Address
    if (arg1.isNative) {
      address = nativeAddress
    } else {
      address = arg1.address
    }

    return [arg1.chainId, [address]]
  }, [arg1, arg2])

  const result = useBalances(chainId, tokenAddresses)

  const tokenAddress = tokenAddresses[0]

  return useMemo(() => {
    return {
      ...result,
      data: tokenAddress ? result.data?.get(tokenAddress) : undefined,
    }
  }, [tokenAddress, result])
}

export function useAmountBalance(currency: Type | undefined) {
  const result = useBalance(currency)

  return useMemo(() => {
    if (!currency || result.data === undefined) {
      return {
        ...result,
        data: undefined,
      }
    }

    const amount = Amount.fromRawAmount(currency, result.data)

    return {
      ...result,
      data: amount,
    }
  }, [currency, result])
}
