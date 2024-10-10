import { useQuery } from '@tanstack/react-query'
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import { DEFAULT_TOKEN_LIST, TRON } from '~tron/_common/constants/token-list'
import { sortTokenAddresses } from '~tron/_common/lib/utils/formatters'
import { getAllPairAddresses } from '~tron/_common/lib/utils/getAllPairAddresses'
import {
  chunk,
  flatten,
  getValidTokenAddress,
  isAddress,
} from '~tron/_common/lib/utils/helpers'
import { IReserveDataResponse } from '~tron/_common/types/get-pools-type'
import { IToken } from '~tron/_common/types/token-type'

type IPairDataResponse = {
  data: {
    tron: {
      transfers: {
        currency: {
          address: string
          decimals: number
          name: string
          symbol: string
        }
        txHash: string
        receiver: {
          address: string
        }
      }[]
    }
  }
}

type _IPools = {
  token0: IToken
  token1: IToken
  pairAddress: string
  reserve0: string
  reserve1: string
}[]

const getPairContributions = async ({
  pairAddresses,
  walletAddress,
}: {
  pairAddresses: string[]
  walletAddress: string
}) => {
  try {
    const res = await fetch(
      `/tron/api/pools/my-positions?pairAddresses=${pairAddresses}&walletAddress=${walletAddress}`,
      { method: 'GET' },
    )
    if (!res.ok) {
      throw new Error('Failed to fetch data from my-positions API')
    }
    const data: IPairDataResponse | undefined = await res.json()

    if (!data?.data?.tron.transfers) return []
    const groupedData = data?.data?.tron.transfers.reduce(
      (acc, curr) => {
        if (!acc[curr.txHash]) {
          acc[curr.txHash] = []
        }

        acc[curr.txHash].push({
          currency: curr.currency,
          receiver: curr.receiver.address,
        })
        return acc
      },
      {} as Record<
        string,
        {
          currency: {
            address: string
            decimals: number
            name: string
            symbol: string
          }
          receiver: string
        }[]
      >,
    )
    if (!groupedData) return []

    const groupedDataArray = Object.entries(groupedData).map(([_, data]) => {
      const [token0, token1] = sortTokenAddresses(
        data?.[0]?.currency?.address ?? getValidTokenAddress(TRON.address),
        data?.[1]?.currency?.address ?? getValidTokenAddress(TRON.address),
      )
      const pairAddress = data?.[0]?.receiver as string

      //if token0 or token1 is equal to pairAddress, skip this pair
      if (token0 === pairAddress || token1 === pairAddress) {
        return
      }

      const _token0: IToken = {
        address: token0,
        decimals:
          data.find((i) => i?.currency?.address === token0)?.currency
            ?.decimals ?? TRON.decimals,
        name:
          data.find((i) => i.currency.address === token0)?.currency.name ??
          TRON.name,
        symbol:
          data.find((i) => i.currency.address === token0)?.currency.symbol ??
          TRON.symbol,
        logoURI:
          DEFAULT_TOKEN_LIST.find(
            (i) =>
              getValidTokenAddress(i.address) === getValidTokenAddress(token0),
          )?.logoURI ?? undefined,
      }
      const _token1: IToken = {
        address: token1,
        decimals:
          data.find((i) => i.currency.address === token1)?.currency.decimals ??
          TRON.decimals,
        name:
          data.find((i) => i.currency.address === token1)?.currency.name ??
          TRON.name,
        symbol:
          data.find((i) => i.currency.address === token1)?.currency.symbol ??
          TRON.symbol,
        logoURI:
          DEFAULT_TOKEN_LIST.find(
            (i) =>
              getValidTokenAddress(i.address) === getValidTokenAddress(token1),
          )?.logoURI ?? undefined,
      }
      return {
        token0: _token0,
        token1: _token1,
        pairAddress: pairAddress,
        reserve0: '0',
        reserve1: '0',
      }
    })
    // //filter out all objects that have duplicate pair addresses or are undefined
    const filteredDataArray = groupedDataArray.filter(
      (v, i, a) =>
        v && a.findIndex((t) => t?.pairAddress === v.pairAddress) === i,
    )

    return filteredDataArray
  } catch (error) {
    console.log(error)
    return []
  }
}

const injectReserves = async (pools: _IPools) => {
  try {
    const chunkedPools = chunk(pools, 100)
    const poolsCopy = [...pools]

    for (const chunk of chunkedPools) {
      const pairAddresses = chunk.map((pool) => pool.pairAddress)
      const res = await fetch(
        `/tron/api/pools/get-reserves?pairAddresses=${pairAddresses}`,
        {
          method: 'GET',
        },
      )
      if (!res.ok) {
        throw new Error('Failed to fetch data from Tron API')
      }
      const data: IReserveDataResponse | undefined = await res.json()
      if (!data) return []
      // find the reserves in the data and inject them into the pool object by pairAddress

      for (const pool of chunk) {
        const reserveData = data?.data?.tron.smartContractEvents.find(
          (event) =>
            event?.smartContract?.address?.address?.toLowerCase() ===
            pool?.pairAddress?.toLowerCase(),
        )

        if (reserveData) {
          const reserve0 =
            reserveData.arguments.find((arg) => arg.argument === 'reserve0')
              ?.value ?? '0'
          const reserve1 =
            reserveData.arguments.find((arg) => arg.argument === 'reserve1')
              ?.value ?? '0'

          const _pool = poolsCopy.find(
            (p) => p.pairAddress === pool.pairAddress,
          )
          if (_pool) {
            _pool.reserve0 = reserve0
            _pool.reserve1 = reserve1
          }
        }
      }
    }
    return poolsCopy
  } catch (error) {
    console.log(error)
    return []
  }
}

export const useMyPositions = () => {
  const { address } = useWallet()
  return useQuery({
    queryKey: ['useMyPositions', { address: address }],
    queryFn: async () => {
      if (!address) return []
      if (!isAddress(address)) return []
      const allPairs = await getAllPairAddresses()
      //split allPairs into chunks of 100
      const chunkedPairs = chunk(allPairs, 100)
      //get pair contributions for each chunk
      const _result = []
      for (const chunk of chunkedPairs) {
        const _data = await getPairContributions({
          pairAddresses: chunk.map((pair) => pair.pairAddress),
          walletAddress: address,
        })
        _result.push(_data)
      }
      const pools = flatten(_result)
      if (!pools || pools?.length === 0) {
        return []
      }
      console.log({ pools })
      const poolsWithReserves = await injectReserves(pools as _IPools)

      return poolsWithReserves
    },

    enabled: !!address,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
