import { FACTORY_CONTRACT } from '~tron/_common/constants/contracts'
import { IPoolDataResponse } from '~tron/_common/types/get-pools-type'

export const getAllPairAddresses = async () => {
  try {
    const res = await fetch(
      `/tron/api/pools?factoryAddress=${FACTORY_CONTRACT}`,
      {
        method: 'GET',
      },
    )
    if (!res.ok) {
      throw new Error('Failed to fetch data from Tron API')
    }
    const data: IPoolDataResponse | undefined = await res.json()

    const cleanedData = data?.data?.tron.smartContractEvents.map((event) => {
      const pairAddress =
        event.arguments.find((arg) => arg.argument === 'pair')?.value ?? ''
      const token0Address =
        event.arguments.find((arg) => arg.argument === 'token0')?.value ?? ''
      const token1Address =
        event.arguments.find((arg) => arg.argument === 'token1')?.value ?? ''

      return {
        token0Address,
        token1Address,
        pairAddress,
      }
    })
    if (!cleanedData) return []

    return cleanedData
  } catch (error) {
    console.log(error)
    return []
  }
}
