import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { STABLE_TOKENS, WTRX } from '~tron/_common/constants/token-list'
import { getAllPairAddresses } from '~tron/_common/lib/utils/getAllPairAddresses'
import { getTronPrice } from '~tron/_common/lib/utils/getTronPrice'
import {
  getToken0Price,
  getToken1Price,
  getValidTokenAddress,
} from '~tron/_common/lib/utils/helpers'
import { IReserveDataResponse } from '~tron/_common/types/get-pools-type'
import { IToken } from '~tron/_common/types/token-type'

type Pair = {
  token0Address: string
  token1Address: string
  pairAddress: string
}[]

//USDT
const BEST_STABLE = STABLE_TOKENS.find((token) => token.symbol === 'USDT')

const getBestStable = (stablePairs: Pair) => {
  const bestStable = stablePairs.find(
    (pair) =>
      pair.token0Address === BEST_STABLE?.address ||
      pair.token1Address === BEST_STABLE?.address,
  )
  if (bestStable) {
    return bestStable
  } else {
    return stablePairs[0]
  }
}

const getTokenPrice = async (token: IToken | undefined) => {
  //if token is undefined return 0
  if (!token) return '0'

  //if token in STABLE_TOKENS return 1
  if (
    STABLE_TOKENS.find(
      (stableToken) =>
        getValidTokenAddress(stableToken.address).toLowerCase() ===
        getValidTokenAddress(token.address).toLowerCase(),
    )
  ) {
    return '1'
  }
  //if native coin or WTRX, return native usd price
  const isNativeOrWrappedTrx =
    getValidTokenAddress(token.address).toLowerCase() ===
    WTRX.address.toLowerCase()

  if (isNativeOrWrappedTrx) {
    const tronInUSDT = await getTronPrice()
    return tronInUSDT.toString()
  }

  const { stablePairs, wtrxPairs } = await getPairsIfItExists(token)

  //if pairs dont exist, return 0
  if (!stablePairs && !wtrxPairs) {
    return '0'
  }

  if (stablePairs?.length > 0) {
    const pair = getBestStable(stablePairs)
    const { reserve0, reserve1 } = await getReserves(pair.pairAddress)
    if (token.address === pair.token0Address) {
      const token1Data = STABLE_TOKENS.find(
        (stableToken) =>
          getValidTokenAddress(stableToken.address).toLowerCase() ===
          getValidTokenAddress(pair.token1Address).toLowerCase(),
      )
      if (!token1Data) return '0'

      return getToken0Price(
        reserve0,
        reserve1,
        token.decimals,
        token1Data?.decimals,
      )
    } else if (token.address === pair.token1Address) {
      const token0Data = STABLE_TOKENS.find(
        (stableToken) =>
          getValidTokenAddress(stableToken.address).toLowerCase() ===
          getValidTokenAddress(pair.token0Address).toLowerCase(),
      )
      if (!token0Data) return '0'

      return getToken1Price(
        reserve0,
        reserve1,
        token0Data?.decimals,
        token.decimals,
      )
    }
  }

  // if token0Address or token1Address is WRTX in pair, then use getTronPrice to calculate the price of the other token
  if (wtrxPairs?.length > 0) {
    const pair = wtrxPairs[0]
    const { reserve0, reserve1 } = await getReserves(pair.pairAddress)
    const tronInUSDT = await getTronPrice()
    if (
      getValidTokenAddress(pair.token0Address).toLowerCase() ===
      WTRX.address.toLowerCase()
    ) {
      // token0 is WRTX, so token1 is the other token
      const decimals0 = WTRX.decimals
      const decimals1 = token.decimals
      return (
        Number(getToken1Price(reserve0, reserve1, decimals0, decimals1)) *
        tronInUSDT
      ).toString(10)
    } else if (
      getValidTokenAddress(pair.token1Address).toLowerCase() ===
      WTRX.address.toLowerCase()
    ) {
      // token1 is WRTX, so token0 is the other token
      const decimals0 = token.decimals
      const decimals1 = WTRX.decimals
      return (
        Number(getToken0Price(reserve0, reserve1, decimals0, decimals1)) *
        tronInUSDT
      ).toString(10)
    }
  }

  //if exotic pair, a usd price is not available
  return '0'
}

const getPairsIfItExists = async (token: IToken) => {
  try {
    const allPairs = await getAllPairAddresses()
    if (!allPairs) {
      return {
        stablePairs: undefined,
        wtrxPairs: undefined,
      }
    }
    //find all stable and WRTX pairs that include the token
    const stablePairsThatIncludeToken = allPairs.filter(
      (pair) =>
        STABLE_TOKENS.find(
          (stableToken) =>
            getValidTokenAddress(stableToken.address).toLowerCase() ===
              getValidTokenAddress(pair.token0Address).toLowerCase() ||
            getValidTokenAddress(stableToken.address).toLowerCase() ===
              getValidTokenAddress(pair.token1Address).toLowerCase(),
        ) &&
        (getValidTokenAddress(pair.token0Address).toLowerCase() ===
          token.address.toLowerCase() ||
          getValidTokenAddress(pair.token1Address).toLowerCase() ===
            token.address.toLowerCase()),
    )
    const wtrxPairsThatIncludeToken = allPairs.filter(
      (pair) =>
        (getValidTokenAddress(pair.token0Address).toLowerCase() ===
          WTRX.address.toLowerCase() ||
          getValidTokenAddress(pair.token1Address).toLowerCase() ===
            WTRX.address.toLowerCase()) &&
        (getValidTokenAddress(pair.token0Address).toLowerCase() ===
          token.address.toLowerCase() ||
          getValidTokenAddress(pair.token1Address).toLowerCase() ===
            token.address.toLowerCase()),
    )
    return {
      stablePairs: stablePairsThatIncludeToken,
      wtrxPairs: wtrxPairsThatIncludeToken,
    }
  } catch (error) {
    console.log('getPairIfItExists Error: ', error)
    return {
      stablePairs: undefined,
      wtrxPairs: undefined,
    }
  }
}

const getReserves = async (pairAddress: string) => {
  try {
    const res = await fetch(
      `/tron/api/pools/get-reserves?pairAddresses=${[pairAddress]}`,
      { method: 'GET' },
    )
    if (!res.ok) {
      throw new Error('Failed to fetch data from Tron API')
    }
    const data: IReserveDataResponse | undefined = await res.json()
    if (!data) {
      return {
        reserve0: '0',
        reserve1: '0',
      }
    }
    return {
      reserve0:
        data?.data?.tron.smartContractEvents[0].arguments.find(
          (arg) => arg.argument === 'reserve0',
        )?.value ?? '',
      reserve1:
        data?.data?.tron.smartContractEvents[0].arguments.find(
          (arg) => arg.argument === 'reserve1',
        )?.value ?? '',
    }
  } catch (error) {
    console.log('getReserves Error: ', error)
    return {
      reserve0: '0',
      reserve1: '0',
    }
  }
}

export const useStablePrice = ({ token }: { token: IToken | undefined }) => {
  return useQuery({
    queryKey: ['useStablePrice', { token: token?.address }],
    queryFn: async () => {
      const tokenPrice = await getTokenPrice(token)

      return tokenPrice
    },
    placeholderData: keepPreviousData,
    enabled: !!token,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
