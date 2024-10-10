import { ITronInUSDTResponse } from '~tron/_common/types/pricing-types'

export const getTronPrice = async () => {
  try {
    const res = await fetch(`/tron/api/pricing`, { method: 'GET' })
    if (!res.ok) {
      throw new Error('Failed to fetch data from Tron API')
    }
    const data: ITronInUSDTResponse | undefined = await res.json()
    if (!data) return 0

    const cleanedQuotePrice = data?.data?.tron.dexTrades[0]?.quotePrice ?? 0
    return cleanedQuotePrice
  } catch (error) {
    console.log('getTronPrice Error: ', error)
    return 0
  }
}
