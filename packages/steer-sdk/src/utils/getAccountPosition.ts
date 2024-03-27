import { getChainIdAddressFromId } from 'sushi/format'

interface GetAccountPositions {
  accountBalances: { vaultId: string; balance: bigint }[]
  totalSupplies: { vaultId: string; totalSupply: bigint }[]
  vaultReserves: {
    vaultId: string
    reserve0: bigint
    reserve1: bigint
  }[]
}

export function getAccountPositions({
  accountBalances,
  totalSupplies,
  vaultReserves,
}: GetAccountPositions) {
  if (
    accountBalances.length !== totalSupplies.length ||
    accountBalances.length !== vaultReserves.length
  ) {
    throw new Error(
      'accountBalances, totalSupplies, and vaultReserves must be the same length',
    )
  }

  const vaultIds = Object.keys(accountBalances)

  return vaultIds.flatMap((vaultId) => {
    const accountBalanceEl = accountBalances.find((_) => _.vaultId === vaultId)
    const totalSupplyEl = totalSupplies.find((_) => _.vaultId === vaultId)
    const vaultReserveEl = vaultReserves.find((_) => _.vaultId === vaultId)

    if (!accountBalanceEl || !totalSupplyEl || !vaultReserveEl) {
      return []
    }

    const accountBalance = accountBalanceEl.balance
    const totalSupply = totalSupplyEl.totalSupply
    const vaultReserve = vaultReserveEl

    let token0Balance = 0n
    let token1Balance = 0n

    if (totalSupply !== 0n) {
      token0Balance = (vaultReserve.reserve0 * accountBalance) / totalSupply
      token1Balance = (vaultReserve.reserve1 * accountBalance) / totalSupply
    }

    const { address, chainId } = getChainIdAddressFromId(vaultId)
    return {
      id: vaultId,
      address,
      chainId,
      steerTokenSupply: totalSupply,
      steerTokenBalance: accountBalance,
      token0Balance,
      token1Balance,
    }
  })
}

interface GetAccountPosition {
  vaultId: string
  accountBalance: bigint
  totalSupply: bigint
  vaultReserves: {
    reserve0: bigint
    reserve1: bigint
  }
}

export async function getAccountPosition({
  vaultId,
  accountBalance,
  totalSupply,
  vaultReserves,
}: GetAccountPosition) {
  return getAccountPositions({
    accountBalances: [{ vaultId, balance: accountBalance }],
    totalSupplies: [{ vaultId, totalSupply }],
    vaultReserves: [{ vaultId, ...vaultReserves }],
  })[0]
}
