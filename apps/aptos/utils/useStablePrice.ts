import { Aptos, USDC } from 'lib/coins'
import { useMemo } from 'react'
import usePairs from './usePairs'
import { Token } from './tokenType'
import getCurrencyPrice from './getCurrencyPrice'

export default function UseStablePrice(currency: Token) {
  const native = Aptos
  const defaultStable = USDC
  const stableTokens = [USDC]
  const [nativePairInfo, stableNativePairInfo] = usePairs(
    useMemo(
      () => [
        [
          currency && native.address === currency.address
            ? undefined
            : currency,
          native,
        ],
        [native, defaultStable],
      ],
      [native, defaultStable, currency],
    ),
  )
  const stablePairsInfo = usePairs(
    useMemo(
      () =>
        stableTokens.map((stableToken) => {
          return [
            stableToken && currency.address === stableToken.address
              ? undefined
              : currency,
            stableToken,
          ]
        }),
      [stableTokens, currency],
    ),
  )

  return useMemo(() => {
    return getCurrencyPrice(
      currency,
      defaultStable,
      native,
      stableTokens,
      nativePairInfo,
      stableNativePairInfo,
      stablePairsInfo,
    )
  }, [
    currency,
    defaultStable,
    nativePairInfo,
    stableNativePairInfo,
    stablePairsInfo,
    stableTokens,
    native,
  ])
}
