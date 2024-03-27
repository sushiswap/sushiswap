import { SushiSwapV3ChainId } from 'sushi/config'
import { computeSushiSwapV3PoolAddress } from 'sushi/pool'

import { PublicWagmiConfig } from '@sushiswap/wagmi-config'
import { readContracts } from '@wagmi/core/actions'
import { getV3FactoryContractConfig } from '../../contracts/useV3FactoryContract'
import { getV3NonFungiblePositionManagerContractConfig } from '../../contracts/useV3NonFungiblePositionManager'
import { ConcentratedLiquidityPosition } from '../types'
import { getConcentratedLiquidityPositionFees } from './getConcentratedLiquidityPositionFees'

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

export const getConcentratedLiquidityPositionsFromTokenIds = async ({
  tokenIds,
  config,
}: {
  tokenIds: { chainId: SushiSwapV3ChainId; tokenId: bigint }[]
  config: PublicWagmiConfig
}): Promise<ConcentratedLiquidityPosition[]> => {
  const results = await readContracts(config, {
    contracts: tokenIds.map((el) => ({
      address: getV3NonFungiblePositionManagerContractConfig(el.chainId)
        .address,
      abi: abiShard,
      chainId: el.chainId,
      functionName: 'positions',
      args: [el.tokenId],
    })),
  }).then((results) => results.map((el) => el.result))

  const fees = await getConcentratedLiquidityPositionFees({ tokenIds, config })

  return results
    .map((result, i) => {
      const _fees = fees[i]
      if (!_fees || !result) return undefined

      const { tokenId, chainId } = tokenIds[i]
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
          factoryAddress: getV3FactoryContractConfig(chainId).address,
          tokenA: token0,
          tokenB: token1,
          fee: fee,
        }),
        chainId,
        tokenId,
        fee: fee,
        fees: [_fees[0], _fees[1]],
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
    })
    .filter((el): el is NonNullable<typeof el> => el !== undefined)
}
