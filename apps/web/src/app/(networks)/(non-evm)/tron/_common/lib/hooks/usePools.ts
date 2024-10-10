import { keepPreviousData, useQuery } from '@tanstack/react-query'
import ms from 'ms'
import { FACTORY_CONTRACT } from '~tron/_common/constants/contracts'
import { chunk } from '~tron/_common/lib/utils/helpers'
import {
  IPoolDataResponse,
  IReserveDataResponse,
} from '~tron/_common/types/get-pools-type'
import { useTronWeb } from './useTronWeb'

type _IPools = {
  token0Address: string
  token1Address: string
  pairAddress: string
  reserve0: string
  reserve1: string
}[]

const getPoolsByEvent = async ({
  factoryAddress,
}: { factoryAddress: string }): Promise<_IPools> => {
  try {
    const res = await fetch(
      `/tron/api/pools?factoryAddress=${factoryAddress}`,
      {
        method: 'GET',
      },
    )
    if (!res.ok) {
      throw new Error('Failed to fetch data from Tron API')
    }
    const data: IPoolDataResponse | undefined = await res.json()
    if (!data) return []

    const cleanedData = data?.data?.tron.smartContractEvents.map((event) => {
      const pairAddress =
        event.arguments.find((arg) => arg.argument === 'pair')?.value ?? ''
      const token0Address =
        event.arguments.find((arg) => arg.argument === 'token0')?.value ?? ''
      const token1Address =
        event.arguments.find((arg) => arg.argument === 'token1')?.value ?? ''

      return {
        pairAddress,
        token0Address,
        token1Address,
        reserve0: '0',
        reserve1: '0',
      }
    })

    return cleanedData
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
        { method: 'GET' },
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
            event.smartContract.address.address.toLowerCase() ===
            pool.pairAddress.toLowerCase(),
        )

        if (reserveData) {
          const reserve0 =
            reserveData.arguments.find((arg) => arg.argument === 'reserve0')
              ?.value ?? '0'
          const reserve1 =
            reserveData.arguments.find((arg) => arg.argument === 'reserve1')
              ?.value ?? '0'

          // Find the corresponding pool in the original array and update its reserve0 and reserve1 properties
          const originalPool = poolsCopy.find(
            (p) => p.pairAddress === pool.pairAddress,
          )
          if (originalPool) {
            originalPool.reserve0 = reserve0
            originalPool.reserve1 = reserve1
          }
        }
      }
    }

    return poolsCopy
  } catch (error) {
    console.log(error)
    return pools
  }
}
export const usePools = () => {
  const { tronWeb } = useTronWeb()
  return useQuery({
    queryKey: ['usePools'],
    queryFn: async () => {
      if (!tronWeb) return []
      const pools = await getPoolsByEvent({ factoryAddress: FACTORY_CONTRACT })
      const _pools = await injectReserves(pools)

      return _pools
    },
    placeholderData: keepPreviousData,
    enabled: !!tronWeb,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: ms('15 minutes'),
  })
}

// const multicallAddress = "TGXuuKAb4bnrn137u39EKbYzKNXvdCes98";
// tronWeb.setAddress(multicallAddress);
// const multicall = await tronWeb.contract(TRON_MULTICALL_ABI, multicallAddress);

// //loop through all the pools and get the reserves in chunks so the tron vm doesn't timeout
// //TODO: find way to optimize this so the user isnt waiting so long

// const chunkSize = 20;
// const chunkedPools = chunk(_pools, chunkSize);

// let chunkIndex = 0;

// while (chunkIndex < chunkedPools.length) {
// 	try {
// 		const pools = chunkedPools[chunkIndex];
// 		const calls = pools.map((pool) => {
// 			return [
// 				pool.pairAddress,
// 				"0x0902f1ac", //getReserves encoded
// 			];
// 		});

// 		const _multicallReturn = await multicall.aggregate(calls).call();
// 		const { returnData } = _multicallReturn;

// 		for (let i = 0; i < returnData.length; i++) {
// 			const decoded = ethers.utils.defaultAbiCoder.decode(
// 				["uint112", "uint112", "uint32"],
// 				returnData[i]
// 			);
// 			const _reserve0 = decoded[0].toString();
// 			const _reserve1 = decoded[1].toString();

// 			//add the reserves to the pool object with the pair address as the key
// 			const pool = _pools.find(
// 				(pool) => getBase58Address(pool.pairAddress) === getBase58Address(calls[i][0])
// 			);
// 			if (pool) {
// 				pool.reserve0 = _reserve0;
// 				pool.reserve1 = _reserve1;
// 			}
// 		}

// 		chunkIndex++; // Move to the next chunk only if the current chunk was processed successfully
// 	} catch (error) {
// 		console.error(`Error processing chunk ${chunkIndex}: ${error}`);
// 		// If a CPU timeout error occurred, the while loop will retry processing the current chunk
// 	}
// }
