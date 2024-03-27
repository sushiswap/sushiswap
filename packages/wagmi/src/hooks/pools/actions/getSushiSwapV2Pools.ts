import { PublicWagmiConfig } from '@sushiswap/wagmi-config'
import { readContracts } from '@wagmi/core/actions'
import { uniswapV2PairAbi } from 'sushi/abi'
import {
  SUSHISWAP_V2_FACTORY_ADDRESS,
  SushiSwapV2ChainId,
  isSushiSwapV2ChainId,
} from 'sushi/config'
import { Amount, Currency, Token, Type } from 'sushi/currency'
import { SushiSwapV2Pool, computeSushiSwapV2PoolAddress } from 'sushi/pool'

export enum PairState {
  LOADING = 'Loading',
  NOT_EXISTS = 'Not Exists',
  EXISTS = 'Exists',
  INVALID = 'Invalid',
}

export const getSushiSwapV2Pools = async (
  chainId: SushiSwapV2ChainId | undefined,
  currencies: [Currency | undefined, Currency | undefined][],
  config: PublicWagmiConfig,
): Promise<[PairState, SushiSwapV2Pool | null][]> => {
  const filtered = currencies.filter(
    (currencies): currencies is [Type, Type] => {
      const [currencyA, currencyB] = currencies
      return Boolean(
        currencyA &&
          currencyB &&
          currencyA.chainId === currencyB.chainId &&
          !currencyA.wrapped.equals(currencyB.wrapped) &&
          isSushiSwapV2ChainId(currencyA.chainId),
      )
    },
  )

  const [tokensA, tokensB] = filtered.reduce<[Token[], Token[]]>(
    (acc, [currencyA, currencyB]) => {
      acc[0].push(currencyA.wrapped)
      acc[1].push(currencyB.wrapped)

      return acc
    },
    [[], []],
  )

  const contracts = filtered.map(([currencyA, currencyB]) => ({
    chainId,
    address: computeSushiSwapV2PoolAddress({
      factoryAddress:
        SUSHISWAP_V2_FACTORY_ADDRESS[currencyA.chainId as SushiSwapV2ChainId],
      tokenA: currencyA.wrapped,
      tokenB: currencyB.wrapped,
    }),
    abi: uniswapV2PairAbi,
    functionName: 'getReserves' as const,
  }))

  const data = await readContracts(config, {
    contracts: contracts,
  })

  if (contracts.length === 0) return [[PairState.INVALID, null]]
  if (!data) return contracts.map(() => [PairState.LOADING, null])

  return data.map(({ result }, i) => {
    const tokenA = tokensA[i]
    const tokenB = tokensB[i]
    if (!tokenA || !tokenB || tokenA.equals(tokenB))
      return [PairState.INVALID, null]
    if (!result) return [PairState.NOT_EXISTS, null]
    const [reserve0, reserve1] = result
    const [token0, token1] = tokenA.sortsBefore(tokenB)
      ? [tokenA, tokenB]
      : [tokenB, tokenA]
    return [
      PairState.EXISTS,
      new SushiSwapV2Pool(
        Amount.fromRawAmount(token0, reserve0.toString()),
        Amount.fromRawAmount(token1, reserve1.toString()),
      ),
    ]
  })
}
