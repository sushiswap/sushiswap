import { SushiSwapV3Pool, computeSushiSwapV3PoolAddress } from 'sushi'
import {
  SUSHISWAP_V3_FACTORY_ADDRESS,
  SushiSwapV3ChainId,
  SushiSwapV3FeeAmount,
  publicClientConfig,
} from 'sushi/config'
import { Token } from 'sushi/currency'
import { Address, createClient } from 'viem'
import { multicall } from 'viem/actions'

const abiShard = [
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
  {
    inputs: [],
    name: 'liquidity',
    outputs: [{ internalType: 'uint128', name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const getPool = async ({
  token0,
  token1,
  feeAmount,
  chainId,
}: {
  token0: Token
  token1: Token
  feeAmount: SushiSwapV3FeeAmount
  chainId: SushiSwapV3ChainId
}) => {
  const client = createClient(publicClientConfig[chainId])

  const poolAddress = computeSushiSwapV3PoolAddress({
    factoryAddress: SUSHISWAP_V3_FACTORY_ADDRESS[chainId],
    tokenA: token0,
    tokenB: token1,
    fee: feeAmount,
  }) as Address

  const [slot0, liquidity] = await multicall(client, {
    allowFailure: false,
    contracts: [
      { abi: abiShard, address: poolAddress, functionName: 'slot0' },
      { abi: abiShard, address: poolAddress, functionName: 'liquidity' },
    ],
  })

  const [sqrtPriceX96, tick] = slot0

  return {
    poolAddress,
    pool: new SushiSwapV3Pool(
      token0,
      token1,
      feeAmount,
      sqrtPriceX96,
      liquidity,
      tick,
    ),
  }
}
