import { erc20Abi } from 'sushi/abi'
import { getChainIdAddressFromId } from 'sushi/format'
import type { Address, PublicClient } from 'viem'

interface GetBalanceOfsContracts {
  account: Address
  vaultIds: string[]
}

export function getBalanceOfsContracts({
  account,
  vaultIds,
}: GetBalanceOfsContracts) {
  return vaultIds.map((id) => {
    const { chainId, address } = getChainIdAddressFromId(id)

    return {
      abi: erc20Abi,
      chainId,
      address,
      args: [account] as const,
      functionName: 'balanceOf' as const,
    }
  })
}

interface GetBalanceOfs extends GetBalanceOfsContracts {
  client: PublicClient
}

export async function getBalanceOfs({
  client,
  account,
  vaultIds,
}: GetBalanceOfs) {
  const result = await client.multicall({
    allowFailure: true,
    contracts: getBalanceOfsContracts({ account, vaultIds }),
  })

  return result.flatMap((res, i) => {
    if (typeof res.result === 'undefined') return []
    return getBalanceOfsSelect(vaultIds[i]!, res.result)
  })
}

export function getBalanceOfsSelect(
  vaultId: string,
  result: bigint,
): { vaultId: string; balance: bigint } {
  return {
    vaultId,
    balance: result,
  }
}

interface GetBalanceOf {
  client: PublicClient
  account: Address
  vaultId: string
}

export async function getBalanceOf({ client, account, vaultId }: GetBalanceOf) {
  const results = await getBalanceOfs({ client, account, vaultIds: [vaultId] })

  if (!results[0]) {
    throw new Error(`Failed to fetch balance of for vault ${vaultId}`)
  }

  return results[0]!.balance
}
