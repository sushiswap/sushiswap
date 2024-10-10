import { useMemo } from 'react'
import { Aptos, STABLECOINS } from '~aptos/_common/config/coins'
import type { Token } from '~aptos/_common/lib/types/token'
import { usePoolsByTokens } from '~aptos/pool/lib/use-pools-by-tokens'
import { getCurrencyPrice } from './get-currency-price'
import { useNetwork } from './use-network'

interface UseStablePrice {
  currency: Token | undefined
  ledgerVersion?: number
}

export function useStablePrice({ currency, ledgerVersion }: UseStablePrice) {
  const { network, default_stable } = useNetwork()

  const native = useMemo(() => Aptos[network], [network])
  const stableTokens = useMemo(() => STABLECOINS[network], [network])

  const {
    data: [nativePairInfo, stableNativePairInfo],
  } = usePoolsByTokens({
    tokens: useMemo(
      () => [
        [
          currency && native.address === currency.address
            ? undefined
            : currency,
          native,
        ],
        [native, default_stable],
      ],
      [native, default_stable, currency],
    ),
    ledgerVersion,
  })

  const { data: stablePairsInfo } = usePoolsByTokens({
    tokens: useMemo(
      () =>
        stableTokens.map((stableToken) => {
          return [
            stableToken && currency?.address === stableToken.address
              ? undefined
              : currency,
            stableToken,
          ]
        }),
      [stableTokens, currency],
    ),
    ledgerVersion,
  })

  return useMemo(() => {
    if (!currency) return undefined

    return getCurrencyPrice(
      currency,
      default_stable,
      native,
      stableTokens,
      nativePairInfo,
      stableNativePairInfo,
      stablePairsInfo,
    )
  }, [
    currency,
    default_stable,
    nativePairInfo,
    stableNativePairInfo,
    stablePairsInfo,
    stableTokens,
    native,
  ])
}
