import { ChainId } from 'sushi/chain'
import { SushiSwapV3ChainId } from 'sushi/config'
import { computeSushiSwapV3PoolAddress } from 'sushi/pool'
import { erc20ABI, readContracts } from 'wagmi'

import { getV3FactoryContractConfig } from '../../contracts/useV3FactoryContract'
import { getV3NonFungiblePositionManagerConractConfig } from '../../contracts/useV3NonFungiblePositionManager'
import { ConcentratedLiquidityPosition } from '../types'
import { getConcentratedLiquidityPositionFees } from './getConcentratedLiquidityPositionFees'
import { getConcentratedLiquidityPositionsFromTokenIds } from './getConcentratedLiquidityPositionsFromTokenIds'

const abiShard = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const getConcentratedLiquidityPositions = async ({
  account,
  chainIds,
}: {
  account: `0x${string}` | undefined
  chainIds: SushiSwapV3ChainId[]
}) => {
  if (!account) return undefined

  const result = await readContracts({
    contracts: chainIds.map(
      (el) =>
        ({
          address: getV3NonFungiblePositionManagerConractConfig(el).address,
          abi: erc20ABI,
          chainId: el,
          functionName: 'balanceOf' as const,
          args: [account],
        }) as const,
    ),
  })

  // we don't expect any account balance to ever exceed the bounds of max safe int
  const accountBalances = result.reduce<Record<ChainId, number>>(
    (acc, el, i) => {
      if (el.result && el.result > 0n) {
        acc[chainIds[i]] = Number(el.result)
      }
      return acc
    },
    {} as Record<ChainId, number>,
  )

  const tokenIdsArgs: [SushiSwapV3ChainId, `0x${string}`, number][] = []
  Object.entries(accountBalances).forEach(([k, v]) => {
    for (let i = 0; i < v; i++) {
      tokenIdsArgs.push([+k as SushiSwapV3ChainId, account, i])
    }
  })

  const tokenIdResults = await readContracts({
    contracts: tokenIdsArgs.map(
      ([_chainId, account, index]) =>
        ({
          chainId: _chainId,
          address:
            getV3NonFungiblePositionManagerConractConfig(_chainId).address,
          abi: abiShard,
          functionName: 'tokenOfOwnerByIndex' as const,
          args: [account, BigInt(index)],
        }) as const,
    ),
  })

  const tokenIds = tokenIdResults
    .map((el, i) => {
      if (!el.result) return undefined

      return {
        chainId: tokenIdsArgs[i][0],
        tokenId: el.result,
      }
    })
    .filter((el): el is NonNullable<typeof el> => el !== undefined)

  const [positions, fees] = await Promise.all([
    getConcentratedLiquidityPositionsFromTokenIds({
      tokenIds,
    }),
    getConcentratedLiquidityPositionFees({ tokenIds }),
  ])

  return positions.filter(Boolean).map((el, i) => ({
    ...el,
    address: computeSushiSwapV3PoolAddress({
      factoryAddress: getV3FactoryContractConfig(el.chainId).address,
      tokenA: el.token0,
      tokenB: el.token1,
      fee: el.fee,
    }),
    fees: fees ? fees[i] : undefined,
  })) as ConcentratedLiquidityPosition[]
}
