'use client'

import { ArrowTrendingUpIcon } from '@heroicons/react/20/solid'
import { Button, typographyVariants } from '@sushiswap/ui'
import { SkeletonText } from '@sushiswap/ui'
import React, { useMemo, useState } from 'react'
import { useTokenAmountDollarValues } from 'src/lib/hooks'
import { Amount, Price, Token, tryParseAmount } from 'sushi/currency'
import { formatUSD } from 'sushi/format'

import { usePrices } from 'src/app/(evm)/_common/ui/price-provider/price-provider/use-prices'
import { useDerivedStateCrossChainSwap } from './derivedstate-cross-chain-swap-provider'

export const CrossChainSwapHeader = () => {
  const [invert, setInvert] = useState(false)
  const {
    state: { chainId0, chainId1, token0, token1 },
    isLoading,
  } = useDerivedStateCrossChainSwap()

  const amounts = useMemo(() => {
    return [[tryParseAmount('1', token0)], [tryParseAmount('1', token1)]]
  }, [token0, token1])

  const [token0FiatPrice] = useTokenAmountDollarValues({
    chainId: chainId0,
    amounts: amounts[0],
  })
  const [token1FiatPrice] = useTokenAmountDollarValues({
    chainId: chainId1,
    amounts: amounts[1],
  })

  const { data: prices0 } = usePrices({ chainId: chainId0 })
  const { data: prices1 } = usePrices({ chainId: chainId1 })

  const price = useMemo(() => {
    if (!token0 || !token1) return '0.00'

    // To make sure both tokens have same chainId when creating the price entity
    const dummy0 = new Token({
      address: token0.wrapped.address,
      chainId: 1,
      decimals: token0.decimals,
    })
    const dummy1 = new Token({
      address: token1.wrapped.address,
      chainId: 1,
      decimals: token1.decimals,
    })

    const _token0Price = prices0?.getFraction(token0.wrapped.address)
    const token0Price = _token0Price
      ? tryParseAmount('1', token0)?.multiply(_token0Price)
      : undefined

    const _token1Price = prices1?.getFraction(token1.wrapped.address)
    const token1Price = _token1Price
      ? tryParseAmount('1', token1)?.multiply(_token1Price)
      : undefined

    let price
    if (token0Price && token1Price) {
      price = new Price({
        baseAmount: Amount.fromRawAmount(
          dummy0,
          token0Price.quotient.toString(),
        ),
        quoteAmount: Amount.fromRawAmount(
          dummy1,
          token1Price.quotient.toString(),
        ),
      })
    }

    return price
      ? invert
        ? price.invert().toSignificant(4)
        : price.toSignificant(4)
      : '0.00'
  }, [invert, prices0, prices1, token0, token1])

  return (
    <div className="flex flex-col items-start gap-2 mb-4 sm:mt-10 mt-2">
      <h1 className={typographyVariants({ variant: 'h1' })}>Trade</h1>
      {isLoading || !token0 || !token1 ? (
        <SkeletonText fontSize="sm" className="w-2/4" />
      ) : (
        <Button
          variant="link"
          size="sm"
          onClick={() => setInvert((invert) => !invert)}
        >
          <ArrowTrendingUpIcon width={16} height={16} />
          <span className="flex items-baseline gap-1 whitespace-nowrap scroll hide-scrollbar">
            1 {invert ? token0.symbol : token1.symbol}{' '}
            <span className="font-normal">
              ({formatUSD(invert ? token0FiatPrice : token1FiatPrice)})
            </span>{' '}
            = {price} {invert ? token1.symbol : token0.symbol}{' '}
            <span className="font-normal">
              ({formatUSD(invert ? token1FiatPrice : token0FiatPrice)})
            </span>
          </span>
        </Button>
      )}
    </div>
  )
}
