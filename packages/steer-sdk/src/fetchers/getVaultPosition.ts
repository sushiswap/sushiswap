import { getChainIdAddressFromId } from 'sushi/format'
import type { PublicClient } from 'viem'

import { steerMultiPositionManager } from '../abi/steerMultiPositionManager.js'

interface GetVaultPositionsContracts {
  vaultIds: string[]
}

export function getVaultPositionsContracts({
  vaultIds,
}: GetVaultPositionsContracts) {
  return vaultIds.map((id) => {
    const { chainId, address } = getChainIdAddressFromId(id)

    return {
      abi: steerMultiPositionManager,
      chainId,
      address,
      functionName: 'getPositions' as const,
    }
  })
}

interface GetVaultsPositions extends GetVaultPositionsContracts {
  client: PublicClient
}

export async function getVaultsPositions({
  client,
  vaultIds,
}: GetVaultsPositions) {
  const result = await client.multicall({
    allowFailure: true,
    contracts: getVaultPositionsContracts({ vaultIds }),
  })

  return result.flatMap((res, i) => {
    if (typeof res.result === 'undefined') return []
    return getVaultsPositionSelect(vaultIds[i]!, res.result)
  })
}

export function getVaultsPositionSelect(
  vaultId: string,
  result: Readonly<
    [Readonly<number[]>, Readonly<number[]>, Readonly<number[]>]
  >,
) {
  const lowerTicks = result[0]
  const upperTicks = result[1]
  const relativeWeights = result[2]

  return lowerTicks.map((_, i) => ({
    vaultId,
    lowerTick: BigInt(lowerTicks[i]!.toString()),
    upperTick: BigInt(upperTicks[i]!.toString()),
    relativeWeight: BigInt(relativeWeights[i]!.toString()),
  }))
}

interface GetVaultPositions {
  client: PublicClient
  vaultId: string
}

export async function getVaultPositions({
  client,
  vaultId,
}: GetVaultPositions) {
  const results = await getVaultsPositions({ client, vaultIds: [vaultId] })
  return results
}
