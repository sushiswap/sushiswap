import { getChainIdAddressFromId } from 'sushi/format'
import type { PublicClient } from 'viem'

import { steerMultiPositionManager } from '../abi/steerMultiPositionManager.js'

interface GetVaultsMaxTickChanges {
  client: PublicClient
  vaultIds: string[]
}

export async function getVaultsMaxTickChanges({
  client,
  vaultIds,
}: GetVaultsMaxTickChanges) {
  const result = await client.multicall({
    allowFailure: true,
    contracts: vaultIds.map((id) => {
      const { chainId, address } = getChainIdAddressFromId(id)

      return {
        abi: steerMultiPositionManager,
        chainId,
        address,
        functionName: 'maxTickChange' as const,
      }
    }),
  })

  return result.flatMap((res, i) => {
    if (typeof res.result === 'undefined') return []
    return getVaultsMaxTickChangesSelect(vaultIds[i]!, res.result)
  })
}

export function getVaultsMaxTickChangesSelect(vaultId: string, result: number) {
  return {
    vaultId,
    maxTickChange: result,
  }
}

interface GetVaultMaxTickChange {
  client: PublicClient
  vaultId: string
}

export async function getVaultMaxTickChange({
  client,
  vaultId,
}: GetVaultMaxTickChange) {
  const results = await getVaultsMaxTickChanges({ client, vaultIds: [vaultId] })

  if (!results[0]) {
    throw new Error(`Failed to fetch max tick change for vault ${vaultId}`)
  }

  return results[0]
}
