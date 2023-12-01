import { DataFetcher, LiquidityProviders, PoolCode } from '@sushiswap/router'
import {
  isRouteProcessor3ChainId,
  isRouteProcessor3_1ChainId,
  isRouteProcessor3_2ChainId,
} from 'sushi/config'

import { UsePoolsParams } from '../types'

const isTest =
  process.env['APP_ENV'] === 'test' ||
  process.env['NEXT_PUBLIC_APP_ENV'] === 'test'

export const getAllPoolsCodeMap = async ({
  currencyA,
  currencyB,
  chainId,
}: Omit<UsePoolsParams, 'enabled'>) => {
  if (!currencyA || !currencyB || !chainId) {
    return new Map<string, PoolCode>()
  }

  const sushiLiquidityProviders = [
    LiquidityProviders.SushiSwapV2,
    LiquidityProviders.Trident,
  ]
  if (
    isRouteProcessor3_2ChainId(chainId) ||
    isRouteProcessor3_1ChainId(chainId) ||
    isRouteProcessor3ChainId(chainId)
  ) {
    sushiLiquidityProviders.push(LiquidityProviders.SushiSwapV3)
  }

  const liquidityProviders = [
    ...sushiLiquidityProviders,
    LiquidityProviders.UniswapV2,
    LiquidityProviders.UniswapV3,
    LiquidityProviders.QuickSwap,
    LiquidityProviders.ApeSwap,
    LiquidityProviders.PancakeSwap,
    LiquidityProviders.TraderJoe,
    LiquidityProviders.Dfyn,
    LiquidityProviders.Elk,
    LiquidityProviders.JetSwap,
    LiquidityProviders.SpookySwap,
    LiquidityProviders.NetSwap,
    LiquidityProviders.HoneySwap,
    LiquidityProviders.UbeSwap,
    LiquidityProviders.Biswap,
    LiquidityProviders.DovishV3, // polygon zkevm
    LiquidityProviders.LaserSwap, // thundercore
  ]

  const testLiquidityProviders = [...sushiLiquidityProviders]

  const dataFetcher = DataFetcher.onChain(chainId, isTest)
  // console.log('dataFetcher startDataFetching')
  dataFetcher.startDataFetching(
    isTest ? testLiquidityProviders : liquidityProviders,
  )
  await dataFetcher.fetchPoolsForToken(currencyA, currencyB)
  // console.log('dataFetcher stopDataFetching')
  dataFetcher.stopDataFetching()
  return dataFetcher.getCurrentPoolCodeMap(currencyA, currencyB)
}
