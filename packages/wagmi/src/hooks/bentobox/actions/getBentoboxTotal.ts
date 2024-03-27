import { BentoBoxChainId } from 'sushi/config'
import { Type } from 'sushi/currency'

import { PublicWagmiConfig } from '@sushiswap/wagmi-config'
import { getBentoboxTotals } from './getBentoboxTotals'

export const getBentoboxTotal = async ({
  chainId,
  currency,
  config,
}: { chainId: BentoBoxChainId; currency: Type; config: PublicWagmiConfig }) => {
  if (!chainId) return undefined

  const totals = await getBentoboxTotals(chainId, [currency], config)

  if (!totals || !currency) {
    return undefined
  }

  return totals[currency.wrapped.address]
}
