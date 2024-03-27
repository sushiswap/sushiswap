import { erc20Abi } from 'sushi/abi'
import { getChainIdAddressFromId } from 'sushi/format'
import type { PublicClient } from 'viem'

interface GetTotalSuppliesContracts {
  vaultIds: string[]
}

export function getTotalSuppliesContracts({
  vaultIds,
}: GetTotalSuppliesContracts) {
  return vaultIds.map((id) => {
    const { chainId, address } = getChainIdAddressFromId(id)

    return {
      abi: erc20Abi,
      chainId,
      address,
      functionName: 'totalSupply' as const,
    }
  })
}

interface GetTotalSupplies extends GetTotalSuppliesContracts {
  client: PublicClient
}

export async function getTotalSupplies({ client, vaultIds }: GetTotalSupplies) {
  const result = await client.multicall({
    allowFailure: true,
    contracts: getTotalSuppliesContracts({ vaultIds }),
  })

  return result.flatMap((res, i) => {
    if (typeof res.result === 'undefined') return []
    return getTotalSuppliesSelect(vaultIds[i]!, res.result)
  })
}

export function getTotalSuppliesSelect(
  vaultId: string,
  result: bigint,
): { vaultId: string; totalSupply: bigint } {
  return {
    vaultId,
    totalSupply: result,
  }
}

interface GetTotalSupply {
  client: PublicClient
  vaultId: string
}

export async function getTotalSupply({ client, vaultId }: GetTotalSupply) {
  const results = await getTotalSupplies({ client, vaultIds: [vaultId] })

  if (!results[0]) {
    throw new Error(`Failed to fetch total supply for vault ${vaultId}`)
  }

  return results[0]!.totalSupply
}
