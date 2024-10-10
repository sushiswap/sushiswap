import {
  SUSHISWAP_V3_FACTORY_ADDRESS,
  SUSHISWAP_V3_POSTIION_MANAGER,
  SushiSwapV3ChainId,
  publicClientConfig,
} from 'sushi/config'
import { createClient } from 'viem'
import { readContract } from 'viem/actions'

import { computeSushiSwapV3PoolAddress } from 'sushi'
import { getFees } from './getFees'
import { getOwner } from './getOwner'

const abiShard = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'positions',
    outputs: [
      {
        internalType: 'uint96',
        name: 'nonce',
        type: 'uint96',
      },
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'token0',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'token1',
        type: 'address',
      },
      {
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24',
      },
      {
        internalType: 'int24',
        name: 'tickLower',
        type: 'int24',
      },
      {
        internalType: 'int24',
        name: 'tickUpper',
        type: 'int24',
      },
      {
        internalType: 'uint128',
        name: 'liquidity',
        type: 'uint128',
      },
      {
        internalType: 'uint256',
        name: 'feeGrowthInside0LastX128',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'feeGrowthInside1LastX128',
        type: 'uint256',
      },
      {
        internalType: 'uint128',
        name: 'tokensOwed0',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'tokensOwed1',
        type: 'uint128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const getPosition = async ({
  tokenId,
  chainId,
}: {
  tokenId: bigint
  chainId: SushiSwapV3ChainId
}) => {
  const client = createClient(publicClientConfig[chainId])

  const owner = await getOwner({ tokenId, chainId })

  const [result, fees] = await Promise.all([
    readContract(client, {
      abi: abiShard,
      address: SUSHISWAP_V3_POSTIION_MANAGER[chainId],
      functionName: 'positions',
      args: [tokenId],
    }),
    getFees({ tokenId, owner, chainId }),
  ])

  const [
    nonce,
    operator,
    token0,
    token1,
    fee,
    tickLower,
    tickUpper,
    liquidity,
    feeGrowthInside0LastX128,
    feeGrowthInside1LastX128,
    tokensOwed0,
    tokensOwed1,
  ] = result

  return {
    id: tokenId.toString(),
    address: computeSushiSwapV3PoolAddress({
      factoryAddress: SUSHISWAP_V3_FACTORY_ADDRESS[chainId],
      tokenA: token0,
      tokenB: token1,
      fee: fee,
      chainId,
    }),
    chainId,
    owner,
    tokenId,
    fee: fee,
    fees,
    feeGrowthInside0LastX128: feeGrowthInside0LastX128,
    feeGrowthInside1LastX128: feeGrowthInside1LastX128,
    liquidity: liquidity,
    nonce: nonce,
    operator: operator,
    tickLower: tickLower,
    tickUpper: tickUpper,
    token0: token0,
    token1: token1,
    tokensOwed0: tokensOwed0,
    tokensOwed1: tokensOwed1,
  }
}
