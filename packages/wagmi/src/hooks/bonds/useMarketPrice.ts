import { MarketId, getMarketPricesContracts } from '@sushiswap/bonds-sdk'
import { useReadContracts } from 'wagmi'

interface UseBondMarketPrices {
  marketIds: MarketId[] | undefined
  enabled?: boolean
}

export const useBondMarketPrices = ({
  marketIds: _marketIds,
  enabled,
}: UseBondMarketPrices) => {
  const marketIds = _marketIds || []

  return useReadContracts({
    allowFailure: false,
    contracts: getMarketPricesContracts({ marketIds: marketIds }),
    query: { enabled: Boolean(marketIds && enabled) },
  })
}
