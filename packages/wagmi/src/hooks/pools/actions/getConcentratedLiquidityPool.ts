import { SushiSwapV3ChainId, SushiSwapV3FeeAmount } from 'sushi/config'
import { Token, Type } from 'sushi/currency'
import { SushiSwapV3Pool, computeSushiSwapV3PoolAddress } from 'sushi/pool'

import { PublicWagmiConfig } from '@sushiswap/wagmi-config'
import { readContracts } from '@wagmi/core/actions'
import { Address } from 'viem'
import { getV3FactoryContractConfig } from '../../contracts/useV3FactoryContract'

export const getConcentratedLiquidityPools = async ({
  chainId,
  poolKeys,
  config,
}: {
  chainId: SushiSwapV3ChainId
  poolKeys: [
    Type | undefined,
    Type | undefined,
    SushiSwapV3FeeAmount | undefined,
  ][]
  config: PublicWagmiConfig
}): Promise<(SushiSwapV3Pool | null)[]> => {
  let poolTokens: ([Token, Token, SushiSwapV3FeeAmount] | undefined)[]
  if (!chainId) {
    poolTokens = new Array(poolKeys.length)
  } else {
    poolTokens = poolKeys.map(([currencyA, currencyB, feeAmount]) => {
      if (currencyA && currencyB && feeAmount) {
        const tokenA = currencyA.wrapped
        const tokenB = currencyB.wrapped
        if (tokenA.equals(tokenB)) return undefined

        return tokenA.sortsBefore(tokenB)
          ? [tokenA, tokenB, feeAmount]
          : [tokenB, tokenA, feeAmount]
      }
      return undefined
    })
  }

  const poolAddresses = poolTokens.map(
    (value) =>
      value &&
      computeSushiSwapV3PoolAddress({
        factoryAddress: getV3FactoryContractConfig(chainId).address,
        tokenA: value[0],
        tokenB: value[1],
        fee: value[2],
      }),
  )

  const slot0s = await readContracts(config, {
    contracts: poolAddresses.map(
      (el) =>
        ({
          chainId,
          address: el as Address,
          abi: [
            {
              inputs: [],
              name: 'slot0',
              outputs: [
                {
                  internalType: 'uint160',
                  name: 'sqrtPriceX96',
                  type: 'uint160',
                },
                { internalType: 'int24', name: 'tick', type: 'int24' },
                {
                  internalType: 'uint16',
                  name: 'observationIndex',
                  type: 'uint16',
                },
                {
                  internalType: 'uint16',
                  name: 'observationCardinality',
                  type: 'uint16',
                },
                {
                  internalType: 'uint16',
                  name: 'observationCardinalityNext',
                  type: 'uint16',
                },
                { internalType: 'uint8', name: 'feeProtocol', type: 'uint8' },
                { internalType: 'bool', name: 'unlocked', type: 'bool' },
              ],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          functionName: 'slot0',
        }) as const,
    ),
  })

  const liquidities = await readContracts(config, {
    contracts: poolAddresses.map(
      (el) =>
        ({
          chainId,
          address: el as Address,
          abi: [
            {
              inputs: [],
              name: 'liquidity',
              outputs: [{ internalType: 'uint128', name: '', type: 'uint128' }],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          functionName: 'liquidity',
        }) as const,
    ),
  })

  return poolKeys.map((_key, index) => {
    const tokens = poolTokens[index]
    if (!tokens) return null
    const [token0, token1, fee] = tokens

    if (!slot0s[index]) return null
    const slot0 = slot0s[index].result

    if (!liquidities[index]) return null
    const liquidity = liquidities[index].result

    if (!tokens || !slot0 || typeof liquidity === 'undefined') return null

    const sqrtPriceX96 = slot0[0]
    if (!sqrtPriceX96 || sqrtPriceX96 === 0n) return null

    const tick = slot0[1]
    if (typeof tick === 'undefined') return null

    return new SushiSwapV3Pool(
      token0,
      token1,
      fee,
      sqrtPriceX96,
      liquidity,
      tick,
    )
  })
}

export const getConcentratedLiquidityPool = async ({
  chainId,
  token0,
  token1,
  feeAmount,
  config,
}: {
  chainId: SushiSwapV3ChainId
  token0: Type | undefined
  token1: Type | undefined
  feeAmount: SushiSwapV3FeeAmount | undefined
  config: PublicWagmiConfig
}): Promise<SushiSwapV3Pool | null> => {
  const poolKeys: [
    Type | undefined,
    Type | undefined,
    SushiSwapV3FeeAmount | undefined,
  ][] = [[token0, token1, feeAmount]]
  return (await getConcentratedLiquidityPools({ poolKeys, chainId, config }))[0]
}
