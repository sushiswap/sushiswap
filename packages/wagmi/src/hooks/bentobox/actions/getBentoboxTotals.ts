import { PublicWagmiConfig } from '@sushiswap/wagmi-config'
import { readContracts } from '@wagmi/core'
import { bentoBoxV1TotalsAbi } from 'sushi/abi'
import { BENTOBOX_ADDRESS, BentoBoxChainId } from 'sushi/config'
import { Type as Currency } from 'sushi/currency'
import { Rebase } from 'sushi/tines'
import { Address } from 'viem'

const totalsMap = new Map<string, Rebase>()

export const getBentoboxTotalsMap = async (
  chainId: BentoBoxChainId,
  currencies: (Currency | undefined)[],
  config: PublicWagmiConfig,
) => {
  const addresses = currencies
    .filter((currency): currency is Currency => Boolean(currency?.wrapped))
    .map((token) => token.wrapped.address)

  const contracts = addresses.map(
    (address) =>
      ({
        chainId,
        address: BENTOBOX_ADDRESS[chainId] as Address,
        abi: bentoBoxV1TotalsAbi,
        functionName: 'totals',
        args: [address as Address],
      }) as const,
  )

  try {
    const totals = await readContracts(config, {
      allowFailure: false,
      contracts,
    })

    totals.forEach((total, i) =>
      totalsMap.set(addresses[i], { base: total[0], elastic: total[1] }),
    )

    return totalsMap
  } catch {
    return null
  }
}

export const getBentoboxTotals = async (
  chainId: BentoBoxChainId,
  currencies: (Currency | undefined)[],
  config: PublicWagmiConfig,
) => {
  const addresses = currencies
    .filter((currency): currency is Currency => Boolean(currency?.wrapped))
    .map((token) => token.wrapped.address)

  const contracts = addresses.map(
    (address) =>
      ({
        chainId,
        address: BENTOBOX_ADDRESS[chainId] as Address,
        abi: bentoBoxV1TotalsAbi,
        functionName: 'totals',
        args: [address as Address],
      }) as const,
  )

  try {
    return readContracts(config, {
      allowFailure: false,
      contracts,
    }).then((results) =>
      addresses.reduce(
        (previousValue, currentValue, i) => {
          previousValue[currentValue as Address] = {
            elastic: results[i][0],
            base: results[i][1],
          }
          return previousValue
        },
        {} as Record<Address, Rebase>,
      ),
    )
  } catch {
    return null
  }
}
