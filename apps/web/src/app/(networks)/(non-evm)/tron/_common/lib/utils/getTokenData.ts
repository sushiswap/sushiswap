import { ITokenDataResponse } from '~tron/_common/types/token-type'

export const getTokenData = async ({
  contractAddress,
}: { contractAddress: string }) => {
  try {
    const res = await fetch(
      `/tron/api/token-info?contractAddress=${contractAddress}`,
      { method: 'GET' },
    )
    if (!res.ok) {
      throw new Error('Failed to fetch data from Tron API')
    }
    const data: ITokenDataResponse | undefined = await res.json()

    const cleanedData = {
      decimals:
        data?.data?.tron.address[0].smartContract.currency.decimals ?? 0,
      name: data?.data?.tron.address[0].smartContract.currency.name ?? 'N/A',
      symbol:
        data?.data?.tron.address[0].smartContract.currency.symbol ?? 'N/A',
    }
    return cleanedData
  } catch (error) {
    console.log(error)
    return undefined
  }
}
