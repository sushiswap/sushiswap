import { getChainIdAddressFromId } from 'sushi/format'
import type { PublicClient } from 'viem'
import { steerPeripheryAbi } from '../abi/steerPeripheryAbi'
import { STEER_PERIPHERY_ADDRESS, isSteerChainId } from '../constants'

interface GetVaultsReservesContracts {
  vaultIds: string[]
}

export function getVaultsReservesContracts({
  vaultIds,
}: GetVaultsReservesContracts) {
  return vaultIds.map((id) => {
    const { chainId, address } = getChainIdAddressFromId(id)

    if (!isSteerChainId(chainId)) throw new Error(`Invalid chainId: ${chainId}`)

    const steerPeriphery = STEER_PERIPHERY_ADDRESS[chainId]

    return {
      abi: steerPeripheryAbi,
      address: steerPeriphery,
      chainId,
      args: [address] as const,
      functionName: 'vaultBalancesByAddressWithFees' as const,
    }
  })
}

interface GetVaultsReserves extends GetVaultsReservesContracts {
  client: PublicClient
}

export async function getVaultsReserves({
  client,
  vaultIds,
}: GetVaultsReserves) {
  const result = await client.multicall({
    allowFailure: true,
    contracts: getVaultsReservesContracts({ vaultIds }),
  })

  return result.map((res, i) => {
    if (typeof res.result === 'undefined') return null
    return getVaultsReservesSelect(vaultIds[i]!, res.result)
  })
}

export function getVaultsReservesSelect(
  vaultId: string,
  result: { amountToken0: bigint; amountToken1: bigint },
) {
  return {
    vaultId,
    reserve0: result.amountToken0,
    reserve1: result.amountToken1,
  }
}

interface GetVaultReserves {
  client: PublicClient
  vaultId: string
}

export async function getVaultReserves({ client, vaultId }: GetVaultReserves) {
  const results = await getVaultsReserves({ client, vaultIds: [vaultId] })

  if (!results[0]) {
    throw new Error(`Failed to fetch reserves for vaultId: ${vaultId}`)
  }

  return results[0]!
}
