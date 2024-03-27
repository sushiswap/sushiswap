import { PublicWagmiConfig } from '@sushiswap/wagmi-config'
import { balanceOfAbi } from 'sushi/abi'
import { BENTOBOX_ADDRESS, BentoBoxChainId } from 'sushi/config'
import { Token } from 'sushi/currency'
import { convertTokenToBento } from 'sushi/tines'
import { BridgeBento, RToken, Rebase } from 'sushi/tines'
import { readContracts } from 'wagmi/actions'

export enum BridgeBentoState {
  LOADING = 'Loading',
  NOT_EXISTS = 'Not exists',
  EXISTS = 'Exists',
  INVALID = 'Invalid',
}

export const getBridgeBentoPools = async (
  chainId: BentoBoxChainId,
  currencies: Token[],
  totals: Map<string, Rebase>,
  config: PublicWagmiConfig,
) => {
  const balances = await readContracts(config, {
    contracts: currencies.map(
      (currency) =>
        ({
          address: currency.wrapped.address,
          chainId,
          abi: balanceOfAbi,
          functionName: 'balanceOf',
          args: [BENTOBOX_ADDRESS[chainId]],
        }) as const,
    ),
  })

  return currencies.map((el, i) => {
    const total = totals.get(el.address)
    const balance = balances?.[i].result
    if (!total || !balance) {
      return [BridgeBentoState.LOADING, null]
    }

    const { base, elastic } = total

    return [
      BridgeBentoState.EXISTS,
      new BridgeBento(
        BENTOBOX_ADDRESS[chainId],
        el as RToken,
        convertTokenToBento(el),
        elastic,
        base,
        balance,
      ),
    ]
  })
}
