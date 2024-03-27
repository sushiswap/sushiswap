import {
  REFERRER_ADDRESS,
  getBondDiscount,
  getMarketInfosContracts,
  getMarketPricesContracts,
  getMaxAmountsAcceptedContracts,
  getRemainingCapacitiesContracts,
} from '@sushiswap/bonds-sdk'
import { Bond } from '@sushiswap/client'
import { usePrices } from '@sushiswap/react-query'
import {
  getTotalSuppliesContracts,
  getVaultsReservesContracts,
} from '@sushiswap/steer-sdk'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { uniswapV2PairAbi } from 'sushi/abi'
import { Amount, Token } from 'sushi/currency'
import { Fraction } from 'sushi/math'
import { Address, getAddress } from 'viem'
import { useBlockNumber, useReadContracts } from 'wagmi'

interface UseBondMarketDetails {
  bond: Bond
  enabled?: boolean
}

function getTokenPrice(prices: Record<string, Fraction>, token: Address) {
  const tokenPriceFraction = prices[getAddress(token)]
  if (!tokenPriceFraction) return undefined
  return Number(tokenPriceFraction.toFixed(10))
}

function useQuoteTokenPriceUSD(bond: Bond, enabled = true) {
  const { data: prices } = usePrices({
    chainId: enabled ? bond.chainId : undefined,
  })

  const { data: poolData } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        abi: uniswapV2PairAbi,
        functionName: 'getReserves',
        chainId: bond.chainId,
        address: bond.quoteToken.address,
      },
      {
        abi: uniswapV2PairAbi,
        functionName: 'totalSupply',
        chainId: bond.chainId,
        address: bond.quoteToken.address,
      },
    ],
    query: {
      enabled: Boolean(enabled && bond.quoteToken.pool),
    },
  })

  const vaultContracts = useMemo(() => {
    return [
      getVaultsReservesContracts({ vaultIds: [bond.quoteToken.id] })[0],
      getTotalSuppliesContracts({ vaultIds: [bond.quoteToken.id] })[0],
    ] as const
  }, [bond.quoteToken.id])

  const { data: vaultData } = useReadContracts({
    allowFailure: false,
    contracts: vaultContracts,
    query: { enabled: Boolean(enabled && bond.quoteToken.vault) },
  })

  return useMemo(() => {
    if (!prices) {
      return undefined
    }

    if (bond.quoteToken.pool) {
      if (!poolData) {
        return undefined
      }

      const pool = bond.quoteToken.pool

      const token0PriceUSD = getTokenPrice(prices, pool.token0.address)
      const token1PriceUSD = getTokenPrice(prices, pool.token1.address)

      if (!token0PriceUSD || !token1PriceUSD) return undefined

      const [[reserve0, reserve1], totalSupply] = poolData

      const reserve0USD =
        (Number(reserve0) / 10 ** pool.token0.decimals) * token0PriceUSD
      const reserve1USD =
        (Number(reserve1) / 10 ** pool.token1.decimals) * token1PriceUSD

      const lpTokenPriceUSD =
        (reserve0USD + reserve1USD) /
        (Number(totalSupply) / 10 ** bond.quoteToken.decimals)

      return lpTokenPriceUSD
    }

    if (bond.quoteToken.vault) {
      if (!vaultData) {
        return undefined
      }

      const vault = bond.quoteToken.vault

      const token0PriceUSD = getTokenPrice(prices, vault.token0.address)
      const token1PriceUSD = getTokenPrice(prices, vault.token1.address)

      if (!token0PriceUSD || !token1PriceUSD) return undefined

      const [{ amountToken0: reserve0, amountToken1: reserve1 }, totalSupply] =
        vaultData

      const reserve0USD =
        (Number(reserve0) / 10 ** vault.token0.decimals) * token0PriceUSD
      const reserve1USD =
        (Number(reserve1) / 10 ** vault.token1.decimals) * token1PriceUSD

      const reserveUSD = reserve0USD + reserve1USD

      return reserveUSD / (Number(totalSupply) / 10 ** bond.quoteToken.decimals)
    }

    return getTokenPrice(prices, bond.quoteToken.address)
  }, [prices, bond, poolData, vaultData])
}

export const useBondMarketDetails = ({
  bond,
  enabled = true,
}: UseBondMarketDetails) => {
  const { data: prices } = usePrices({
    chainId: enabled ? bond.chainId : undefined,
  })

  const contracts = useMemo(() => {
    const marketPrice = getMarketPricesContracts({ marketIds: [bond.id] })[0]
    const remainingCapacity = getRemainingCapacitiesContracts({
      marketIds: [bond.id],
    })[0]
    const marketInfo = getMarketInfosContracts({ marketIds: [bond.id] })[0]
    const maxAmountAccepted = getMaxAmountsAcceptedContracts({
      marketIds: [bond.id],
      referrer: REFERRER_ADDRESS[bond.chainId],
    })[0]

    return [
      marketPrice,
      remainingCapacity,
      marketInfo,
      maxAmountAccepted,
    ] as const
  }, [bond.id, bond.chainId])

  const queryClient = useQueryClient()
  const { data, queryKey } = useReadContracts({
    allowFailure: false,
    contracts,
    query: {
      enabled: Boolean(enabled),
    },
  })

  const { data: blockNumber } = useBlockNumber({
    chainId: bond.chainId,
    watch: true,
  })

  useEffect(() => {
    if (blockNumber) {
      queryClient.invalidateQueries(queryKey, {}, { cancelRefetch: false })
    }
  }, [blockNumber, queryClient, queryKey])

  const [marketPrice, remainingCapacityBI, marketInfo, maxAmountAcceptedBI] =
    useMemo(() => data || [], [data])

  const quoteTokenPriceUSD = useQuoteTokenPriceUSD(bond, enabled)
  const payoutTokenPriceUSD = useMemo(() => {
    return Number(
      (prices?.[getAddress(bond.payoutToken.address)] || 0)?.toFixed(10),
    )
  }, [prices, bond])

  const discount = useMemo(() => {
    if (!marketPrice || !quoteTokenPriceUSD || !payoutTokenPriceUSD)
      return undefined

    return getBondDiscount({
      marketPrice: marketPrice,
      marketScale: BigInt(bond.marketScale),
      payoutToken: {
        decimals: bond.payoutToken.decimals,
        priceUSD: payoutTokenPriceUSD,
      },
      quoteToken: {
        decimals: bond.quoteToken.decimals,
        priceUSD: quoteTokenPriceUSD,
      },
    })
  }, [quoteTokenPriceUSD, payoutTokenPriceUSD, marketPrice, bond])

  const [availableCapacity, availableCapacityUSD] = useMemo(() => {
    if (!marketInfo) return []

    const amount = Amount.fromRawAmount(
      new Token(bond.payoutToken),
      marketInfo[5],
    )

    if (!payoutTokenPriceUSD) return [amount]

    const amountUSD = Number(amount.toSignificant(18)) * payoutTokenPriceUSD

    return [amount, amountUSD]
  }, [bond, marketInfo, payoutTokenPriceUSD])

  const [remainingCapacity, remainingCapacityUSD] = useMemo(() => {
    if (!remainingCapacityBI) return []

    const amount = Amount.fromRawAmount(
      new Token(bond.capacityInQuote ? bond.quoteToken : bond.payoutToken),
      remainingCapacityBI,
    )

    if (!quoteTokenPriceUSD || !payoutTokenPriceUSD) return [amount]

    const amountUSD =
      Number(amount.toSignificant(18)) *
      (bond.capacityInQuote ? quoteTokenPriceUSD : payoutTokenPriceUSD)

    return [amount, amountUSD]
  }, [bond, remainingCapacityBI, quoteTokenPriceUSD, payoutTokenPriceUSD])

  const maxAmountAccepted = useMemo(() => {
    if (!maxAmountAcceptedBI) return undefined

    // https://dev.bondprotocol.finance/developers/market-calculations#capacity-payout-and-allowances
    const mAAreduced = maxAmountAcceptedBI // - (maxAmountAcceptedBI / 1000n) * 5n

    return Amount.fromRawAmount(new Token(bond.quoteToken), mAAreduced)
  }, [bond, maxAmountAcceptedBI])

  return {
    ...discount,
    quoteTokenPriceUSD,
    payoutTokenPriceUSD,
    marketPrice,
    maxAmountAccepted,
    availableCapacity,
    availableCapacityUSD,
    remainingCapacity,
    remainingCapacityUSD,
  }
}
